-- TravelIsrael — public schema functions, RPCs and triggers.
--
-- Callable from the client via supabase.rpc():
--   resolve_bootstrap_role(user_email)     -> user_role
--   sync_bootstrap_admin(user_id, email)   -> profiles
--   admin_update_user_role(target, role)   -> profiles
--   approve_trip_cascade(trip_id)          -> trips
--
-- The RPCs are SECURITY DEFINER so they can bypass RLS, and each one
-- re-checks permissions internally via is_admin() before mutating.
--
-- Not included here: public.rls_auto_enable(), an event trigger managed by
-- the Supabase platform that auto-enables RLS on newly created tables.

-- ── Helpers ──────────────────────────────────────────────────

create or replace function public.is_admin()
  returns boolean
  language sql
  stable
  security definer
  set search_path to 'public'
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'::user_role
  );
$$;

-- Keeps the denormalised region code and the region_id foreign key in sync,
-- whichever side the caller happens to set.
create or replace function public.sync_entity_region()
  returns trigger
  language plpgsql
as $$
begin
  if NEW.region_id is not null then
    select code into NEW.region
    from public.regions
    where id = NEW.region_id and is_selectable = true;

    if NEW.region is null then
      raise exception 'region_id must reference a selectable region';
    end if;
  elsif NEW.region is not null and btrim(NEW.region) <> '' then
    select id into NEW.region_id
    from public.regions
    where code = NEW.region and is_selectable = true;

    if NEW.region_id is null then
      raise exception 'Unknown region code: %', NEW.region;
    end if;
  end if;

  return NEW;
end;
$$;

-- ── Bootstrap admin ──────────────────────────────────────────

-- First user ever registered becomes admin. After that, only the address
-- stored in app_config.bootstrap_admin_email is promoted.
create or replace function public.resolve_bootstrap_role(user_email text)
  returns user_role
  language plpgsql
  security definer
  set search_path to 'public'
as $$
declare
  bootstrap_email text;
  admin_count integer;
  normalized_email text;
begin
  normalized_email := lower(trim(coalesce(user_email, '')));

  select count(*)::integer into admin_count
  from public.profiles
  where role = 'admin'::user_role;

  if admin_count = 0 then
    return 'admin'::user_role;
  end if;

  select nullif(trim(value), '') into bootstrap_email
  from public.app_config
  where key = 'bootstrap_admin_email';

  if bootstrap_email is not null and normalized_email = lower(bootstrap_email) then
    return 'admin'::user_role;
  end if;

  return 'user'::user_role;
end;
$$;

create or replace function public.sync_bootstrap_admin(user_id uuid, user_email text)
  returns public.profiles
  language plpgsql
  security definer
  set search_path to 'public'
as $$
declare
  target_role user_role;
  updated_row public.profiles;
begin
  target_role := public.resolve_bootstrap_role(user_email);

  -- Bootstrap may only promote to admin; never demote manually assigned roles
  if target_role = 'admin'::user_role then
    update public.profiles
    set role = 'admin'::user_role
    where id = user_id
      and role is distinct from 'admin'::user_role
    returning * into updated_row;
  end if;

  if updated_row.id is null then
    select * into updated_row from public.profiles where id = user_id;
  end if;

  return updated_row;
end;
$$;

-- ── Admin RPCs ───────────────────────────────────────────────

create or replace function public.admin_update_user_role(target_user_id uuid, new_role user_role)
  returns public.profiles
  language plpgsql
  security definer
  set search_path to 'public'
as $$
declare
  result public.profiles;
begin
  if not public.is_admin() then
    raise exception 'אין הרשאה לעדכן תפקידים';
  end if;

  if new_role not in ('user'::user_role, 'admin'::user_role) then
    raise exception 'תפקיד לא תקין';
  end if;

  update public.profiles
  set role = new_role
  where id = target_user_id
  returning * into result;

  if result.id is null then
    raise exception 'משתמש לא נמצא';
  end if;

  return result;
end;
$$;

-- Approving a trip also approves any pending place/trail it depends on,
-- so an admin never has to approve stations one by one.
create or replace function public.approve_trip_cascade(trip_id uuid)
  returns public.trips
  language plpgsql
  security definer
  set search_path to 'public'
as $$
declare
  result public.trips;
begin
  if not public.is_admin() then
    raise exception 'אין הרשאה לאשר טיולים';
  end if;

  update public.places p
  set status = 'approved'::status, rejection_reason = null, updated_at = now()
  from public.trip_stations ts
  where ts.trip_id = approve_trip_cascade.trip_id
    and ts.place_id = p.id
    and p.status = 'pending'::status;

  update public.trails t
  set status = 'approved'::status, rejection_reason = null, updated_at = now()
  from public.trip_stations ts
  where ts.trip_id = approve_trip_cascade.trip_id
    and ts.trail_id = t.id
    and t.status = 'pending'::status;

  update public.trips
  set status = 'approved'::status, rejection_reason = null, updated_at = now()
  where id = approve_trip_cascade.trip_id
  returning * into result;

  if result.id is null then
    raise exception 'טיול לא נמצא';
  end if;

  return result;
end;
$$;

-- ── Auth hook ────────────────────────────────────────────────

-- Runs on auth.users insert. Mirrors the profile into the demo schema too so
-- both environments share the same accounts; a demo failure must never block
-- a real signup, hence the swallowed exception.
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $$
declare
  profile_name text;
  profile_role user_role;
begin
  profile_name := coalesce(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1),
    'משתמש'
  );

  profile_role := public.resolve_bootstrap_role(NEW.email);

  insert into public.profiles (id, name, email, role, avatar_url)
  values (
    NEW.id,
    profile_name,
    coalesce(NEW.email, ''),
    profile_role,
    coalesce(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    role = excluded.role,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  begin
    insert into demo.profiles (id, name, email, role, avatar_url)
    values (
      NEW.id,
      profile_name,
      coalesce(NEW.email, ''),
      demo.resolve_bootstrap_role(NEW.email),
      coalesce(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    )
    on conflict (id) do update set
      name = excluded.name,
      email = excluded.email,
      avatar_url = coalesce(excluded.avatar_url, demo.profiles.avatar_url);
  exception when others then
    raise log 'handle_new_user: demo profile sync skipped for %', NEW.id;
  end;

  return NEW;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Triggers ─────────────────────────────────────────────────

create trigger places_sync_region before insert or update of region, region_id
  on public.places for each row execute function public.sync_entity_region();

create trigger trails_sync_region before insert or update of region, region_id
  on public.trails for each row execute function public.sync_entity_region();

create trigger trips_sync_region before insert or update of region, region_id
  on public.trips for each row execute function public.sync_entity_region();
