import type { Favorite } from "@/types";
import { getCurrentUser } from "./auth";
import { generateId, getStore, updateStore } from "./store";

export async function getUserFavorites(): Promise<Favorite[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return getStore().favorites.filter((f) => f.user_id === user.id);
}

export async function isFavorite(tripId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return getStore().favorites.some((f) => f.user_id === user.id && f.trip_id === tripId);
}

export async function toggleFavorite(tripId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const store = getStore();
  const existing = store.favorites.find(
    (f) => f.user_id === user.id && f.trip_id === tripId
  );

  if (existing) {
    updateStore((s) => ({
      ...s,
      favorites: s.favorites.filter((f) => f.id !== existing.id),
      trips: s.trips.map((t) =>
        t.id === tripId ? { ...t, favorites_count: Math.max(0, t.favorites_count - 1) } : t
      ),
    }));
    return false;
  }

  const favorite: Favorite = {
    id: generateId("f"),
    user_id: user.id,
    trip_id: tripId,
    created_at: new Date().toISOString(),
  };
  updateStore((s) => ({
    ...s,
    favorites: [...s.favorites, favorite],
    trips: s.trips.map((t) =>
      t.id === tripId ? { ...t, favorites_count: t.favorites_count + 1 } : t
    ),
  }));
  return true;
}

export async function getFavoriteTrips() {
  const favorites = await getUserFavorites();
  const store = getStore();
  return store.trips.filter((t) => favorites.some((f) => f.trip_id === t.id));
}
