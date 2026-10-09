import type { EntityType } from "./enums";

export type NotificationKind =
  | "content_approved"
  | "content_rejected"
  | "content_removed"
  | "report_resolved"
  | "report_rejected"
  | "comment_on_my_content"
  | "rating_on_my_content"
  | "new_approved_place"
  | "new_approved_trail"
  | "new_approved_trip"
  | "favorite_entity_updated"
  | "favorite_entity_removed";

export interface Notification {
  id: string;
  user_id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  link_path: string;
  entity_type?: EntityType;
  entity_id?: string;
  read_at?: string;
  created_at: string;
}
