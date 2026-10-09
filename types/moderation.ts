import type { EntityType } from "./enums";

export type ModerationKind = "comment" | "gallery_image";

export interface ModerationQueueItem {
  id: string;
  kind: ModerationKind;
  entity_type: EntityType;
  entity_id: string;
  entity_name: string;
  content: string;
  source_id: string;
  created_by: string;
  seen_at?: string;
  seen_by?: string;
  created_at: string;
}
