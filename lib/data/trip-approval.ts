import type { Place, Trail, Trip } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { mapPlace, mapTrail, mapTrip } from "@/lib/supabase/mappers";
import { getCurrentRole } from "./auth";

export interface TripPendingStationContent {
  places: Place[];
  trails: Trail[];
}

function uniqueIds(values: (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

export async function getTripPendingStationContent(tripId: string): Promise<TripPendingStationContent> {
  const role = await getCurrentRole();
  if (role !== "admin") return { places: [], trails: [] };

  const supabase = createClient();
  const { data: stations, error: stationsError } = await supabase
    .from("trip_stations")
    .select("place_id, trail_id")
    .eq("trip_id", tripId);

  if (stationsError) throw new Error(stationsError.message);

  const placeIds = uniqueIds((stations ?? []).map((station) => station.place_id));
  const trailIds = uniqueIds((stations ?? []).map((station) => station.trail_id));

  const [placesResult, trailsResult] = await Promise.all([
    placeIds.length > 0
      ? supabase.from("places").select("*").in("id", placeIds).eq("status", "pending")
      : Promise.resolve({ data: [], error: null }),
    trailIds.length > 0
      ? supabase.from("trails").select("*").in("id", trailIds).eq("status", "pending")
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (placesResult.error) throw new Error(placesResult.error.message);
  if (trailsResult.error) throw new Error(trailsResult.error.message);

  return {
    places: (placesResult.data ?? []).map(mapPlace),
    trails: (trailsResult.data ?? []).map(mapTrail),
  };
}

export function hasPendingStationContent(content: TripPendingStationContent): boolean {
  return content.places.length > 0 || content.trails.length > 0;
}

export async function approveTripCascade(tripId: string): Promise<Trip> {
  const role = await getCurrentRole();
  if (role !== "admin") {
    throw new Error("אין הרשאה לאשר טיולים");
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("approve_trip_cascade", { trip_id: tripId });

  if (error) {
    throw new Error(error.message.includes("הרשאה") ? error.message : "אישור הטיול נכשל");
  }
  if (!data) {
    throw new Error("אישור הטיול נכשל");
  }

  return mapTrip(data as Parameters<typeof mapTrip>[0]);
}
