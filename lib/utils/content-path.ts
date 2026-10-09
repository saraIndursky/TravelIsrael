import type { EntityType } from "@/types";

export interface ContentRef {
  id: string;
  slug?: string;
}

export function contentKey(entity: ContentRef): string {
  return entity.slug?.trim() || entity.id;
}

export function tripPath(trip: ContentRef): string {
  return `/trips/${contentKey(trip)}`;
}

export function tripEditPath(trip: ContentRef): string {
  return `${tripPath(trip)}/edit`;
}

export function placePath(place: ContentRef): string {
  return `/places/${contentKey(place)}`;
}

export function placeEditPath(place: ContentRef): string {
  return `${placePath(place)}/edit`;
}

export function trailPath(trail: ContentRef): string {
  return `/trails/${contentKey(trail)}`;
}

export function trailEditPath(trail: ContentRef): string {
  return `${trailPath(trail)}/edit`;
}

export function entityPath(type: EntityType, entity: ContentRef): string {
  if (type === "trip") return tripPath(entity);
  if (type === "place") return placePath(entity);
  return trailPath(entity);
}
