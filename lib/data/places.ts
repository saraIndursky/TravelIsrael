import type { Accessibility, Place, Region, Status } from "@/types";
import { canViewStatus, getCurrentRole, getCurrentUser } from "./auth";
import { generateId, getStore, updateStore } from "./store";

export interface PlaceFilters {
  region?: Region;
  place_type?: string;
  tags?: string[];
  accessibility?: number;
  search?: string;
  status?: Status;
  createdBy?: string;
}

export interface CreatePlaceInput {
  name: string;
  short_description: string;
  full_description: string;
  address: string;
  lat: number;
  lng: number;
  region: Region;
  place_type: string;
  accessibility: Accessibility;
  tags: string[];
  avg_duration_minutes: number;
  estimated_price: number;
  opening_time?: string;
  closing_time?: string;
  phone?: string;
  website?: string;
  image_url: string;
}

export const PLACE_TYPE_OPTIONS = [
  "מוזיאון",
  "חוף",
  "אתר מורשת",
  "גן לאומי",
  "שוק",
  "עיר עתיקה",
  "מערה",
  "מרכז קניות",
  "מצודה",
  "פארק",
  "אתר דתי",
  "אחר",
] as const;

const DEFAULT_PLACE_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";

export async function getPlaces(filters?: PlaceFilters): Promise<Place[]> {
  const store = getStore();
  const user = await getCurrentUser();
  const role = await getCurrentRole();

  let places = store.places.filter((p) =>
    canViewStatus(p.status, p.created_by, role, user?.id ?? null)
  );

  if (filters?.createdBy) places = places.filter((p) => p.created_by === filters.createdBy);
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

export async function createPlace(data: CreatePlaceInput): Promise<Place> {
  const user = await getCurrentUser();
  if (!user) throw new Error("יש להתחבר כדי ליצור מקום");

  const now = new Date().toISOString();
  const imageUrl = data.image_url.trim() || DEFAULT_PLACE_IMAGE;

  const place: Place = {
    id: generateId("place"),
    name: data.name.trim(),
    short_description: data.short_description.trim(),
    full_description: data.full_description.trim(),
    address: data.address.trim(),
    lat: data.lat,
    lng: data.lng,
    region: data.region,
    place_type: data.place_type,
    accessibility: data.accessibility,
    tags: data.tags,
    avg_duration_minutes: data.avg_duration_minutes,
    estimated_price: data.estimated_price,
    opening_time: data.opening_time?.trim() || undefined,
    closing_time: data.closing_time?.trim() || undefined,
    phone: data.phone?.trim() || undefined,
    website: data.website?.trim() || undefined,
    image_url: imageUrl,
    created_by: user.id,
    status: "pending",
    updated_at: now,
  };

  updateStore((store) => ({
    ...store,
    places: [...store.places, place],
  }));

  return place;
}

export async function deletePlace(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const store = getStore();
  const existing = store.places.find((p) => p.id === id);
  if (!existing) return false;
  if (role !== "admin" && existing.created_by !== user?.id) return false;
  if (existing.status === "approved" && role !== "admin") return false;

  updateStore((s) => ({
    ...s,
    places: s.places.filter((p) => p.id !== id),
  }));
  return true;
}

export async function updatePlaceStatus(id: string, status: Status, rejectionReason?: string | null): Promise<Place | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;
  updateStore((store) => ({
    ...store,
    places: store.places.map((p) =>
      p.id === id
        ? {
            ...p,
            status,
            rejection_reason: status === "rejected" ? rejectionReason?.trim() || undefined : status === "approved" ? undefined : p.rejection_reason,
            updated_at: new Date().toISOString(),
          }
        : p
    ),
  }));
  return getPlaceById(id);
}

export async function restorePlace(id: string): Promise<Place | null> {
  return updatePlaceStatus(id, "pending", null);
}

export async function getAllPlacesAdmin(): Promise<Place[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];
  return getStore().places;
}
