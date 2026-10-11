-- Self-service account deletion (public + demo).
--
-- A system profile ("TravelIsrael", an admin that nobody can sign in as: no password, e-mail on the
-- reserved .invalid domain) takes over everything the leaving user published, so approved trips,
-- places, trails and gallery photos stay on the site. Drafts, pending and rejected content, the
-- user's comments, ratings, favourites, reports and notifications are deleted with the account.
--
-- delete_my_account() requires a fresh sign-in (the same amr check as role changes) and refuses to
-- delete the last real admin.

do $$
declare
  system_id constant uuid := '00000000-0000-4000-8000-000000000001';
  s text;
begin
  if not exists (select 1 from auth.users where id = system_id) then
    insert into auth.users (
      id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, is_sso_user, is_anonymous
    ) values (
      system_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'system@travelisrael.invalid', '{"provider":"system","providers":[]}'::jsonb,
      '{"name":"TravelIsrael"}'::jsonb, now(), now(), false, false
    );
  end if;

  foreach s in array array['public', 'demo'] loop
    execute format(
      'insert into %I.profiles (id, name, email, role) values (%L, %L, %L, %L) on conflict (id) do update set name = excluded.name, role = excluded.role',
      s, system_id, 'TravelIsrael', 'system@travelisrael.invalid', 'admin');

    execute format($f$
      create or replace function %1$I.delete_my_account()
      returns void
      language plpgsql
      security definer
      set search_path = ''
      as $fn$
      declare
        uid uuid := auth.uid();
        system_id constant uuid := '00000000-0000-4000-8000-000000000001';
        my_role public.user_role;
      begin
        if uid is null then
          raise exception 'נדרשת התחברות';
        end if;
        if uid = system_id then
          raise exception 'אי אפשר למחוק את פרופיל המערכת';
        end if;

        if not exists (
          select 1
          from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb)) as a
          where (a ->> 'timestamp')::bigint > extract(epoch from now())::bigint - 300
        ) then
          raise exception 'נדרש אימות מחדש: הזינו שוב את הסיסמה כדי למחוק את החשבון';
        end if;

        select role into my_role from %1$I.profiles where id = uid;
        if my_role = 'admin'
           and (select count(*) from %1$I.profiles where role = 'admin' and id <> system_id) <= 1 then
          raise exception 'אי אפשר למחוק את המנהל האחרון';
        end if;

        -- published content stays, owned by the system profile
        update %1$I.places set created_by = system_id where created_by = uid and status = 'approved';
        update %1$I.trails set created_by = system_id where created_by = uid and status = 'approved';
        update %1$I.trips  set created_by = system_id where created_by = uid and status = 'approved';
        update %1$I.images set user_id = system_id where user_id = uid;

        -- everything unpublished goes away with the account
        delete from %1$I.places where created_by = uid;
        delete from %1$I.trails where created_by = uid;
        delete from %1$I.trips  where created_by = uid;

        -- the profile and the rest (comments, ratings, favourites, reports, notifications) cascade
        delete from auth.users where id = uid;
      end
      $fn$
    $f$, s);

    execute format('revoke all on function %I.delete_my_account() from public, anon', s);
    execute format('grant execute on function %I.delete_my_account() to authenticated', s);

    -- the system profile can't be given or lose a role through the admin screen
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

        if target_user_id = '00000000-0000-4000-8000-000000000001' then
          raise exception 'אי אפשר לשנות את פרופיל המערכת';
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
  end loop;
end
$$;

notify pgrst, 'reload schema';
