import type { Difficulty, Region, Status, Trip, TripStation, TripWithStations, UserRole } from "@/types";
import { computeTripStats } from "@/lib/utils/trip-calculations";
import { createClient } from "@/lib/supabase/client";
import { mapTrip, mapTripStation } from "@/lib/supabase/mappers";
import { notifyFavoriteEntityUpdated } from "@/lib/notifications/client";
import { canHardDeleteContent, HARD_DELETE_APPROVED_MESSAGE } from "./content-delete";
import { insertWithUniqueSlug } from "./slugs";
import { slugOrIdColumn } from "@/lib/utils/slug";
import { isVisibleInDiscoveryList } from "./content-access";
import { canViewStatus, getCurrentRole, getCurrentUser } from "./auth";
import { isFavoriteEntity } from "./favorites";
import { getPlaces } from "./places";
import { getTrails } from "./trails";
import { toStoredImageUrl } from "@/lib/utils/image-url";

export type TripSort =
  | "createAt"
  | "name"
  | "price"
  | "duration"
  | "lengthKM"
  | "numberOfViews";

export type SortDirection = "asc" | "desc";

export interface TripFilters {
  region?: Region;
  difficulty?: Difficulty;
  accessibility?: number;
  tags?: string[];
  tripType?: string;
  stationCount?: number;
  minDuration?: number;
  maxDuration?: number;
  maxDistance?: number;
  maxPrice?: number;
  search?: string;
  status?: Status;
  createdBy?: string;
}

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

async function fetchTripStations(tripId: string): Promise<TripStation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trip_stations")
    .select("*")
    .eq("trip_id", tripId)
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTripStation);
}

export async function getTrips(
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

  const user = await getCurrentUser();
  const role = await getCurrentRole();
  let trips = (data ?? [])
    .map(mapTrip)
    .filter((trip) => isVisibleInDiscoveryList(trip.status, Boolean(filters?.createdBy)))
    .filter((trip) => canViewStatus(trip.status, trip.created_by, role, user?.id ?? null));

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

export async function getTripById(id: string): Promise<TripWithStations | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq(slugOrIdColumn(id), id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const trip = mapTrip(data);
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const favorited = user ? await isFavoriteEntity("trip", trip.id) : false;
  if (!canViewStatus(trip.status, trip.created_by, role, user?.id ?? null, favorited)) return null;

  const stations = await fetchTripStations(trip.id);
  return { ...trip, stations };
}

export async function createTrip(
  data: Omit<
    Trip,
    "id" | "created_at" | "updated_at" | "views_count" | "favorites_count" | "avg_rating" | "created_by" | "slug"
  > & {
    stations?: Omit<TripStation, "id" | "trip_id">[];
  }
): Promise<TripWithStations> {
  const user = await getCurrentUser();
  if (!user) throw new Error("יש להתחבר כדי ליצור טיול");

  const supabase = createClient();
  const row = await insertWithUniqueSlug(data.name, async (slug) => {
    const result = await supabase
      .from("trips")
      .insert({
        name: data.name,
        slug,
        short_description: data.short_description,
        full_description: data.full_description,
        main_image: toStoredImageUrl(data.main_image),
        gallery_images: (data.gallery_images ?? []).map(toStoredImageUrl),
        tags: data.tags,
        created_by: user.id,
        status: data.status,
        total_duration_minutes: data.total_duration_minutes,
        total_distance_km: data.total_distance_km,
        estimated_price: data.estimated_price,
        difficulty: data.difficulty,
        accessibility: data.accessibility,
        region: data.region,
        station_count: data.station_count,
      })
      .select("*")
      .single();
    return { data: result.data, error: result.error };
  });

  const stationsInput = (data.stations ?? []).map((station, index) => ({
    trip_id: row.id,
    order_index: index,
    station_type: station.station_type,
    place_id: station.place_id,
    trail_id: station.trail_id,
    travel_mode: station.travel_mode ?? null,
  }));

  let stations: TripStation[] = [];
  if (stationsInput.length > 0) {
    const { data: stationRows, error: stationError } = await supabase
      .from("trip_stations")
      .insert(stationsInput)
      .select("*");
    if (stationError) throw new Error(stationError.message);
    stations = (stationRows ?? []).map(mapTripStation);
  }

  return { ...mapTrip(row), stations };
}

export function canEditTrip(trip: Trip, role: UserRole, userId: string | null): boolean {
  if (role === "admin") return true;
  if (!userId || trip.created_by !== userId) return false;
  return trip.status === "draft" || trip.status === "pending" || trip.status === "rejected";
}

function resolveOwnerStatusOnUpdate(
  existing: Trip,
  requestedStatus?: Status
): Partial<Pick<Trip, "status" | "rejection_reason">> {
  if (existing.status === "draft") {
    if (requestedStatus === "pending") {
      return { status: "pending", rejection_reason: undefined };
    }
    return { status: "draft" };
  }

  return { status: "pending", rejection_reason: undefined };
}

export async function updateTrip(
  id: string,
  data: Partial<Trip> & { stations?: TripStation[] }
): Promise<TripWithStations | null> {
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const existing = await getTripById(id);
  if (!existing) return null;
  if (!canEditTrip(existing, role, user?.id ?? null)) return null;

  const {
    stations,
    status: requestedStatus,
    rejection_reason,
    slug: _slug,
    ...tripData
  } = data;
  const isAdmin = role === "admin";
  const supabase = createClient();

  const statusPatch = isAdmin
    ? requestedStatus !== undefined
      ? {
          status: requestedStatus,
          rejection_reason:
            requestedStatus === "rejected"
              ? rejection_reason?.trim() || null
              : requestedStatus === "approved" || requestedStatus === "pending"
                ? null
                : existing.rejection_reason,
        }
      : {}
    : resolveOwnerStatusOnUpdate(existing, requestedStatus);

  const { error } = await supabase
    .from("trips")
    .update({
      ...tripData,
      ...statusPatch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (stations) {
    await supabase.from("trip_stations").delete().eq("trip_id", id);
    if (stations.length > 0) {
      const { error: stationError } = await supabase.from("trip_stations").insert(
        stations.map((station, index) => ({
          trip_id: id,
          order_index: index,
          station_type: station.station_type,
          place_id: station.place_id,
          trail_id: station.trail_id,
          travel_mode: station.travel_mode ?? null,
        }))
      );
      if (stationError) throw new Error(stationError.message);
    }
  }

  const result = await getTripById(id);
  if (result && !isAdmin) {
    void notifyFavoriteEntityUpdated({ entityType: "trip", entityId: id });
  }
  return result;
}

export async function updateTripStatus(id: string, status: Status): Promise<Trip | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .update({
      status,
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapTrip(data);
}

export async function removeTripFromSite(id: string, reason?: string | null): Promise<Trip | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .update({
      status: "removed",
      removal_reason: reason?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapTrip(data);
}

export async function rejectTrip(id: string, reason?: string): Promise<Trip | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .update({
      status: "rejected",
      rejection_reason: reason?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapTrip(data);
}

export async function restoreTrip(id: string): Promise<Trip | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .update({
      status: "pending",
      rejection_reason: null,
      removal_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapTrip(data);
}

export async function submitTripForApproval(id: string): Promise<Trip | null> {
  const user = await getCurrentUser();
  const existing = await getTripById(id);
  if (!existing || existing.created_by !== user?.id) return null;
  if (existing.status !== "draft" && existing.status !== "rejected" && existing.status !== "removed") {
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .update({
      status: "pending",
      rejection_reason: null,
      removal_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapTrip(data);
}

export async function deleteTrip(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const existing = await getTripById(id);
  if (!existing) return false;
  if (!canHardDeleteContent(existing.status, existing.created_by, role, user?.id ?? null)) {
    throw new Error(HARD_DELETE_APPROVED_MESSAGE);
  }

  const supabase = createClient();
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function recalculateTripStats(tripId: string): Promise<Trip | null> {
  const [stations, places, trails] = await Promise.all([
    fetchTripStations(tripId),
    getPlaces(),
    getTrails(),
  ]);
  const stats = computeTripStats(stations, places, trails);
  return updateTrip(tripId, stats);
}

export async function getAllTripsAdmin(): Promise<Trip[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("trips").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTrip);
}

export async function incrementTripViews(id: string): Promise<void> {
  const trip = await getTripById(id);
  if (!trip) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("trips")
    .update({ views_count: trip.views_count + 1 })
    .eq("id", trip.id);
  if (error) throw new Error(error.message);
}

export async function getTripsContainingEntity(
  entityType: "place" | "trail",
  entityId: string
): Promise<Trip[]> {
  const supabase = createClient();
  const column = entityType === "place" ? "place_id" : "trail_id";
  const { data, error } = await supabase.from("trip_stations").select("trip_id").eq(column, entityId);
  if (error) throw new Error(error.message);

  const tripIds = Array.from(new Set((data ?? []).map((row) => row.trip_id)));
  if (tripIds.length === 0) return [];

  const { trips } = await getTrips();
  return trips.filter((trip) => tripIds.includes(trip.id));
}

export async function duplicateTrip(id: string): Promise<TripWithStations | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const original = await getTripById(id);
  if (!original) return null;

  const { stations, ...tripData } = original;

  return createTrip({
    name: `${original.name} (עותק)`,
    short_description: tripData.short_description,
    full_description: tripData.full_description,
    main_image: tripData.main_image,
    gallery_images: [...(tripData.gallery_images ?? [])],
    tags: [...tripData.tags],
    status: "draft",
    total_duration_minutes: tripData.total_duration_minutes,
    total_distance_km: tripData.total_distance_km,
    estimated_price: tripData.estimated_price,
    difficulty: tripData.difficulty,
    accessibility: tripData.accessibility,
    region: tripData.region,
    station_count: tripData.station_count,
    stations: stations.map((station) => ({
      order_index: station.order_index,
      station_type: station.station_type,
      place_id: station.place_id,
      trail_id: station.trail_id,
      travel_mode: station.travel_mode,
    })),
  });
}
