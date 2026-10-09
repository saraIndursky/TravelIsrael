import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mapTrip } from "@/lib/supabase/mappers";
import { slugOrIdColumn } from "@/lib/utils/slug";
import type { Trip } from "@/types";
import type { TripFilters, TripSort, SortDirection } from "@/lib/data/trips";

function sortTrips(trips: Trip[], sort: TripSort, direction: SortDirection): Trip[] {
  const sorted = [...trips];
  const factor = direction === "asc" ? 1 : -1;

  const compare = (a: number | string, b: number | string) => {
    if (typeof a === "string" && typeof b === "string") {
      return a.localeCompare(b, "he") * factor;
    }
    return ((a as number) - (b as number)) * factor;
  };

  switch (sort) {
    case "numberOfViews":
      return sorted.sort((a, b) => compare(a.views_count, b.views_count));
    case "name":
      return sorted.sort((a, b) => compare(a.name, b.name));
    case "price":
      return sorted.sort((a, b) => compare(a.estimated_price, b.estimated_price));
    case "duration":
      return sorted.sort((a, b) => compare(a.total_duration_minutes, b.total_duration_minutes));
    case "lengthKM":
      return sorted.sort((a, b) => compare(a.total_distance_km, b.total_distance_km));
    case "createAt":
    default:
      return sorted.sort((a, b) =>
        compare(new Date(a.created_at).getTime(), new Date(b.created_at).getTime())
      );
  }
}

export async function getTripsServer(
  filters?: TripFilters,
  sort: TripSort = "createAt",
  direction: SortDirection = "desc",
  page = 0,
  pageSize = 20
): Promise<{ trips: Trip[]; total: number }> {
  const supabase = createClient();
  let query = supabase.from("trips").select("*");

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.createdBy) query = query.eq("created_by", filters.createdBy);
  if (filters?.region) query = query.eq("region", filters.region);
  if (filters?.difficulty) query = query.eq("difficulty", filters.difficulty);
  if (filters?.accessibility) query = query.gte("accessibility", filters.accessibility);
  if (filters?.stationCount) query = query.gte("station_count", filters.stationCount);
  if (filters?.maxDistance) query = query.lte("total_distance_km", filters.maxDistance);
  if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
    query = query.lte("estimated_price", filters.maxPrice);
  }
  if (filters?.minDuration) query = query.gte("total_duration_minutes", filters.minDuration);
  if (filters?.maxDuration) query = query.lte("total_duration_minutes", filters.maxDuration);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let trips = (data ?? []).map(mapTrip);

  if (filters?.tags?.length) {
    trips = trips.filter((trip) => filters.tags!.some((tag) => trip.tags.includes(tag)));
  }
  if (filters?.tripType) {
    trips = trips.filter((trip) => trip.tags.includes(filters.tripType!));
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    trips = trips.filter(
      (trip) =>
        trip.name.toLowerCase().includes(q) ||
        trip.short_description.toLowerCase().includes(q) ||
        trip.tags.some((tag) => tag.includes(q))
    );
  }

  trips = sortTrips(trips, sort, direction);
  const total = trips.length;
  const paginated = trips.slice(page * pageSize, (page + 1) * pageSize);
  return { trips: paginated, total };
}

export async function getPublicTripByIdServer(id: string): Promise<Trip | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq(slugOrIdColumn(id), id)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) return null;
  return mapTrip(data);
}
