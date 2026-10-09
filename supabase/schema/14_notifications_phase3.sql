-- TravelIsrael — notifications phase 3: social kinds (public + demo).
-- Realtime publication intentionally omitted — in-app updates use polling.

-- ── public ───────────────────────────────────────────────────

alter table public.notifications drop constraint if exists notifications_kind_check;

alter table public.notifications add constraint notifications_kind_check check (kind in (
  'content_approved',
  'content_rejected',
  'report_resolved',
  'report_rejected',
  'comment_on_my_content',
  'rating_on_my_content'
));

-- ── demo ─────────────────────────────────────────────────────

alter table demo.notifications drop constraint if exists notifications_kind_check;

alter table demo.notifications add constraint notifications_kind_check check (kind in (
  'content_approved',
  'content_rejected',
  'report_resolved',
  'report_rejected',
  'comment_on_my_content',
  'rating_on_my_content'
));
