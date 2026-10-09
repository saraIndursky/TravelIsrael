-- TravelIsrael — broadcast notification kinds + region filter on preferences.

-- ── kinds (public + demo) ────────────────────────────────────

alter table public.notifications drop constraint if exists notifications_kind_check;

alter table public.notifications add constraint notifications_kind_check check (kind in (
  'content_approved',
  'content_rejected',
  'content_removed',
  'report_resolved',
  'report_rejected',
  'comment_on_my_content',
  'rating_on_my_content',
  'new_approved_place',
  'new_approved_trail',
  'new_approved_trip',
  'favorite_entity_updated',
  'favorite_entity_removed'
));

alter table demo.notifications drop constraint if exists notifications_kind_check;

alter table demo.notifications add constraint notifications_kind_check check (kind in (
  'content_approved',
  'content_rejected',
  'content_removed',
  'report_resolved',
  'report_rejected',
  'comment_on_my_content',
  'rating_on_my_content',
  'new_approved_place',
  'new_approved_trail',
  'new_approved_trip',
  'favorite_entity_updated',
  'favorite_entity_removed'
));

-- ── region filter on preferences ─────────────────────────────

alter table public.notification_preferences
  add column if not exists region_ids uuid[] default '{}' not null;

alter table demo.notification_preferences
  add column if not exists region_ids uuid[] default '{}' not null;
