import type { EntityType, Favorite, Trip } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { mapFavorite, mapPlace, mapTrail, mapTrip } from "@/lib/supabase/mappers";
import { getCurrentUser } from "./auth";

export async function getUserFavorites(): Promise<Favorite[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("favorites").select("*").eq("user_id", user.id);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapFavorite);
}

export async function isFavoriteEntity(entityType: EntityType, entityId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
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

  const supabase = createClient();
  const { data: existing, error: existingError } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user.id)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
    if (error) throw new Error(error.message);
    return false;
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
  });
  if (error) throw new Error(error.message);
  return true;
}

export async function toggleFavorite(tripId: string): Promise<boolean> {
  return toggleFavoriteEntity("trip", tripId);
}

export async function getFavoriteTrips(): Promise<Trip[]> {
  const favorites = await getUserFavorites();
  const tripIds = favorites.filter((f) => f.entity_type === "trip").map((f) => f.entity_id);
  if (tripIds.length === 0) return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("trips").select("*").in("id", tripIds);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTrip);
}

export async function getFavoritePlaces() {
  const favorites = await getUserFavorites();
  const placeIds = favorites.filter((f) => f.entity_type === "place").map((f) => f.entity_id);
  if (placeIds.length === 0) return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("places").select("*").in("id", placeIds);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapPlace);
}

export async function getFavoriteTrails() {
  const favorites = await getUserFavorites();
  const trailIds = favorites.filter((f) => f.entity_type === "trail").map((f) => f.entity_id);
  if (trailIds.length === 0) return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("trails").select("*").in("id", trailIds);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTrail);
}
