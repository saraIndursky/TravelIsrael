-- TravelIsrael — in-app notifications (public + demo).
-- Run after 02_tables / 06_demo_schema baseline, or apply via Supabase SQL editor.

-- ── public ───────────────────────────────────────────────────

create table if not exists public.notifications (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  kind text not null,
  title text not null,
  body text not null,
  link_path text not null,
  entity_type entity_type,
  entity_id uuid,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  constraint notifications_kind_check check (kind in (
    'content_approved',
    'content_rejected',
    'report_resolved',
    'report_rejected',
    'comment_on_my_content',
    'rating_on_my_content'
  ))
);

alter table public.notifications add constraint notifications_pkey primary key (id);
alter table public.notifications
  add constraint notifications_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

create index if not exists notifications_user_created_idx
  on public.notifications using btree (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications using btree (user_id)
  where read_at is null;

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_insert_admin" on public.notifications
  for insert to authenticated
  with check (is_admin());

-- ── demo (mirror) ────────────────────────────────────────────

create table if not exists demo.notifications (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  kind text not null,
  title text not null,
  body text not null,
  link_path text not null,
  entity_type entity_type,
  entity_id uuid,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  constraint notifications_kind_check check (kind in (
    'content_approved',
    'content_rejected',
    'report_resolved',
    'report_rejected',
    'comment_on_my_content',
    'rating_on_my_content'
  ))
);

alter table demo.notifications add constraint notifications_pkey primary key (id);
alter table demo.notifications
  add constraint notifications_user_id_fkey
  foreign key (user_id) references demo.profiles(id) on delete cascade;

create index if not exists notifications_user_created_idx
  on demo.notifications using btree (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on demo.notifications using btree (user_id)
  where read_at is null;

alter table demo.notifications enable row level security;

create policy "notifications_select_own" on demo.notifications
  for select to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own" on demo.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_insert_admin" on demo.notifications
  for insert to authenticated
  with check (demo.is_admin());
