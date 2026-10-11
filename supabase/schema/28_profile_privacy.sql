-- Profile privacy (public + demo).
-- profiles used to be readable by everyone, which exposed every user's e-mail address and role.
-- Now the table is readable only by the owner and admins. Names and avatars that must be shown
-- publicly (comment authors) come from the public_profiles view, which has no e-mail or role.
-- app_config (which holds the bootstrap admin e-mail) is no longer publicly readable either:
-- only security-definer functions and admins use it.

do $$
declare
  s text;
begin
  foreach s in array array['public', 'demo'] loop
    execute format(
      'create or replace view %1$I.public_profiles with (security_invoker = false) as select id, name, avatar_url, created_at from %1$I.profiles',
      s
    );
    execute format('grant select on %I.public_profiles to anon, authenticated', s);

    execute format('drop policy if exists profiles_select on %I.profiles', s);
    execute format(
      'create policy profiles_select on %1$I.profiles for select to authenticated using (id = auth.uid() or %1$I.is_admin())',
      s
    );
    execute format('revoke select on %I.profiles from anon', s);

    execute format('drop policy if exists app_config_public_read on %I.app_config', s);
    execute format('revoke select on %I.app_config from anon', s);
  end loop;
end
$$;
