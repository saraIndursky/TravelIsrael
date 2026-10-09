-- TravelIsrael — the `demo` schema.
--
-- A full mirror of `public` inside the same Supabase project, used to exercise
-- flows against rich test data without touching production. The app switches
-- between them with NEXT_PUBLIC_SUPABASE_SCHEMA=public|demo.
--
-- Shared with public: auth.users (same accounts), Storage, and all enums.
-- Everything else is independent, including is_admin() and the RPCs.
--
-- Dashboard step that cannot be scripted: add `demo` to
-- Settings -> API -> Exposed schemas, otherwise PostgREST will not serve it.
--
-- Known drift from public, kept as-is because it only affects test data:
--   *.region_id                     demo: set null   public: restrict
--   regions.parent_id               demo: cascade    public: restrict
--   trip_stations.place_id/trail_id demo: cascade    public: set null
--   demo has no region_id indexes

create schema if not exists demo;

grant usage on schema demo to anon, authenticated, service_role;
alter default privileges in schema demo
  grant select, insert, update, delete on tables to anon, authenticated, service_role;

-- ── Tables ───────────────────────────────────────────────────

create table if not exists demo.profiles (
  id uuid not null,
  name text not null,
  email text not null,
  role user_role default 'user'::user_role not null,
  avatar_url text,
  created_at timestamp with time zone default now() not null
);

create table if not exists demo.regions (
  id uuid default gen_random_uuid() not null,
  name text not null,
  code text,
  parent_id uuid,
  sort_order integer default 0 not null,
  is_selectable boolean default false not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists demo.places (
  id uuid default gen_random_uuid() not null,
  name text not null,
  short_description text not null,
  full_description text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  region text not null,
  place_type text not null,
  accessibility smallint not null,
  tags text[] default '{}'::text[] not null,
  avg_duration_minutes integer default 0 not null,
  estimated_price integer default 0 not null,
  opening_time text,
  closing_time text,
  phone text,
  website text,
  image_url text not null,
  created_by uuid,
  status status default 'draft'::status not null,
  rejection_reason text,
  updated_at timestamp with time zone default now() not null,
  region_id uuid
);

create table if not exists demo.trails (
  id uuid default gen_random_uuid() not null,
  name text not null,
  short_description text not null,
  full_description text not null,
  region text not null,
  trail_type text not null,
  length_km double precision default 0 not null,
  duration_minutes integer default 0 not null,
  difficulty difficulty default 'easy'::difficulty not null,
  accessibility smallint not null,
  tags text[] default '{}'::text[] not null,
  estimated_price integer default 0 not null,
  operating_hours text,
  start_lat double precision not null,
  start_lng double precision not null,
  end_lat double precision not null,
  end_lng double precision not null,
  waypoints jsonb default '[]'::jsonb not null,
  image_url text not null,
  created_by uuid,
  status status default 'draft'::status not null,
  rejection_reason text,
  updated_at timestamp with time zone default now() not null,
  region_id uuid
);

create table if not exists demo.trips (
  id uuid default gen_random_uuid() not null,
  name text not null,
  short_description text not null,
  full_description text not null,
  main_image text not null,
  gallery_images text[] default '{}'::text[] not null,
  tags text[] default '{}'::text[] not null,
  created_by uuid,
  status status default 'draft'::status not null,
  total_duration_minutes integer default 0 not null,
  total_distance_km double precision default 0 not null,
  estimated_price integer default 0 not null,
  difficulty difficulty default 'easy'::difficulty not null,
  accessibility smallint not null,
  region text not null,
  station_count integer default 0 not null,
  views_count integer default 0 not null,
  favorites_count integer default 0 not null,
  avg_rating double precision default 0 not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  rejection_reason text,
  region_id uuid
);

create table if not exists demo.trip_stations (
  id uuid default gen_random_uuid() not null,
  trip_id uuid not null,
  order_index integer default 0 not null,
  station_type station_type not null,
  place_id uuid,
  trail_id uuid,
  travel_mode travel_mode
);

create table if not exists demo.ratings (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  entity_type entity_type not null,
  entity_id uuid not null,
  score smallint not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists demo.comments (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  entity_type entity_type not null,
  entity_id uuid not null,
  content text not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists demo.favorites (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  entity_type entity_type not null,
  entity_id uuid not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists demo.images (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  entity_type entity_type not null,
  entity_id uuid not null,
  url text not null,
  storage_path text not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists demo.reports (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  entity_type entity_type not null,
  entity_id uuid not null,
  report_type report_type default 'problem'::report_type not null,
  reason text not null,
  status report_status default 'pending'::report_status not null,
  created_at timestamp with time zone default now() not null,
  resolved_at timestamp with time zone,
  resolved_by uuid
);

create table if not exists demo.app_config (
  key text not null,
  value text not null,
  updated_at timestamp with time zone default now() not null
);

-- ── Constraints ──────────────────────────────────────────────

alter table demo.profiles      add constraint profiles_pkey      primary key (id);
alter table demo.regions       add constraint regions_pkey       primary key (id);
alter table demo.places        add constraint places_pkey        primary key (id);
alter table demo.trails        add constraint trails_pkey        primary key (id);
alter table demo.trips         add constraint trips_pkey         primary key (id);
alter table demo.trip_stations add constraint trip_stations_pkey primary key (id);
alter table demo.ratings       add constraint ratings_pkey       primary key (id);
alter table demo.comments      add constraint comments_pkey      primary key (id);
alter table demo.favorites     add constraint favorites_pkey     primary key (id);
alter table demo.images        add constraint images_pkey        primary key (id);
alter table demo.reports       add constraint reports_pkey       primary key (id);
alter table demo.app_config    add constraint app_config_pkey    primary key (key);

alter table demo.regions   add constraint regions_code_key unique (code);
alter table demo.ratings   add constraint ratings_user_id_entity_type_entity_id_key   unique (user_id, entity_type, entity_id);
alter table demo.favorites add constraint favorites_user_id_entity_type_entity_id_key unique (user_id, entity_type, entity_id);

alter table demo.places  add constraint places_accessibility_check check ((accessibility >= 1) and (accessibility <= 5));
alter table demo.trails  add constraint trails_accessibility_check check ((accessibility >= 1) and (accessibility <= 5));
alter table demo.trips   add constraint trips_accessibility_check  check ((accessibility >= 1) and (accessibility <= 5));
alter table demo.ratings add constraint ratings_score_check        check ((score >= 1) and (score <= 5));
alter table demo.regions add constraint regions_selectable_requires_code
  check (((is_selectable = true) and (code is not null)) or (is_selectable = false));

alter table demo.profiles      add constraint profiles_id_fkey            foreign key (id)          references auth.users(id)    on delete cascade;
alter table demo.regions       add constraint regions_parent_id_fkey      foreign key (parent_id)   references demo.regions(id)  on delete cascade;

alter table demo.places        add constraint places_created_by_fkey      foreign key (created_by)  references demo.profiles(id) on delete set null;
alter table demo.places        add constraint places_region_id_fkey       foreign key (region_id)   references demo.regions(id)  on delete set null;
alter table demo.trails        add constraint trails_created_by_fkey      foreign key (created_by)  references demo.profiles(id) on delete set null;
alter table demo.trails        add constraint trails_region_id_fkey       foreign key (region_id)   references demo.regions(id)  on delete set null;
alter table demo.trips         add constraint trips_created_by_fkey       foreign key (created_by)  references demo.profiles(id) on delete set null;
alter table demo.trips         add constraint trips_region_id_fkey        foreign key (region_id)   references demo.regions(id)  on delete set null;

alter table demo.trip_stations add constraint trip_stations_trip_id_fkey  foreign key (trip_id)     references demo.trips(id)    on delete cascade;
alter table demo.trip_stations add constraint trip_stations_place_id_fkey foreign key (place_id)    references demo.places(id)   on delete cascade;
alter table demo.trip_stations add constraint trip_stations_trail_id_fkey foreign key (trail_id)    references demo.trails(id)   on delete cascade;

alter table demo.ratings   add constraint ratings_user_id_fkey     foreign key (user_id)     references demo.profiles(id) on delete cascade;
alter table demo.comments  add constraint comments_user_id_fkey    foreign key (user_id)     references demo.profiles(id) on delete cascade;
alter table demo.favorites add constraint favorites_user_id_fkey   foreign key (user_id)     references demo.profiles(id) on delete cascade;
alter table demo.images    add constraint images_user_id_fkey      foreign key (user_id)     references demo.profiles(id) on delete cascade;
alter table demo.reports   add constraint reports_user_id_fkey     foreign key (user_id)     references demo.profiles(id) on delete cascade;
alter table demo.reports   add constraint reports_resolved_by_fkey foreign key (resolved_by) references demo.profiles(id) on delete set null;

-- ── Functions ────────────────────────────────────────────────
-- Independent copies so demo admin status never leaks from public.

create or replace function demo.is_admin()
  returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select exists (
    select 1 from demo.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function demo.sync_entity_region()
  returns trigger
  language plpgsql
  set search_path to ''
as $$
begin
  if NEW.region_id is not null then
    select code into NEW.region
    from demo.regions
    where id = NEW.region_id and is_selectable = true;

    if NEW.region is null then
      raise exception 'region_id must reference a selectable region';
    end if;
  elsif NEW.region is not null and btrim(NEW.region) <> '' then
    select id into NEW.region_id
    from demo.regions
    where code = NEW.region and is_selectable = true;

    if NEW.region_id is null then
      raise exception 'Unknown region code: %', NEW.region;
    end if;
  end if;

  return NEW;
end;
$$;

create or replace function demo.resolve_bootstrap_role(user_email text)
  returns user_role
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  bootstrap_email text;
  admin_count integer;
  normalized_email text;
begin
  normalized_email := lower(trim(coalesce(user_email, '')));

  select count(*)::integer into admin_count
  from demo.profiles
  where role = 'admin'::public.user_role;

  if admin_count = 0 then
    return 'admin'::public.user_role;
  end if;

  select nullif(trim(value), '') into bootstrap_email
  from demo.app_config
  where key = 'bootstrap_admin_email';

  if bootstrap_email is not null and normalized_email = lower(bootstrap_email) then
    return 'admin'::public.user_role;
  end if;

  return 'user'::public.user_role;
end;
$$;

create or replace function demo.sync_bootstrap_admin(user_id uuid, user_email text)
  returns demo.profiles
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  target_role public.user_role;
  updated_row demo.profiles;
begin
  target_role := demo.resolve_bootstrap_role(user_email);

  if target_role = 'admin'::public.user_role then
    update demo.profiles
    set role = 'admin'::public.user_role
    where id = user_id
      and role is distinct from 'admin'::public.user_role
    returning * into updated_row;
  end if;

  if updated_row.id is null then
    select * into updated_row from demo.profiles where id = user_id;
  end if;

  return updated_row;
end;
$$;

create or replace function demo.admin_update_user_role(target_user_id uuid, new_role user_role)
  returns demo.profiles
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  result demo.profiles;
begin
  if not demo.is_admin() then
    raise exception 'אין הרשאה לעדכן תפקידים';
  end if;

  if new_role not in ('user'::public.user_role, 'admin'::public.user_role) then
    raise exception 'תפקיד לא תקין';
  end if;

  update demo.profiles
  set role = new_role
  where id = target_user_id
  returning * into result;

  if result.id is null then
    raise exception 'משתמש לא נמצא';
  end if;

  return result;
end;
$$;

create or replace function demo.approve_trip_cascade(trip_id uuid)
  returns demo.trips
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  result demo.trips;
begin
  if not demo.is_admin() then
    raise exception 'אין הרשאה לאשר טיולים';
  end if;

  update demo.places p
  set status = 'approved'::public.status, rejection_reason = null, updated_at = now()
  from demo.trip_stations ts
  where ts.trip_id = approve_trip_cascade.trip_id
    and ts.place_id = p.id
    and p.status = 'pending'::public.status;

  update demo.trails t
  set status = 'approved'::public.status, rejection_reason = null, updated_at = now()
  from demo.trip_stations ts
  where ts.trip_id = approve_trip_cascade.trip_id
    and ts.trail_id = t.id
    and t.status = 'pending'::public.status;

  update demo.trips
  set status = 'approved'::public.status, rejection_reason = null, updated_at = now()
  where id = approve_trip_cascade.trip_id
  returning * into result;

  if result.id is null then
    raise exception 'טיול לא נמצא';
  end if;

  return result;
end;
$$;

grant execute on function demo.is_admin()                              to anon, authenticated;
grant execute on function demo.resolve_bootstrap_role(text)            to anon, authenticated;
grant execute on function demo.sync_bootstrap_admin(uuid, text)        to authenticated;
grant execute on function demo.admin_update_user_role(uuid, user_role) to authenticated;
grant execute on function demo.approve_trip_cascade(uuid)              to authenticated;

-- ── Triggers ─────────────────────────────────────────────────

create trigger places_sync_region before insert or update of region, region_id
  on demo.places for each row execute function demo.sync_entity_region();

create trigger trails_sync_region before insert or update of region, region_id
  on demo.trails for each row execute function demo.sync_entity_region();

create trigger trips_sync_region before insert or update of region, region_id
  on demo.trips for each row execute function demo.sync_entity_region();

-- ── Row Level Security ───────────────────────────────────────
-- Same model as public, resolved through demo.is_admin().

alter table demo.profiles      enable row level security;
alter table demo.regions       enable row level security;
alter table demo.places        enable row level security;
alter table demo.trails        enable row level security;
alter table demo.trips         enable row level security;
alter table demo.trip_stations enable row level security;
alter table demo.ratings       enable row level security;
alter table demo.comments      enable row level security;
alter table demo.favorites     enable row level security;
alter table demo.images        enable row level security;
alter table demo.reports       enable row level security;
alter table demo.app_config    enable row level security;

create policy "profiles_select" on demo.profiles
  for select to anon, authenticated using (true);
create policy "profiles_insert_own" on demo.profiles
  for insert to public with check (id = auth.uid());
create policy "profiles_update_own" on demo.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_admin_all" on demo.profiles
  for all to authenticated using (demo.is_admin()) with check (demo.is_admin());

create policy "regions_public_read" on demo.regions
  for select to public using (true);
create policy "regions_admin_write" on demo.regions
  for all to public using (demo.is_admin()) with check (demo.is_admin());

create policy "places_select" on demo.places
  for select to anon, authenticated
  using (status = 'approved'::status or created_by = auth.uid() or demo.is_admin());
create policy "places_insert" on demo.places
  for insert to authenticated
  with check (created_by = auth.uid() or demo.is_admin());
create policy "places_update" on demo.places
  for update to authenticated
  using (demo.is_admin() or (created_by = auth.uid() and status = any (array['pending'::status, 'rejected'::status])))
  with check (demo.is_admin() or (created_by = auth.uid() and status = 'pending'::status));
create policy "places_delete" on demo.places
  for delete to authenticated
  using (
    status <> 'approved'::status
    and (created_by = auth.uid() or demo.is_admin())
  );

create policy "trails_select" on demo.trails
  for select to anon, authenticated
  using (status = 'approved'::status or created_by = auth.uid() or demo.is_admin());
create policy "trails_insert" on demo.trails
  for insert to authenticated
  with check (created_by = auth.uid() or demo.is_admin());
create policy "trails_update" on demo.trails
  for update to authenticated
  using (demo.is_admin() or (created_by = auth.uid() and status = any (array['pending'::status, 'rejected'::status])))
  with check (demo.is_admin() or (created_by = auth.uid() and status = 'pending'::status));
create policy "trails_delete" on demo.trails
  for delete to authenticated
  using (
    status <> 'approved'::status
    and (created_by = auth.uid() or demo.is_admin())
  );

create policy "trips_select" on demo.trips
  for select to anon, authenticated
  using (status = 'approved'::status or created_by = auth.uid() or demo.is_admin());
create policy "trips_insert" on demo.trips
  for insert to authenticated
  with check (created_by = auth.uid() or demo.is_admin());
create policy "trips_update" on demo.trips
  for update to authenticated
  using (demo.is_admin() or (created_by = auth.uid() and status = any (array['draft'::status, 'pending'::status, 'rejected'::status])))
  with check (demo.is_admin() or (created_by = auth.uid() and status = any (array['draft'::status, 'pending'::status])));
create policy "trips_delete" on demo.trips
  for delete to authenticated
  using (
    status <> 'approved'::status
    and (created_by = auth.uid() or demo.is_admin())
  );

create policy "trip_stations_select" on demo.trip_stations
  for select to anon, authenticated
  using (exists (
    select 1 from demo.trips t
    where t.id = trip_stations.trip_id
      and (t.status = 'approved'::status or t.created_by = auth.uid() or demo.is_admin())
  ));
create policy "trip_stations_write" on demo.trip_stations
  for all to authenticated
  using (exists (
    select 1 from demo.trips t
    where t.id = trip_stations.trip_id and (t.created_by = auth.uid() or demo.is_admin())
  ))
  with check (exists (
    select 1 from demo.trips t
    where t.id = trip_stations.trip_id and (t.created_by = auth.uid() or demo.is_admin())
  ));

create policy "ratings_select" on demo.ratings
  for select to anon, authenticated using (true);
create policy "ratings_write" on demo.ratings
  for all to authenticated
  using (user_id = auth.uid() or demo.is_admin())
  with check (user_id = auth.uid() or demo.is_admin());

create policy "comments_select" on demo.comments
  for select to anon, authenticated using (true);
create policy "comments_write" on demo.comments
  for all to authenticated
  using (user_id = auth.uid() or demo.is_admin())
  with check (user_id = auth.uid() or demo.is_admin());

create policy "favorites_select" on demo.favorites
  for select to authenticated
  using (user_id = auth.uid() or demo.is_admin());
create policy "favorites_write" on demo.favorites
  for all to authenticated
  using (user_id = auth.uid() or demo.is_admin())
  with check (user_id = auth.uid() or demo.is_admin());

create policy "images_select" on demo.images
  for select to anon, authenticated using (true);
create policy "images_write" on demo.images
  for all to authenticated
  using (user_id = auth.uid() or demo.is_admin())
  with check (user_id = auth.uid() or demo.is_admin());

create policy "reports_select" on demo.reports
  for select to authenticated
  using (user_id = auth.uid() or demo.is_admin());
create policy "reports_insert" on demo.reports
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "reports_update" on demo.reports
  for update to authenticated
  using (demo.is_admin()) with check (demo.is_admin());

create policy "app_config_public_read" on demo.app_config
  for select to public using (true);
create policy "app_config_admin_write" on demo.app_config
  for all to public using (demo.is_admin()) with check (demo.is_admin());
