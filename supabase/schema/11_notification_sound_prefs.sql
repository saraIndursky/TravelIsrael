-- Notification sound preferences (public + demo).

alter table public.notification_preferences
  add column if not exists sound_enabled boolean default false not null;

alter table public.notification_preferences
  add column if not exists sound_id text default 'chime-1' not null;

alter table public.notification_preferences drop constraint if exists notification_preferences_sound_id_check;
alter table public.notification_preferences add constraint notification_preferences_sound_id_check check (
  sound_id in (
    'chime-1', 'chime-2', 'chime-3', 'chime-4', 'chime-5',
    'chime-6', 'chime-7', 'chime-8', 'chime-9', 'chime-10'
  )
);

alter table demo.notification_preferences
  add column if not exists sound_enabled boolean default false not null;

alter table demo.notification_preferences
  add column if not exists sound_id text default 'chime-1' not null;

alter table demo.notification_preferences drop constraint if exists notification_preferences_sound_id_check;
alter table demo.notification_preferences add constraint notification_preferences_sound_id_check check (
  sound_id in (
    'chime-1', 'chime-2', 'chime-3', 'chime-4', 'chime-5',
    'chime-6', 'chime-7', 'chime-8', 'chime-9', 'chime-10'
  )
);
