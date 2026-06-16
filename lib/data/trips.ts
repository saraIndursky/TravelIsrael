import type { Difficulty, Region, Status, Trip, TripStation, TripWithStations } from "@/types";
import { computeTripStats } from "@/lib/utils/trip-calculations";
import { canViewStatus, getCurrentRole, getCurrentUser } from "./auth";
import { generateId, getStore, updateStore } from "./store";

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

export async function getTrips(
  filters?: TripFilters,
  sort: TripSort = "createAt",
  direction: SortDirection = "desc",
  page = 0,
  pageSize = 20
): Promise<{ trips: Trip[]; total: number }> {
  const store = getStore();
  const user = await getCurrentUser();
  const role = await getCurrentRole();

  let trips = store.trips.filter((t) =>
    canViewStatus(t.status, t.created_by, role, user?.id ?? null)
  );

  if (filters?.status) trips = trips.filter((t) => t.status === filters.status);
  if (filters?.createdBy) trips = trips.filter((t) => t.created_by === filters.createdBy);
  if (filters?.region) trips = trips.filter((t) => t.region === filters.region);
  if (filters?.difficulty) trips = trips.filter((t) => t.difficulty === filters.difficulty);
  if (filters?.accessibility)
    trips = trips.filter((t) => t.accessibility >= filters.accessibility!);
  if (filters?.tags?.length)
    trips = trips.filter((t) => filters.tags!.some((tag) => t.tags.includes(tag)));
  if (filters?.tripType)
    trips = trips.filter((t) => t.tags.includes(filters.tripType!));
  if (filters?.stationCount)
    trips = trips.filter((t) => t.station_count >= filters.stationCount!);
  if (filters?.maxDistance)
    trips = trips.filter((t) => t.total_distance_km <= filters.maxDistance!);
  if (filters?.maxPrice !== undefined && filters.maxPrice > 0)
    trips = trips.filter((t) => t.estimated_price <= filters.maxPrice!);
  if (filters?.minDuration)
    trips = trips.filter((t) => t.total_duration_minutes >= filters.minDuration!);
  if (filters?.maxDuration)
    trips = trips.filter((t) => t.total_duration_minutes <= filters.maxDuration!);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    trips = trips.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.short_description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
    );
  }

  trips = sortTrips(trips, sort, direction);
  const total = trips.length;
  const paginated = trips.slice(page * pageSize, (page + 1) * pageSize);
  return { trips: paginated, total };
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

export async function getTripById(id: string): Promise<TripWithStations | null> {
  const { trips } = await getTrips();
  const trip = trips.find((t) => t.id === id);
  if (!trip) {
    const role = await getCurrentRole();
    const user = await getCurrentUser();
    const store = getStore();
    const raw = store.trips.find((t) => t.id === id);
    if (!raw || !canViewStatus(raw.status, raw.created_by, role, user?.id ?? null)) return null;
    return { ...raw, stations: store.tripStations.filter((s) => s.trip_id === id) };
  }
  const store = getStore();
  return { ...trip, stations: store.tripStations.filter((s) => s.trip_id === id) };
}

export async function createTrip(
  data: Omit<Trip, "id" | "created_at" | "updated_at" | "views_count" | "favorites_count" | "avg_rating" | "created_by"> & {
    stations?: Omit<TripStation, "id" | "trip_id">[];
  }
): Promise<TripWithStations> {
  const user = await getCurrentUser();
  if (!user) throw new Error("יש להתחבר כדי ליצור טיול");

  const id = generateId("trip");
  const now = new Date().toISOString();
  const trip: Trip = {
    ...data,
    gallery_images: data.gallery_images ?? [],
    id,
    created_by: user.id,
    views_count: 0,
    favorites_count: 0,
    avg_rating: 0,
    created_at: now,
    updated_at: now,
  };

  const stations: TripStation[] = (data.stations ?? []).map((s, i) => ({
    ...s,
    id: generateId("ts"),
    trip_id: id,
    order_index: i,
  }));

  updateStore((store) => ({
    ...store,
    trips: [...store.trips, trip],
    tripStations: [...store.tripStations, ...stations],
  }));

  return { ...trip, stations };
}

export async function updateTrip(
  id: string,
  data: Partial<Trip> & { stations?: TripStation[] }
): Promise<TripWithStations | null> {
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const store = getStore();
  const existing = store.trips.find((t) => t.id === id);
  if (!existing) return null;
  if (role !== "admin" && existing.created_by !== user?.id) return null;

  const { stations, ...tripData } = data;
  const updated: Trip = { ...existing, ...tripData, updated_at: new Date().toISOString() };

  updateStore((s) => {
    let tripStations = s.tripStations;
    if (stations) {
      tripStations = [
        ...s.tripStations.filter((st) => st.trip_id !== id),
        ...stations.map((st, i) => ({ ...st, trip_id: id, order_index: i })),
      ];
    }
    return {
      ...s,
      trips: s.trips.map((t) => (t.id === id ? updated : t)),
      tripStations,
    };
  });

  return getTripById(id);
}

export async function updateTripStatus(id: string, status: Status): Promise<Trip | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;
  const patch: Partial<Trip> = { status };
  if (status === "approved") patch.rejection_reason = undefined;
  const result = await updateTrip(id, patch);
  return result;
}

export async function rejectTrip(id: string, reason?: string): Promise<Trip | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;
  return updateTrip(id, { status: "rejected", rejection_reason: reason?.trim() || undefined });
}

export async function restoreTrip(id: string): Promise<Trip | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;
  return updateTrip(id, { status: "pending", rejection_reason: undefined });
}

export async function submitTripForApproval(id: string): Promise<Trip | null> {
  const user = await getCurrentUser();
  const store = getStore();
  const existing = store.trips.find((t) => t.id === id);
  if (!existing || existing.created_by !== user?.id) return null;
  if (existing.status !== "draft" && existing.status !== "rejected") return null;
  const result = await updateTrip(id, { status: "pending", rejection_reason: undefined });
  return result;
}

export async function deleteTrip(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const store = getStore();
  const existing = store.trips.find((t) => t.id === id);
  if (!existing) return false;
  if (role !== "admin" && existing.created_by !== user?.id) return false;

  updateStore((s) => ({
    ...s,
    trips: s.trips.filter((t) => t.id !== id),
    tripStations: s.tripStations.filter((st) => st.trip_id !== id),
  }));
  return true;
}

export async function recalculateTripStats(tripId: string): Promise<Trip | null> {
  const store = getStore();
  const stations = store.tripStations.filter((s) => s.trip_id === tripId);
  const stats = computeTripStats(stations, store.places, store.trails);
  return updateTrip(tripId, stats);
}

export async function getAllTripsAdmin(): Promise<Trip[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];
  return getStore().trips;
}

export async function incrementTripViews(id: string): Promise<void> {
  updateStore((s) => ({
    ...s,
    trips: s.trips.map((t) => (t.id === id ? { ...t, views_count: t.views_count + 1 } : t)),
  }));
}

export async function getTripsContainingEntity(
  entityType: "place" | "trail",
  entityId: string
): Promise<Trip[]> {
  const store = getStore();
  const stationTripIds = store.tripStations
    .filter((s) =>
      entityType === "place" ? s.place_id === entityId : s.trail_id === entityId
    )
    .map((s) => s.trip_id);
  const { trips } = await getTrips();
  return trips.filter((t) => stationTripIds.includes(t.id));
}

export async function addTripGalleryImage(
  tripId: string,
  imageUrl: string
): Promise<TripWithStations | null> {
  const user = await getCurrentUser();
  if (!user || !imageUrl.trim()) return null;

  const store = getStore();
  const existing = store.trips.find((t) => t.id === tripId);
  if (!existing) return null;

  const gallery_images = [...(existing.gallery_images ?? []), imageUrl.trim()];
  updateStore((s) => ({
    ...s,
    trips: s.trips.map((t) =>
      t.id === tripId ? { ...t, gallery_images, updated_at: new Date().toISOString() } : t
    ),
  }));

  return getTripById(tripId);
}

export async function duplicateTrip(id: string): Promise<TripWithStations | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const original = await getTripById(id);
  if (!original) return null;

  const { stations, ...tripData } = original;

  return createTrip({
    name: `${original.name} (עותק)`,
    short_description: original.short_description,
    full_description: original.full_description,
    main_image: original.main_image,
    gallery_images: [...(original.gallery_images ?? [])],
    tags: [...original.tags],
    status: "draft",
    total_duration_minutes: original.total_duration_minutes,
    total_distance_km: original.total_distance_km,
    estimated_price: original.estimated_price,
    difficulty: original.difficulty,
    accessibility: original.accessibility,
    region: original.region,
    station_count: original.station_count,
    stations: stations.map((s) => ({
      order_index: s.order_index,
      station_type: s.station_type,
      place_id: s.place_id,
      trail_id: s.trail_id,
      travel_mode: s.travel_mode,
    })),
  });
}
