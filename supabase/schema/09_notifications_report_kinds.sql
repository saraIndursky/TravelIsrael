-- Allow report status notification kinds (public + demo).

alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (
  kind in (
    'content_approved',
    'content_rejected',
    'report_resolved',
    'report_rejected'
  )
);

alter table demo.notifications drop constraint if exists notifications_kind_check;
alter table demo.notifications add constraint notifications_kind_check check (
  kind in (
    'content_approved',
    'content_rejected',
    'report_resolved',
    'report_rejected'
  )
);
