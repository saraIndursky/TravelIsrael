-- TravelIsrael — Row Level Security for the public schema.
--
-- Access model:
--   guest (anon) — reads approved content only
--   user         — CRUD on own content, plus own ratings/comments/favorites
--   admin        — full access, approve/reject content, manage reports
--
-- Content lifecycle: draft -> pending -> approved | rejected -> (edit) -> pending
-- Owners may only edit while pending or rejected, and any owner edit must land
-- back on pending. Only an admin can move a row to approved.

alter table public.profiles      enable row level security;
alter table public.regions       enable row level security;
alter table public.places        enable row level security;
alter table public.trails        enable row level security;
alter table public.trips         enable row level security;
alter table public.trip_stations enable row level security;
alter table public.ratings       enable row level security;
alter table public.comments      enable row level security;
alter table public.favorites     enable row level security;
alter table public.images        enable row level security;
alter table public.reports       enable row level security;
alter table public.app_config    enable row level security;

-- ── profiles ─────────────────────────────────────────────────

create policy "profiles_select" on public.profiles
  for select to anon, authenticated
  using (true);

create policy "profiles_insert_own" on public.profiles
  for insert to public
  with check (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_all" on public.profiles
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ── regions ──────────────────────────────────────────────────

create policy "regions_public_read" on public.regions
  for select to public
  using (true);

create policy "regions_admin_write" on public.regions
  for all to public
  using (is_admin())
  with check (is_admin());

-- ── places ───────────────────────────────────────────────────

create policy "places_select" on public.places
  for select to anon, authenticated
  using (status = 'approved'::status or created_by = auth.uid() or is_admin());

create policy "places_insert" on public.places
  for insert to authenticated
  with check (created_by = auth.uid() or is_admin());

create policy "places_update" on public.places
  for update to authenticated
  using (is_admin() or (created_by = auth.uid() and status = any (array['pending'::status, 'rejected'::status])))
  with check (is_admin() or (created_by = auth.uid() and status = 'pending'::status));

create policy "places_delete" on public.places
  for delete to authenticated
  using (
    status <> 'approved'::status
    and (created_by = auth.uid() or is_admin())
  );

-- ── trails ───────────────────────────────────────────────────

create policy "trails_select" on public.trails
  for select to anon, authenticated
  using (status = 'approved'::status or created_by = auth.uid() or is_admin());

create policy "trails_insert" on public.trails
  for insert to authenticated
  with check (created_by = auth.uid() or is_admin());

create policy "trails_update" on public.trails
  for update to authenticated
  using (is_admin() or (created_by = auth.uid() and status = any (array['pending'::status, 'rejected'::status])))
  with check (is_admin() or (created_by = auth.uid() and status = 'pending'::status));

create policy "trails_delete" on public.trails
  for delete to authenticated
  using (
    status <> 'approved'::status
    and (created_by = auth.uid() or is_admin())
  );

-- ── trips ────────────────────────────────────────────────────

create policy "trips_select" on public.trips
  for select to anon, authenticated
  using (status = 'approved'::status or created_by = auth.uid() or is_admin());

create policy "trips_insert" on public.trips
  for insert to authenticated
  with check (created_by = auth.uid() or is_admin());

-- NOTE: owners may edit draft/pending/rejected only; edits on pending/rejected return to pending.
create policy "trips_update" on public.trips
  for update to authenticated
  using (is_admin() or (created_by = auth.uid() and status = any (array['draft'::status, 'pending'::status, 'rejected'::status])))
  with check (is_admin() or (created_by = auth.uid() and status = any (array['draft'::status, 'pending'::status])));

create policy "trips_delete" on public.trips
  for delete to authenticated
  using (
    status <> 'approved'::status
    and (created_by = auth.uid() or is_admin())
  );

-- ── trip_stations ────────────────────────────────────────────

create policy "trip_stations_select" on public.trip_stations
  for select to anon, authenticated
  using (exists (
    select 1 from public.trips t
    where t.id = trip_stations.trip_id
      and (t.status = 'approved'::status or t.created_by = auth.uid() or is_admin())
  ));

create policy "trip_stations_write" on public.trip_stations
  for all to authenticated
  using (exists (
    select 1 from public.trips t
    where t.id = trip_stations.trip_id and (t.created_by = auth.uid() or is_admin())
  ))
  with check (exists (
    select 1 from public.trips t
    where t.id = trip_stations.trip_id and (t.created_by = auth.uid() or is_admin())
  ));

-- ── ratings / comments / favorites / images ──────────────────

create policy "ratings_select" on public.ratings
  for select to anon, authenticated
  using (true);

create policy "ratings_write" on public.ratings
  for all to authenticated
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

create policy "comments_select" on public.comments
  for select to anon, authenticated
  using (true);

create policy "comments_write" on public.comments
  for all to authenticated
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- Favorites are private: only the owner (or an admin) can see them.
create policy "favorites_select" on public.favorites
  for select to authenticated
  using (user_id = auth.uid() or is_admin());

create policy "favorites_write" on public.favorites
  for all to authenticated
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

create policy "images_select" on public.images
  for select to anon, authenticated
  using (true);

create policy "images_write" on public.images
  for all to authenticated
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- ── reports ──────────────────────────────────────────────────

create policy "reports_select" on public.reports
  for select to authenticated
  using (user_id = auth.uid() or is_admin());

create policy "reports_insert" on public.reports
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "reports_update" on public.reports
  for update to authenticated
  using (is_admin())
  with check (is_admin());

-- ── app_config ───────────────────────────────────────────────

create policy "app_config_public_read" on public.app_config
  for select to public
  using (true);

create policy "app_config_admin_write" on public.app_config
  for all to public
  using (is_admin())
  with check (is_admin());
