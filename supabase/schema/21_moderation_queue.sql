-- TravelIsrael — community gallery + admin moderation queue (public + demo).
-- Comments and gallery images go live immediately; admins review them in /admin/moderation.

-- ── images: community gallery lookups ────────────────────────

create index if not exists images_entity_idx
  on public.images using btree (entity_type, entity_id);

create index if not exists images_entity_idx
  on demo.images using btree (entity_type, entity_id);

alter table public.images alter column storage_path set default '';
alter table demo.images alter column storage_path set default '';

-- Admin may delete any object in the content-images bucket.
drop policy if exists "content_images_delete_admin" on storage.objects;
create policy "content_images_delete_admin" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'content-images'
    and (public.is_admin() or demo.is_admin())
  );

-- ── public.moderation_queue ──────────────────────────────────

create table if not exists public.moderation_queue (
  id uuid default gen_random_uuid() not null,
  kind text not null,
  entity_type public.entity_type not null,
  entity_id uuid not null,
  entity_name text not null,
  content text not null,
  source_id uuid not null,
  created_by uuid not null,
  seen_at timestamp with time zone,
  seen_by uuid,
  created_at timestamp with time zone default now() not null,
  constraint moderation_queue_pkey primary key (id),
  constraint moderation_queue_kind_check check (kind in ('comment', 'gallery_image')),
  constraint moderation_queue_kind_source_key unique (kind, source_id),
  constraint moderation_queue_created_by_fkey
    foreign key (created_by) references public.profiles(id) on delete cascade,
  constraint moderation_queue_seen_by_fkey
    foreign key (seen_by) references public.profiles(id) on delete set null
);

create index if not exists moderation_queue_unseen_idx
  on public.moderation_queue using btree (created_at desc)
  where seen_at is null;

alter table public.moderation_queue enable row level security;

drop policy if exists "moderation_queue_select" on public.moderation_queue;
create policy "moderation_queue_select" on public.moderation_queue
  for select to authenticated
  using (public.is_admin());

drop policy if exists "moderation_queue_update" on public.moderation_queue;
create policy "moderation_queue_update" on public.moderation_queue
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "moderation_queue_delete" on public.moderation_queue;
create policy "moderation_queue_delete" on public.moderation_queue
  for delete to authenticated
  using (public.is_admin());

create or replace function public.entity_display_name(p_type public.entity_type, p_id uuid)
returns text
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  v_name text;
begin
  if p_type = 'place' then
    select name into v_name from public.places where id = p_id;
  elsif p_type = 'trail' then
    select name into v_name from public.trails where id = p_id;
  else
    select name into v_name from public.trips where id = p_id;
  end if;
  return coalesce(v_name, 'תוכן');
end;
$$;

create or replace function public.enqueue_moderation_from_comment()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.moderation_queue (
    kind, entity_type, entity_id, entity_name, content, source_id, created_by
  ) values (
    'comment',
    new.entity_type,
    new.entity_id,
    public.entity_display_name(new.entity_type, new.entity_id),
    new.content,
    new.id,
    new.user_id
  );
  return new;
end;
$$;

create or replace function public.enqueue_moderation_from_image()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.moderation_queue (
    kind, entity_type, entity_id, entity_name, content, source_id, created_by
  ) values (
    'gallery_image',
    new.entity_type,
    new.entity_id,
    public.entity_display_name(new.entity_type, new.entity_id),
    new.url,
    new.id,
    new.user_id
  );
  return new;
end;
$$;

create or replace function public.dequeue_moderation_comment()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  delete from public.moderation_queue
  where kind = 'comment' and source_id = old.id;
  return old;
end;
$$;

create or replace function public.dequeue_moderation_image()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  delete from public.moderation_queue
  where kind = 'gallery_image' and source_id = old.id;
  return old;
end;
$$;

drop trigger if exists comments_enqueue_moderation on public.comments;
create trigger comments_enqueue_moderation
  after insert on public.comments
  for each row execute function public.enqueue_moderation_from_comment();

drop trigger if exists images_enqueue_moderation on public.images;
create trigger images_enqueue_moderation
  after insert on public.images
  for each row execute function public.enqueue_moderation_from_image();

drop trigger if exists comments_dequeue_moderation on public.comments;
create trigger comments_dequeue_moderation
  after delete on public.comments
  for each row execute function public.dequeue_moderation_comment();

drop trigger if exists images_dequeue_moderation on public.images;
create trigger images_dequeue_moderation
  after delete on public.images
  for each row execute function public.dequeue_moderation_image();

-- ── demo.moderation_queue ────────────────────────────────────

create table if not exists demo.moderation_queue (
  id uuid default gen_random_uuid() not null,
  kind text not null,
  entity_type public.entity_type not null,
  entity_id uuid not null,
  entity_name text not null,
  content text not null,
  source_id uuid not null,
  created_by uuid not null,
  seen_at timestamp with time zone,
  seen_by uuid,
  created_at timestamp with time zone default now() not null,
  constraint moderation_queue_pkey primary key (id),
  constraint moderation_queue_kind_check check (kind in ('comment', 'gallery_image')),
  constraint moderation_queue_kind_source_key unique (kind, source_id),
  constraint moderation_queue_created_by_fkey
    foreign key (created_by) references demo.profiles(id) on delete cascade,
  constraint moderation_queue_seen_by_fkey
    foreign key (seen_by) references demo.profiles(id) on delete set null
);

create index if not exists moderation_queue_unseen_idx
  on demo.moderation_queue using btree (created_at desc)
  where seen_at is null;

alter table demo.moderation_queue enable row level security;

drop policy if exists "moderation_queue_select" on demo.moderation_queue;
create policy "moderation_queue_select" on demo.moderation_queue
  for select to authenticated
  using (demo.is_admin());

drop policy if exists "moderation_queue_update" on demo.moderation_queue;
create policy "moderation_queue_update" on demo.moderation_queue
  for update to authenticated
  using (demo.is_admin())
  with check (demo.is_admin());

drop policy if exists "moderation_queue_delete" on demo.moderation_queue;
create policy "moderation_queue_delete" on demo.moderation_queue
  for delete to authenticated
  using (demo.is_admin());

create or replace function demo.entity_display_name(p_type public.entity_type, p_id uuid)
returns text
language plpgsql
stable
security definer
set search_path to ''
as $$
declare
  v_name text;
begin
  if p_type = 'place' then
    select name into v_name from demo.places where id = p_id;
  elsif p_type = 'trail' then
    select name into v_name from demo.trails where id = p_id;
  else
    select name into v_name from demo.trips where id = p_id;
  end if;
  return coalesce(v_name, 'תוכן');
end;
$$;

create or replace function demo.enqueue_moderation_from_comment()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  insert into demo.moderation_queue (
    kind, entity_type, entity_id, entity_name, content, source_id, created_by
  ) values (
    'comment',
    new.entity_type,
    new.entity_id,
    demo.entity_display_name(new.entity_type, new.entity_id),
    new.content,
    new.id,
    new.user_id
  );
  return new;
end;
$$;

create or replace function demo.enqueue_moderation_from_image()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  insert into demo.moderation_queue (
    kind, entity_type, entity_id, entity_name, content, source_id, created_by
  ) values (
    'gallery_image',
    new.entity_type,
    new.entity_id,
    demo.entity_display_name(new.entity_type, new.entity_id),
    new.url,
    new.id,
    new.user_id
  );
  return new;
end;
$$;

create or replace function demo.dequeue_moderation_comment()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  delete from demo.moderation_queue
  where kind = 'comment' and source_id = old.id;
  return old;
end;
$$;

create or replace function demo.dequeue_moderation_image()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  delete from demo.moderation_queue
  where kind = 'gallery_image' and source_id = old.id;
  return old;
end;
$$;

drop trigger if exists comments_enqueue_moderation on demo.comments;
create trigger comments_enqueue_moderation
  after insert on demo.comments
  for each row execute function demo.enqueue_moderation_from_comment();

drop trigger if exists images_enqueue_moderation on demo.images;
create trigger images_enqueue_moderation
  after insert on demo.images
  for each row execute function demo.enqueue_moderation_from_image();

drop trigger if exists comments_dequeue_moderation on demo.comments;
create trigger comments_dequeue_moderation
  after delete on demo.comments
  for each row execute function demo.dequeue_moderation_comment();

drop trigger if exists images_dequeue_moderation on demo.images;
create trigger images_dequeue_moderation
  after delete on demo.images
  for each row execute function demo.dequeue_moderation_image();

grant select, insert, update, delete on public.moderation_queue to anon, authenticated, service_role;
grant select, insert, update, delete on demo.moderation_queue to anon, authenticated, service_role;
