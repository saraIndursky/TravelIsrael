-- TravelIsrael — enums
-- All enums live in the public schema and are shared by the demo schema.

create type public.difficulty     as enum ('easy', 'medium', 'hard');
create type public.entity_type    as enum ('trip', 'place', 'trail');
create type public.report_status  as enum ('pending', 'resolved', 'rejected');
create type public.report_type    as enum ('problem', 'inaccuracy', 'update');
create type public.station_type   as enum ('place', 'trail');
create type public.status         as enum ('draft', 'pending', 'approved', 'rejected', 'removed');
create type public.travel_mode    as enum ('walking', 'car', 'bike');
create type public.user_role      as enum ('guest', 'user', 'admin');
