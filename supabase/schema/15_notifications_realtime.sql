-- TravelIsrael — enable Realtime on notifications (public + demo).
-- Run once in SQL Editor after 14_notifications_phase3.sql.

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table demo.notifications;
exception
  when duplicate_object then null;
end $$;
