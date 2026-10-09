-- TravelIsrael — removed status (admin unpublish, not rejection).
-- Run 18a_content_removed_enum.sql first in a separate transaction.

alter table public.places add column if not exists removal_reason text;
alter table public.trails add column if not exists removal_reason text;
alter table public.trips add column if not exists removal_reason text;

alter table demo.places add column if not exists removal_reason text;
alter table demo.trails add column if not exists removal_reason text;
alter table demo.trips add column if not exists removal_reason text;

create or replace function public.user_has_favorite(p_entity_type public.entity_type, p_entity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.favorites f
    where f.user_id = auth.uid()
      and f.entity_type = p_entity_type
      and f.entity_id = p_entity_id
  );
$$;

create or replace function demo.user_has_favorite(p_entity_type public.entity_type, p_entity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = demo, public
as $$
  select exists (
    select 1
    from demo.favorites f
    where f.user_id = auth.uid()
      and f.entity_type = p_entity_type
      and f.entity_id = p_entity_id
  );
$$;

grant execute on function public.user_has_favorite(public.entity_type, uuid) to anon, authenticated;
grant execute on function demo.user_has_favorite(public.entity_type, uuid) to anon, authenticated;

-- ── public select ────────────────────────────────────────────

drop policy if exists "places_select" on public.places;
create policy "places_select" on public.places
  for select to anon, authenticated
  using (
    status = 'approved'::status
    or created_by = auth.uid()
    or is_admin()
    or (status = 'removed'::status and user_has_favorite('place'::entity_type, id))
  );

drop policy if exists "trails_select" on public.trails;
create policy "trails_select" on public.trails
  for select to anon, authenticated
  using (
    status = 'approved'::status
    or created_by = auth.uid()
    or is_admin()
    or (status = 'removed'::status and user_has_favorite('trail'::entity_type, id))
  );

drop policy if exists "trips_select" on public.trips;
create policy "trips_select" on public.trips
  for select to anon, authenticated
  using (
    status = 'approved'::status
    or created_by = auth.uid()
    or is_admin()
    or (status = 'removed'::status and user_has_favorite('trip'::entity_type, id))
  );

-- ── public update (owner resubmit from removed) ──────────────

drop policy if exists "places_update" on public.places;
create policy "places_update" on public.places
  for update to authenticated
  using (
    is_admin()
    or (created_by = auth.uid() and status = any (array['pending'::status, 'rejected'::status, 'removed'::status]))
  )
  with check (is_admin() or (created_by = auth.uid() and status = 'pending'::status));

drop policy if exists "trails_update" on public.trails;
create policy "trails_update" on public.trails
  for update to authenticated
  using (
    is_admin()
    or (created_by = auth.uid() and status = any (array['pending'::status, 'rejected'::status, 'removed'::status]))
  )
  with check (is_admin() or (created_by = auth.uid() and status = 'pending'::status));

drop policy if exists "trips_update" on public.trips;
create policy "trips_update" on public.trips
  for update to authenticated
  using (
    is_admin()
    or (created_by = auth.uid() and status = any (array['draft'::status, 'pending'::status, 'rejected'::status, 'removed'::status]))
  )
  with check (is_admin() or (created_by = auth.uid() and status = any (array['draft'::status, 'pending'::status])));

-- ── public delete (block approved + removed) ─────────────────

drop policy if exists "places_delete" on public.places;
create policy "places_delete" on public.places
  for delete to authenticated
  using (
    status = any (array['draft'::status, 'pending'::status, 'rejected'::status])
    and (created_by = auth.uid() or is_admin())
  );

drop policy if exists "trails_delete" on public.trails;
create policy "trails_delete" on public.trails
  for delete to authenticated
  using (
    status = any (array['draft'::status, 'pending'::status, 'rejected'::status])
    and (created_by = auth.uid() or is_admin())
  );

drop policy if exists "trips_delete" on public.trips;
create policy "trips_delete" on public.trips
  for delete to authenticated
  using (
    status = any (array['draft'::status, 'pending'::status, 'rejected'::status])
    and (created_by = auth.uid() or is_admin())
  );

-- ── demo (mirror) ────────────────────────────────────────────

drop policy if exists "places_select" on demo.places;
create policy "places_select" on demo.places
  for select to anon, authenticated
  using (
    status = 'approved'::status
    or created_by = auth.uid()
    or demo.is_admin()
    or (status = 'removed'::status and demo.user_has_favorite('place'::entity_type, id))
  );

drop policy if exists "trails_select" on demo.trails;
create policy "trails_select" on demo.trails
  for select to anon, authenticated
  using (
    status = 'approved'::status
    or created_by = auth.uid()
    or demo.is_admin()
    or (status = 'removed'::status and demo.user_has_favorite('trail'::entity_type, id))
  );

drop policy if exists "trips_select" on demo.trips;
create policy "trips_select" on demo.trips
  for select to anon, authenticated
  using (
    status = 'approved'::status
    or created_by = auth.uid()
    or demo.is_admin()
    or (status = 'removed'::status and demo.user_has_favorite('trip'::entity_type, id))
  );

drop policy if exists "places_update" on demo.places;
create policy "places_update" on demo.places
  for update to authenticated
  using (
    demo.is_admin()
    or (created_by = auth.uid() and status = any (array['pending'::status, 'rejected'::status, 'removed'::status]))
  )
  with check (demo.is_admin() or (created_by = auth.uid() and status = 'pending'::status));

drop policy if exists "trails_update" on demo.trails;
create policy "trails_update" on demo.trails
  for update to authenticated
  using (
    demo.is_admin()
    or (created_by = auth.uid() and status = any (array['pending'::status, 'rejected'::status, 'removed'::status]))
  )
  with check (demo.is_admin() or (created_by = auth.uid() and status = 'pending'::status));

drop policy if exists "trips_update" on demo.trips;
create policy "trips_update" on demo.trips
  for update to authenticated
  using (
    demo.is_admin()
    or (created_by = auth.uid() and status = any (array['draft'::status, 'pending'::status, 'rejected'::status, 'removed'::status]))
  )
  with check (demo.is_admin() or (created_by = auth.uid() and status = any (array['draft'::status, 'pending'::status])));

drop policy if exists "places_delete" on demo.places;
create policy "places_delete" on demo.places
  for delete to authenticated
  using (
    status = any (array['draft'::status, 'pending'::status, 'rejected'::status])
    and (created_by = auth.uid() or demo.is_admin())
  );

drop policy if exists "trails_delete" on demo.trails;
create policy "trails_delete" on demo.trails
  for delete to authenticated
  using (
    status = any (array['draft'::status, 'pending'::status, 'rejected'::status])
    and (created_by = auth.uid() or demo.is_admin())
  );

drop policy if exists "trips_delete" on demo.trips;
create policy "trips_delete" on demo.trips
  for delete to authenticated
  using (
    status = any (array['draft'::status, 'pending'::status, 'rejected'::status])
    and (created_by = auth.uid() or demo.is_admin())
  );
