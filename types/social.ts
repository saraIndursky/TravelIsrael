import type { EntityType, ReportType } from "./enums";

export interface Rating {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  score: number;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  content: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  report_type: ReportType;
  reason: string;
  status: "pending" | "resolved" | "rejected";
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface Image {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  url: string;
  storage_path: string;
  created_at: string;
}
