import type { Accessibility, Difficulty, Region, Status, Trail, UserRole } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { mapTrail } from "@/lib/supabase/mappers";
import { notifyFavoriteEntityUpdated } from "@/lib/notifications/client";
import { canHardDeleteContent, HARD_DELETE_APPROVED_MESSAGE } from "./content-delete";
import { insertWithUniqueSlug } from "./slugs";
import { slugOrIdColumn } from "@/lib/utils/slug";
import { canViewContent, isVisibleInDiscoveryList } from "./content-access";
import { getCurrentRole, getCurrentUser } from "./auth";
import { isFavoriteEntity } from "./favorites";

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

export type UpdateTrailInput = CreateTrailInput;

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

function applyTrailFilters(trails: Trail[], filters?: TrailFilters): Trail[] {
  let result = trails;
  if (filters?.createdBy) result = result.filter((t) => t.created_by === filters.createdBy);
  if (filters?.status) result = result.filter((t) => t.status === filters.status);
  if (filters?.region) result = result.filter((t) => t.region === filters.region);
  if (filters?.difficulty) result = result.filter((t) => t.difficulty === filters.difficulty);
  if (filters?.trail_type) result = result.filter((t) => t.trail_type === filters.trail_type);
  if (filters?.accessibility) {
    result = result.filter((t) => t.accessibility >= filters.accessibility!);
  }
  if (filters?.tags?.length) {
    result = result.filter((t) => filters.tags!.some((tag) => t.tags.includes(tag)));
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.short_description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
    );
  }
  return result;
}

export async function getTrails(filters?: TrailFilters): Promise<Trail[]> {
  const supabase = createClient();
  let query = supabase.from("trails").select("*");

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.createdBy) query = query.eq("created_by", filters.createdBy);
  if (filters?.region) query = query.eq("region", filters.region);
  if (filters?.difficulty) query = query.eq("difficulty", filters.difficulty);
  if (filters?.trail_type) query = query.eq("trail_type", filters.trail_type);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return applyTrailFilters((data ?? []).map(mapTrail), filters).filter((trail) =>
    isVisibleInDiscoveryList(trail.status, Boolean(filters?.createdBy))
  );
}

export async function getTrailById(id: string): Promise<Trail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trails")
    .select("*")
    .eq(slugOrIdColumn(id), id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const trail = mapTrail(data);
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const favorited = user ? await isFavoriteEntity("trail", trail.id) : false;
  if (!canViewContent(trail.status, trail.created_by, role, user?.id ?? null, favorited)) return null;
  return trail;
}

export async function createTrail(data: CreateTrailInput): Promise<Trail> {
  const user = await getCurrentUser();
  if (!user) throw new Error("יש להתחבר כדי ליצור מסלול");

  const supabase = createClient();
  const row = await insertWithUniqueSlug(data.name, async (slug) => {
    const result = await supabase
      .from("trails")
      .insert({
        name: data.name.trim(),
        slug,
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
        operating_hours: data.operating_hours?.trim() || null,
        start_lat: data.start_lat,
        start_lng: data.start_lng,
        end_lat: data.end_lat,
        end_lng: data.end_lng,
        waypoints: data.waypoints,
        image_url: data.image_url.trim() || DEFAULT_TRAIL_IMAGE,
        created_by: user.id,
        status: "pending",
      })
      .select("*")
      .single();
    return { data: result.data, error: result.error };
  });
  return mapTrail(row);
}

/** בעלים רשאי לערוך רק כל עוד המסלול לא אושר. מסלול מאושר — מנהל בלבד. */
export function canEditTrail(trail: Trail, role: UserRole, userId: string | null): boolean {
  if (role === "admin") return true;
  if (!userId || trail.created_by !== userId) return false;
  return trail.status === "pending" || trail.status === "rejected";
}

export async function updateTrail(id: string, data: UpdateTrailInput): Promise<Trail | null> {
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const existing = await getTrailById(id);
  if (!existing) return null;
  if (!canEditTrail(existing, role, user?.id ?? null)) return null;

  const isAdmin = role === "admin";
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("trails")
    .update({
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
      operating_hours: data.operating_hours?.trim() || null,
      start_lat: data.start_lat,
      start_lng: data.start_lng,
      end_lat: data.end_lat,
      end_lng: data.end_lng,
      waypoints: data.waypoints,
      image_url: data.image_url.trim() || DEFAULT_TRAIL_IMAGE,
      // עריכה של בעלים מחזירה את המסלול לתור האישור; מנהל עורך בלי לשנות סטטוס
      ...(isAdmin ? {} : { status: "pending" as Status, rejection_reason: null }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !row) throw new Error(error?.message ?? "עדכון המסלול נכשל");
  if (!isAdmin) {
    void notifyFavoriteEntityUpdated({ entityType: "trail", entityId: id });
  }
  return mapTrail(row);
}

export async function deleteTrail(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const existing = await getTrailById(id);
  if (!existing) return false;
  if (!canHardDeleteContent(existing.status, existing.created_by, role, user?.id ?? null)) {
    throw new Error(HARD_DELETE_APPROVED_MESSAGE);
  }

  const supabase = createClient();
  const { error } = await supabase.from("trails").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function updateTrailStatus(
  id: string,
  status: Status,
  rejectionReason?: string | null
): Promise<Trail | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("trails")
    .update({
      status,
      rejection_reason: status === "rejected" ? rejectionReason?.trim() || null : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapTrail(data);
}

export async function removeTrailFromSite(id: string, reason?: string | null): Promise<Trail | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("trails")
    .update({
      status: "removed",
      removal_reason: reason?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapTrail(data);
}

export async function resubmitTrailForApproval(id: string): Promise<Trail | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const existing = await getTrailById(id);
  if (!existing || existing.created_by !== user.id || existing.status !== "removed") return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("trails")
    .update({
      status: "pending",
      removal_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapTrail(data);
}

export async function restoreTrail(id: string): Promise<Trail | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("trails")
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
  return mapTrail(data);
}

export async function getAllTrailsAdmin(): Promise<Trail[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("trails").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTrail);
}

export async function getTrailsCatalog(): Promise<Trail[]> {
  return getTrails();
}
