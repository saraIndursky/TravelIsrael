export type AssistantEntity = "place" | "trail" | "trip";

export type AssistantContext = "create" | "detail";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantFieldUpdate {
  field: string;
  value: unknown;
  label: string;
}

export interface AssistantResponse {
  message: string;
  updates?: AssistantFieldUpdate[];
  offTopic?: boolean;
}

export interface AssistantRequestBody {
  entity: AssistantEntity;
  messages: AssistantMessage[];
  formSnapshot: Record<string, unknown>;
  context: AssistantContext;
}

export type QuickActionId =
  | "full_description"
  | "short_description"
  | "accessibility"
  | "coordinates"
  | "tags"
  | "duration_price"
  | "waypoints"
  | "fill_missing"
  | "stations_hint";
