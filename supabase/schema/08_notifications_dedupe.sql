-- Remove duplicate unread notifications (keep newest per user+entity+kind).
-- Run in Supabase SQL editor for public + demo schemas.

DELETE FROM public.notifications a
USING public.notifications b
WHERE a.read_at IS NULL
  AND b.read_at IS NULL
  AND a.user_id = b.user_id
  AND a.entity_type IS NOT DISTINCT FROM b.entity_type
  AND a.entity_id IS NOT DISTINCT FROM b.entity_id
  AND a.kind = b.kind
  AND a.created_at < b.created_at;

DELETE FROM demo.notifications a
USING demo.notifications b
WHERE a.read_at IS NULL
  AND b.read_at IS NULL
  AND a.user_id = b.user_id
  AND a.entity_type IS NOT DISTINCT FROM b.entity_type
  AND a.entity_id IS NOT DISTINCT FROM b.entity_id
  AND a.kind = b.kind
  AND a.created_at < b.created_at;

-- Also dedupe by link_path when entity columns are null (legacy rows).
DELETE FROM public.notifications a
USING public.notifications b
WHERE a.read_at IS NULL
  AND b.read_at IS NULL
  AND a.user_id = b.user_id
  AND a.kind = b.kind
  AND a.link_path = b.link_path
  AND (a.entity_type IS NULL OR a.entity_id IS NULL)
  AND (b.entity_type IS NULL OR b.entity_id IS NULL)
  AND a.created_at < b.created_at;

DELETE FROM demo.notifications a
USING demo.notifications b
WHERE a.read_at IS NULL
  AND b.read_at IS NULL
  AND a.user_id = b.user_id
  AND a.kind = b.kind
  AND a.link_path = b.link_path
  AND (a.entity_type IS NULL OR a.entity_id IS NULL)
  AND (b.entity_type IS NULL OR b.entity_id IS NULL)
  AND a.created_at < b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS notifications_unique_unread_entity_public
  ON public.notifications (user_id, entity_type, entity_id, kind)
  WHERE read_at IS NULL AND entity_type IS NOT NULL AND entity_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS notifications_unique_unread_entity_demo
  ON demo.notifications (user_id, entity_type, entity_id, kind)
  WHERE read_at IS NULL AND entity_type IS NOT NULL AND entity_id IS NOT NULL;
