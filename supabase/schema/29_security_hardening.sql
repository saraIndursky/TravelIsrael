-- Security hardening (public + demo).
--
-- Found by testing as a regular signed-in user:
--  A) a user could set their own profiles.role to 'admin' (full takeover);
--  B) a user could INSERT a trip/place/trail directly with status 'approved', skipping moderation;
--  C) a user could forge trips.views_count / favorites_count / avg_rating on their own trip.
--
-- Rules enforced here for direct API calls (roles 'anon' / 'authenticated'); SECURITY DEFINER
-- functions run as their owner and are not affected, which is how admins legitimately change roles:
--  * only an admin can change a role (new profiles are always created as 'user');
--  * non-admins may only create content as 'draft' or 'pending';
--  * popularity counters are maintained by triggers / an RPC, never written by clients;
--  * basic length and URL checks on user text;
--  * sensitive functions are no longer executable by anonymous visitors.

do $$
declare
  s text;
  t text;
  fn regprocedure;
begin
  foreach s in array array['public', 'demo'] loop

    -- A) role protection ---------------------------------------------------------------
    execute format($f$
      create or replace function %1$I.protect_profile_role()
      returns trigger
      language plpgsql
      set search_path = %1$I, public
      as $fn$
      begin
        if current_user in ('anon', 'authenticated') and not %1$I.is_admin() then
          if tg_op = 'INSERT' then
            new.role := 'user';
          elsif new.role is distinct from old.role then
            raise exception 'only an admin can change a role' using errcode = '42501';
          end if;
        end if;
        return new;
      end
      $fn$
    $f$, s);
    execute format('drop trigger if exists profiles_protect_role on %I.profiles', s);
    execute format('create trigger profiles_protect_role before insert or update on %1$I.profiles for each row execute function %1$I.protect_profile_role()', s);

    -- B) content can only be created as draft / pending by non-admins --------------------
    foreach t in array array['places', 'trails', 'trips'] loop
      execute format('drop policy if exists %I_insert on %I.%I', t, s, t);
      execute format(
        'create policy %2$I_insert on %1$I.%2$I for insert to authenticated with check (%1$I.is_admin() or (created_by = auth.uid() and status in (''draft'', ''pending'')))',
        s, t
      );
    end loop;

    -- C) trip counters ------------------------------------------------------------------
    execute format($f$
      create or replace function %1$I.protect_trip_counters()
      returns trigger
      language plpgsql
      set search_path = %1$I, public
      as $fn$
      begin
        if current_user in ('anon', 'authenticated') and not %1$I.is_admin() then
          if tg_op = 'INSERT' then
            new.views_count := 0;
            new.favorites_count := 0;
            new.avg_rating := 0;
          else
            new.views_count := old.views_count;
            new.favorites_count := old.favorites_count;
            new.avg_rating := old.avg_rating;
          end if;
        end if;
        return new;
      end
      $fn$
    $f$, s);
    execute format('drop trigger if exists trips_protect_counters on %I.trips', s);
    execute format('create trigger trips_protect_counters before insert or update on %1$I.trips for each row execute function %1$I.protect_trip_counters()', s);

    execute format($f$
      create or replace function %1$I.sync_trip_favorites()
      returns trigger
      language plpgsql
      security definer
      set search_path = %1$I, public
      as $fn$
      declare
        v_id uuid := coalesce(new.entity_id, old.entity_id);
        v_type text := coalesce(new.entity_type, old.entity_type)::text;
      begin
        if v_type = 'trip' then
          update %1$I.trips set favorites_count = (
            select count(*) from %1$I.favorites f where f.entity_type = 'trip' and f.entity_id = v_id
          ) where id = v_id;
        end if;
        return null;
      end
      $fn$
    $f$, s);
    execute format('drop trigger if exists favorites_sync_trip_count on %I.favorites', s);
    execute format('create trigger favorites_sync_trip_count after insert or delete on %1$I.favorites for each row execute function %1$I.sync_trip_favorites()', s);

    execute format($f$
      create or replace function %1$I.sync_trip_rating()
      returns trigger
      language plpgsql
      security definer
      set search_path = %1$I, public
      as $fn$
      declare
        v_id uuid := coalesce(new.entity_id, old.entity_id);
        v_type text := coalesce(new.entity_type, old.entity_type)::text;
      begin
        if v_type = 'trip' then
          update %1$I.trips set avg_rating = coalesce((
            select round(avg(r.score)::numeric, 1) from %1$I.ratings r where r.entity_type = 'trip' and r.entity_id = v_id
          ), 0) where id = v_id;
        end if;
        return null;
      end
      $fn$
    $f$, s);
    execute format('drop trigger if exists ratings_sync_trip_rating on %I.ratings', s);
    execute format('create trigger ratings_sync_trip_rating after insert or update or delete on %1$I.ratings for each row execute function %1$I.sync_trip_rating()', s);

    execute format($f$
      create or replace function %1$I.increment_trip_views(p_trip_id uuid)
      returns void
      language sql
      security definer
      set search_path = %1$I, public
      as $fn$
        update %1$I.trips set views_count = views_count + 1 where id = p_trip_id and status = 'approved'
      $fn$
    $f$, s);

    -- text and URL sanity ----------------------------------------------------------------
    execute format('alter table %I.comments drop constraint if exists comments_content_length', s);
    execute format('alter table %I.comments add constraint comments_content_length check (char_length(content) between 1 and 2000) not valid', s);
    execute format('alter table %I.reports drop constraint if exists reports_reason_length', s);
    execute format('alter table %I.reports add constraint reports_reason_length check (char_length(reason) between 1 and 2000) not valid', s);
    execute format('alter table %I.images drop constraint if exists images_url_https', s);
    execute format('alter table %I.images add constraint images_url_https check (url ~* ''^https://'' and char_length(url) <= 1000) not valid', s);

    -- who may execute what -----------------------------------------------------------------
    -- RPCs used by signed-in users (they check the caller inside)
    for fn in
      select p.oid::regprocedure from pg_proc p
      where p.pronamespace = s::regnamespace
        and p.proname in ('admin_update_user_role', 'approve_trip_cascade', 'resolve_bootstrap_role', 'sync_bootstrap_admin')
    loop
      execute format('revoke all on function %s from public, anon', fn);
      execute format('grant execute on function %s to authenticated', fn);
    end loop;
    -- public view counter
    for fn in
      select p.oid::regprocedure from pg_proc p where p.pronamespace = s::regnamespace and p.proname = 'increment_trip_views'
    loop
      execute format('revoke all on function %s from public', fn);
      execute format('grant execute on function %s to anon, authenticated', fn);
    end loop;
    -- trigger-only functions: nobody calls them directly
    for fn in
      select p.oid::regprocedure from pg_proc p
      where p.pronamespace = s::regnamespace
        and p.proname in ('enqueue_moderation_from_comment', 'enqueue_moderation_from_image', 'dequeue_moderation_comment',
                          'dequeue_moderation_image', 'approve_region_with_content', 'handle_new_user', 'rls_auto_enable',
                          'entity_display_name', 'sync_trip_favorites', 'sync_trip_rating')
    loop
      execute format('revoke all on function %s from public, anon, authenticated', fn);
    end loop;
  end loop;
end
$$;
