-- TravelIsrael — public schema tables, constraints and indexes.
-- Tables are created first, then constraints, so cross-table foreign keys resolve.

-- ── Tables ───────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid not null,
  name text not null,
  email text not null,
  role user_role default 'user'::user_role not null,
  avatar_url text,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.regions (
  id uuid default gen_random_uuid() not null,
  name text not null,
  code text,
  parent_id uuid,
  sort_order integer default 0 not null,
  is_selectable boolean default false not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.places (
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

create table if not exists public.trails (
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

create table if not exists public.trips (
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

create table if not exists public.trip_stations (
  id uuid default gen_random_uuid() not null,
  trip_id uuid not null,
  order_index integer default 0 not null,
  station_type station_type not null,
  place_id uuid,
  trail_id uuid,
  travel_mode travel_mode
);

create table if not exists public.ratings (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  entity_type entity_type not null,
  entity_id uuid not null,
  score smallint not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.comments (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  entity_type entity_type not null,
  entity_id uuid not null,
  content text not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.favorites (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  entity_type entity_type not null,
  entity_id uuid not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.images (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  entity_type entity_type not null,
  entity_id uuid not null,
  url text not null,
  storage_path text not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.reports (
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

create table if not exists public.app_config (
  key text not null,
  value text not null,
  updated_at timestamp with time zone default now() not null
);

-- ── Primary keys ─────────────────────────────────────────────

alter table public.profiles       add constraint profiles_pkey       primary key (id);
alter table public.regions        add constraint regions_pkey        primary key (id);
alter table public.places         add constraint places_pkey         primary key (id);
alter table public.trails         add constraint trails_pkey         primary key (id);
alter table public.trips          add constraint trips_pkey          primary key (id);
alter table public.trip_stations  add constraint trip_stations_pkey  primary key (id);
alter table public.ratings        add constraint ratings_pkey        primary key (id);
alter table public.comments       add constraint comments_pkey       primary key (id);
alter table public.favorites      add constraint favorites_pkey      primary key (id);
alter table public.images         add constraint images_pkey         primary key (id);
alter table public.reports        add constraint reports_pkey        primary key (id);
alter table public.app_config     add constraint app_config_pkey     primary key (key);

-- ── Unique constraints ───────────────────────────────────────

alter table public.regions   add constraint regions_code_key unique (code);
alter table public.ratings   add constraint ratings_user_id_entity_type_entity_id_key   unique (user_id, entity_type, entity_id);
alter table public.favorites add constraint favorites_user_id_entity_type_entity_id_key unique (user_id, entity_type, entity_id);

-- ── Check constraints ────────────────────────────────────────

alter table public.places  add constraint places_accessibility_check check ((accessibility >= 1) and (accessibility <= 5));
alter table public.trails  add constraint trails_accessibility_check check ((accessibility >= 1) and (accessibility <= 5));
alter table public.trips   add constraint trips_accessibility_check  check ((accessibility >= 1) and (accessibility <= 5));
alter table public.ratings add constraint ratings_score_check        check ((score >= 1) and (score <= 5));
alter table public.regions add constraint regions_selectable_requires_code
  check (((is_selectable = true) and (code is not null)) or (is_selectable = false));

-- ── Foreign keys ─────────────────────────────────────────────

alter table public.profiles      add constraint profiles_id_fkey            foreign key (id)          references auth.users(id)      on delete cascade;
alter table public.regions       add constraint regions_parent_id_fkey      foreign key (parent_id)   references public.regions(id)  on delete restrict;

alter table public.places        add constraint places_created_by_fkey      foreign key (created_by)  references public.profiles(id) on delete set null;
alter table public.places        add constraint places_region_id_fkey       foreign key (region_id)   references public.regions(id)  on delete restrict;
alter table public.trails        add constraint trails_created_by_fkey      foreign key (created_by)  references public.profiles(id) on delete set null;
alter table public.trails        add constraint trails_region_id_fkey       foreign key (region_id)   references public.regions(id)  on delete restrict;
alter table public.trips         add constraint trips_created_by_fkey       foreign key (created_by)  references public.profiles(id) on delete set null;
alter table public.trips         add constraint trips_region_id_fkey        foreign key (region_id)   references public.regions(id)  on delete restrict;

alter table public.trip_stations add constraint trip_stations_trip_id_fkey  foreign key (trip_id)     references public.trips(id)    on delete cascade;
alter table public.trip_stations add constraint trip_stations_place_id_fkey foreign key (place_id)    references public.places(id)   on delete set null;
alter table public.trip_stations add constraint trip_stations_trail_id_fkey foreign key (trail_id)    references public.trails(id)   on delete set null;

alter table public.ratings       add constraint ratings_user_id_fkey        foreign key (user_id)     references public.profiles(id) on delete cascade;
alter table public.comments      add constraint comments_user_id_fkey       foreign key (user_id)     references public.profiles(id) on delete cascade;
alter table public.favorites     add constraint favorites_user_id_fkey      foreign key (user_id)     references public.profiles(id) on delete cascade;
alter table public.images        add constraint images_user_id_fkey         foreign key (user_id)     references public.profiles(id) on delete cascade;
alter table public.reports       add constraint reports_user_id_fkey        foreign key (user_id)     references public.profiles(id) on delete cascade;
alter table public.reports       add constraint reports_resolved_by_fkey    foreign key (resolved_by) references public.profiles(id) on delete set null;

-- ── Indexes ──────────────────────────────────────────────────

create index if not exists places_region_id_idx on public.places  using btree (region_id);
create index if not exists trails_region_id_idx on public.trails  using btree (region_id);
create index if not exists trips_region_id_idx  on public.trips   using btree (region_id);
create index if not exists regions_parent_id_idx on public.regions using btree (parent_id);
create index if not exists regions_code_idx      on public.regions using btree (code) where (code is not null);
