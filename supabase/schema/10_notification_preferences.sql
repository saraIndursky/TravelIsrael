-- TravelIsrael — notification preferences (public + demo).
-- Run after 07_notifications.sql

-- ── public ───────────────────────────────────────────────────

create table if not exists public.notification_preferences (
  user_id uuid not null,
  my_content_status boolean default true not null,
  my_reports_status boolean default true not null,
  comments_on_my_content boolean default true not null,
  ratings_on_my_content boolean default true not null,
  new_approved_content boolean default false not null,
  favorites_updates boolean default false not null,
  sound_enabled boolean default false not null,
  sound_id text default 'chime-1' not null,
  updated_at timestamp with time zone default now() not null,
  constraint notification_preferences_sound_id_check check (
    sound_id in (
      'chime-1', 'chime-2', 'chime-3', 'chime-4', 'chime-5',
      'chime-6', 'chime-7', 'chime-8', 'chime-9', 'chime-10'
    )
  )
);

alter table public.notification_preferences
  add constraint notification_preferences_pkey primary key (user_id);

alter table public.notification_preferences
  add constraint notification_preferences_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.notification_preferences enable row level security;

create policy "notification_preferences_select_own" on public.notification_preferences
  for select to authenticated
  using (user_id = auth.uid() or is_admin());

create policy "notification_preferences_insert_own" on public.notification_preferences
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "notification_preferences_update_own" on public.notification_preferences
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── demo (mirror) ────────────────────────────────────────────

create table if not exists demo.notification_preferences (
  user_id uuid not null,
  my_content_status boolean default true not null,
  my_reports_status boolean default true not null,
  comments_on_my_content boolean default true not null,
  ratings_on_my_content boolean default true not null,
  new_approved_content boolean default false not null,
  favorites_updates boolean default false not null,
  sound_enabled boolean default false not null,
  sound_id text default 'chime-1' not null,
  updated_at timestamp with time zone default now() not null,
  constraint notification_preferences_sound_id_check check (
    sound_id in (
      'chime-1', 'chime-2', 'chime-3', 'chime-4', 'chime-5',
      'chime-6', 'chime-7', 'chime-8', 'chime-9', 'chime-10'
    )
  )
);

alter table demo.notification_preferences
  add constraint notification_preferences_pkey primary key (user_id);

alter table demo.notification_preferences
  add constraint notification_preferences_user_id_fkey
  foreign key (user_id) references demo.profiles(id) on delete cascade;

alter table demo.notification_preferences enable row level security;

create policy "notification_preferences_select_own" on demo.notification_preferences
  for select to authenticated
  using (user_id = auth.uid() or demo.is_admin());

create policy "notification_preferences_insert_own" on demo.notification_preferences
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "notification_preferences_update_own" on demo.notification_preferences
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Default prefs for existing profiles
insert into public.notification_preferences (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

insert into demo.notification_preferences (user_id)
select id from demo.profiles
on conflict (user_id) do nothing;

-- New signups: extend handle_new_user
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $$
declare
  profile_name text;
  profile_role user_role;
begin
  profile_name := coalesce(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1),
    'משתמש'
  );

  profile_role := public.resolve_bootstrap_role(NEW.email);

  insert into public.profiles (id, name, email, role, avatar_url)
  values (
    NEW.id,
    profile_name,
    coalesce(NEW.email, ''),
    profile_role,
    coalesce(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    role = excluded.role,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  insert into public.notification_preferences (user_id)
  values (NEW.id)
  on conflict (user_id) do nothing;

  begin
    insert into demo.profiles (id, name, email, role, avatar_url)
    values (
      NEW.id,
      profile_name,
      coalesce(NEW.email, ''),
      demo.resolve_bootstrap_role(NEW.email),
      coalesce(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    )
    on conflict (id) do update set
      name = excluded.name,
      email = excluded.email,
      avatar_url = coalesce(excluded.avatar_url, demo.profiles.avatar_url);

    insert into demo.notification_preferences (user_id)
    values (NEW.id)
    on conflict (user_id) do nothing;
  exception when others then
    raise log 'handle_new_user: demo profile sync skipped for %', NEW.id;
  end;

  return NEW;
end;
$$;
