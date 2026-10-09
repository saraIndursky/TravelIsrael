-- TravelIsrael — block hard delete of approved content (public + demo).
-- Approved rows must be unpublished via reject, not deleted.

-- ── public ───────────────────────────────────────────────────

drop policy if exists "places_delete" on public.places;
create policy "places_delete" on public.places
  for delete to authenticated
  using (
    status <> 'approved'::status
    and (created_by = auth.uid() or is_admin())
  );

drop policy if exists "trails_delete" on public.trails;
create policy "trails_delete" on public.trails
  for delete to authenticated
  using (
    status <> 'approved'::status
    and (created_by = auth.uid() or is_admin())
  );

drop policy if exists "trips_delete" on public.trips;
create policy "trips_delete" on public.trips
  for delete to authenticated
  using (
    status <> 'approved'::status
    and (created_by = auth.uid() or is_admin())
  );

-- ── demo ─────────────────────────────────────────────────────

drop policy if exists "places_delete" on demo.places;
create policy "places_delete" on demo.places
  for delete to authenticated
  using (
    status <> 'approved'::status
    and (created_by = auth.uid() or demo.is_admin())
  );

drop policy if exists "trails_delete" on demo.trails;
create policy "trails_delete" on demo.trails
  for delete to authenticated
  using (
    status <> 'approved'::status
    and (created_by = auth.uid() or demo.is_admin())
  );

drop policy if exists "trips_delete" on demo.trips;
create policy "trips_delete" on demo.trips
  for delete to authenticated
  using (
    status <> 'approved'::status
    and (created_by = auth.uid() or demo.is_admin())
  );
