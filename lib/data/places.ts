import type { Place, Region, Status } from "@/types";
import { canViewStatus, getCurrentRole, getCurrentUser } from "./auth";
import { getStore } from "./store";

export interface PlaceFilters {
  region?: Region;
  place_type?: string;
  tags?: string[];
  accessibility?: number;
  search?: string;
  status?: Status;
}

export async function getPlaces(filters?: PlaceFilters): Promise<Place[]> {
  const store = getStore();
  const user = await getCurrentUser();
  const role = await getCurrentRole();

  let places = store.places.filter((p) =>
    canViewStatus(p.status, p.created_by, role, user?.id ?? null)
  );

  if (filters?.status) places = places.filter((p) => p.status === filters.status);
  if (filters?.region) places = places.filter((p) => p.region === filters.region);
  if (filters?.place_type) places = places.filter((p) => p.place_type === filters.place_type);
  if (filters?.accessibility)
    places = places.filter((p) => p.accessibility >= filters.accessibility!);
  if (filters?.tags?.length)
    places = places.filter((p) => filters.tags!.some((t) => p.tags.includes(t)));
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    places = places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }

  return places;
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const places = await getPlaces();
  return places.find((p) => p.id === id) ?? null;
}

export async function updatePlaceStatus(id: string, status: Status): Promise<Place | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;
  const { updateStore } = await import("./store");
  updateStore((store) => ({
    ...store,
    places: store.places.map((p) =>
      p.id === id ? { ...p, status, updated_at: new Date().toISOString() } : p
    ),
  }));
  return getPlaceById(id);
}

export async function getAllPlacesAdmin(): Promise<Place[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];
  return getStore().places;
}
