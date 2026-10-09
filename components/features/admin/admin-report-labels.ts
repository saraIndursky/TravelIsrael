import type { EntityType, ReportType } from "@/types";

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  trip: "טיול",
  place: "מקום",
  trail: "מסלול",
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  problem: "בעיה",
  inaccuracy: "חוסר נכונות",
  update: "עדכון",
};

export function entityHref(type: EntityType, id: string): string {
  if (type === "trip") return `/trips/${id}`;
  if (type === "place") return `/places/${id}`;
  return `/trails/${id}`;
}
