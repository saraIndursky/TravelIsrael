import { getPlaces } from "@/lib/data/places";
import { getTrails } from "@/lib/data/trails";
import { getTrips } from "@/lib/data/trips";
import type { Place, Trail, Trip } from "@/types";

export interface GlobalSearchParams {
  q: string;
  limit?: number;
}

export interface GlobalSearchResults {
  trips: Trip[];
  places: Place[];
  trails: Trail[];
  total: number;
}

const DEFAULT_LIMIT = 50;

export async function globalSearch({
  q,
  limit = DEFAULT_LIMIT,
}: GlobalSearchParams): Promise<GlobalSearchResults> {
  const query = q.trim();
  if (!query) {
    return { trips: [], places: [], trails: [], total: 0 };
  }

  const filters = { search: query, status: "approved" as const };

  const [places, trails, tripResult] = await Promise.all([
    getPlaces(filters),
    getTrails(filters),
    getTrips(filters, "name", "asc", 0, limit),
  ]);

  const trips = tripResult.trips.slice(0, limit);
  const total = trips.length + places.length + trails.length;

  return { trips, places, trails, total };
}
