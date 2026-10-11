-- Changing a user's role now requires a fresh sign-in (public + demo).
-- Besides the admin check that already existed, the caller must have authenticated (password,
-- OAuth, ...) within the last 5 minutes - according to the amr claim of their session token -
-- and the function refuses to change the admin's own role or to remove the last admin. The
-- admin therefore has to re-enter their password right before promoting or demoting somebody,
-- so a role can't be changed by accident or from a forgotten, still-open session.

do $$
declare
  s text;
begin
  foreach s in array array['public', 'demo'] loop
    execute format($f$
      create or replace function %1$I.admin_update_user_role(target_user_id uuid, new_role public.user_role)
      returns %1$I.profiles
      language plpgsql
      security definer
      set search_path = ''
      as $fn$
      declare
        result %1$I.profiles;
        current_role_value public.user_role;
      begin
        if not %1$I.is_admin() then
          raise exception 'אין הרשאה לעדכן תפקידים';
        end if;

        if new_role not in ('user'::public.user_role, 'admin'::public.user_role) then
          raise exception 'תפקיד לא תקין';
        end if;

        if not exists (
          select 1
          from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb)) as a
          where (a ->> 'timestamp')::bigint > extract(epoch from now())::bigint - 300
        ) then
          raise exception 'נדרש אימות מחדש: הזינו שוב את הסיסמה כדי לשנות תפקיד';
        end if;

        if target_user_id = auth.uid() then
          raise exception 'אי אפשר לשנות את התפקיד של עצמך';
        end if;

        select role into current_role_value from %1$I.profiles where id = target_user_id;
        if current_role_value = 'admin' and new_role <> 'admin'
           and (select count(*) from %1$I.profiles where role = 'admin') <= 1 then
          raise exception 'אי אפשר להסיר את המנהל האחרון';
        end if;

        update %1$I.profiles set role = new_role where id = target_user_id returning * into result;

        if result.id is null then
          raise exception 'משתמש לא נמצא';
        end if;

        return result;
      end
      $fn$
    $f$, s);

    -- keep the earlier privilege rules: only signed-in users may call it
    execute format('revoke all on function %I.admin_update_user_role(uuid, public.user_role) from public, anon', s);
    execute format('grant execute on function %I.admin_update_user_role(uuid, public.user_role) to authenticated', s);
  end loop;
end
$$;
