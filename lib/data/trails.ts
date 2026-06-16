import type { Accessibility, Difficulty, Region, Status, Trail } from "@/types";
import { canViewStatus, getCurrentRole, getCurrentUser } from "./auth";
import { generateId, getStore, updateStore } from "./store";

export interface TrailFilters {
  region?: Region;
  difficulty?: Difficulty;
  trail_type?: string;
  tags?: string[];
  accessibility?: number;
  search?: string;
  status?: Status;
  createdBy?: string;
}

export interface CreateTrailInput {
  name: string;
  short_description: string;
  full_description: string;
  region: Region;
  trail_type: string;
  length_km: number;
  duration_minutes: number;
  difficulty: Difficulty;
  accessibility: Accessibility;
  tags: string[];
  estimated_price: number;
  operating_hours?: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  waypoints: { lat: number; lng: number; name?: string }[];
  image_url: string;
}

export const TRAIL_TYPE_OPTIONS = [
  "הליכה",
  "מים",
  "טיפוס",
  "אופניים",
  "רכיבה",
  "אחר",
] as const;

const DEFAULT_TRAIL_IMAGE =
  "https://images.unsplash.com/photo-1551632811-561732b1c4e9?w=800";

export async function getTrails(filters?: TrailFilters): Promise<Trail[]> {
  const store = getStore();
  const user = await getCurrentUser();
  const role = await getCurrentRole();

  let trails = store.trails.filter((t) =>
    canViewStatus(t.status, t.created_by, role, user?.id ?? null)
  );

  if (filters?.createdBy) trails = trails.filter((t) => t.created_by === filters.createdBy);
  if (filters?.status) trails = trails.filter((t) => t.status === filters.status);
  if (filters?.region) trails = trails.filter((t) => t.region === filters.region);
  if (filters?.difficulty) trails = trails.filter((t) => t.difficulty === filters.difficulty);
  if (filters?.trail_type) trails = trails.filter((t) => t.trail_type === filters.trail_type);
  if (filters?.accessibility)
    trails = trails.filter((t) => t.accessibility >= filters.accessibility!);
  if (filters?.tags?.length)
    trails = trails.filter((t) => filters.tags!.some((tag) => t.tags.includes(tag)));
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    trails = trails.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.short_description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
    );
  }

  return trails;
}

export async function getTrailById(id: string): Promise<Trail | null> {
  const trails = await getTrails();
  return trails.find((t) => t.id === id) ?? null;
}

export async function createTrail(data: CreateTrailInput): Promise<Trail> {
  const user = await getCurrentUser();
  if (!user) throw new Error("יש להתחבר כדי ליצור מסלול");

  const now = new Date().toISOString();
  const imageUrl = data.image_url.trim() || DEFAULT_TRAIL_IMAGE;

  const trail: Trail = {
    id: generateId("trail"),
    name: data.name.trim(),
    short_description: data.short_description.trim(),
    full_description: data.full_description.trim(),
    region: data.region,
    trail_type: data.trail_type,
    length_km: data.length_km,
    duration_minutes: data.duration_minutes,
    difficulty: data.difficulty,
    accessibility: data.accessibility,
    tags: data.tags,
    estimated_price: data.estimated_price,
    operating_hours: data.operating_hours?.trim() || undefined,
    start_lat: data.start_lat,
    start_lng: data.start_lng,
    end_lat: data.end_lat,
    end_lng: data.end_lng,
    waypoints: data.waypoints.map((w) => ({
      lat: w.lat,
      lng: w.lng,
      name: w.name?.trim() || undefined,
    })),
    image_url: imageUrl,
    created_by: user.id,
    status: "pending",
    updated_at: now,
  };

  updateStore((store) => ({
    ...store,
    trails: [...store.trails, trail],
  }));

  return trail;
}

export async function deleteTrail(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const store = getStore();
  const existing = store.trails.find((t) => t.id === id);
  if (!existing) return false;
  if (role !== "admin" && existing.created_by !== user?.id) return false;
  if (existing.status === "approved" && role !== "admin") return false;

  updateStore((s) => ({
    ...s,
    trails: s.trails.filter((t) => t.id !== id),
  }));
  return true;
}

export async function updateTrailStatus(id: string, status: Status, rejectionReason?: string | null): Promise<Trail | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;
  updateStore((store) => ({
    ...store,
    trails: store.trails.map((t) =>
      t.id === id
        ? {
            ...t,
            status,
            rejection_reason: status === "rejected" ? rejectionReason?.trim() || undefined : status === "approved" ? undefined : t.rejection_reason,
            updated_at: new Date().toISOString(),
          }
        : t
    ),
  }));
  return getTrailById(id);
}

export async function restoreTrail(id: string): Promise<Trail | null> {
  return updateTrailStatus(id, "pending", null);
}

export async function getAllTrailsAdmin(): Promise<Trail[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];
  return getStore().trails;
}
