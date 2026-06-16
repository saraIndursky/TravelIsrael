import type { EntityType, Favorite } from "@/types";
import { getCurrentUser } from "./auth";
import { generateId, getStore, updateStore } from "./store";

function matchFavorite(f: Favorite, userId: string, entityType: EntityType, entityId: string): boolean {
  return f.user_id === userId && f.entity_type === entityType && f.entity_id === entityId;
}

export async function getUserFavorites(): Promise<Favorite[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return getStore().favorites.filter((f) => f.user_id === user.id);
}

export async function isFavoriteEntity(entityType: EntityType, entityId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return getStore().favorites.some((f) => matchFavorite(f, user.id, entityType, entityId));
}

export async function isFavorite(tripId: string): Promise<boolean> {
  return isFavoriteEntity("trip", tripId);
}

export async function toggleFavoriteEntity(
  entityType: EntityType,
  entityId: string
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const store = getStore();
  const existing = store.favorites.find((f) => matchFavorite(f, user.id, entityType, entityId));

  if (existing) {
    updateStore((s) => ({
      ...s,
      favorites: s.favorites.filter((f) => f.id !== existing.id),
      trips:
        entityType === "trip"
          ? s.trips.map((t) =>
              t.id === entityId
                ? { ...t, favorites_count: Math.max(0, t.favorites_count - 1) }
                : t
            )
          : s.trips,
    }));
    return false;
  }

  const favorite: Favorite = {
    id: generateId("f"),
    user_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
    created_at: new Date().toISOString(),
  };

  updateStore((s) => ({
    ...s,
    favorites: [...s.favorites, favorite],
    trips:
      entityType === "trip"
        ? s.trips.map((t) =>
            t.id === entityId ? { ...t, favorites_count: t.favorites_count + 1 } : t
          )
        : s.trips,
  }));
  return true;
}

export async function toggleFavorite(tripId: string): Promise<boolean> {
  return toggleFavoriteEntity("trip", tripId);
}

export async function getFavoriteTrips() {
  const favorites = await getUserFavorites();
  const store = getStore();
  const tripIds = favorites.filter((f) => f.entity_type === "trip").map((f) => f.entity_id);
  return store.trips.filter((t) => tripIds.includes(t.id));
}

export async function getFavoritePlaces() {
  const favorites = await getUserFavorites();
  const store = getStore();
  const placeIds = favorites.filter((f) => f.entity_type === "place").map((f) => f.entity_id);
  return store.places.filter((p) => placeIds.includes(p.id));
}

export async function getFavoriteTrails() {
  const favorites = await getUserFavorites();
  const store = getStore();
  const trailIds = favorites.filter((f) => f.entity_type === "trail").map((f) => f.entity_id);
  return store.trails.filter((t) => trailIds.includes(t.id));
}
