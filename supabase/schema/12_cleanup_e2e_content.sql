-- One-time cleanup: remove E2E test entities (run in Supabase SQL editor).
-- Safe to run on demo; review before running on public.

delete from demo.trip_stations
where trip_id in (select id from demo.trips where name like 'E2E %');

delete from demo.trips where name like 'E2E %';
delete from demo.places where name like 'E2E %';
delete from demo.trails where name like 'E2E %';

-- delete from public.trip_stations
-- where trip_id in (select id from public.trips where name like 'E2E %');
-- delete from public.trips where name like 'E2E %';
-- delete from public.places where name like 'E2E %';
-- delete from public.trails where name like 'E2E %';
