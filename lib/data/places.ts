import type { Accessibility, Place, Region, Status, UserRole } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { mapPlace } from "@/lib/supabase/mappers";
import { notifyFavoriteEntityUpdated } from "@/lib/notifications/client";
import { canHardDeleteContent, HARD_DELETE_APPROVED_MESSAGE } from "./content-delete";
import { insertWithUniqueSlug } from "./slugs";
import { slugOrIdColumn } from "@/lib/utils/slug";
import { canViewContent, isVisibleInDiscoveryList } from "./content-access";
import { getCurrentRole, getCurrentUser } from "./auth";
import { isFavoriteEntity } from "./favorites";
import { toStoredImageUrl } from "@/lib/utils/image-url";
import { buildSearchFilter, pageRange, toPage, type Page } from "./paged";
import { resolveRegionCodes } from "./regions";

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

export type UpdatePlaceInput = CreatePlaceInput;

/** Types used by approved places; together with the base list they make up the type picker. */
export async function getApprovedPlaceTypes(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("places").select("place_type").eq("status", "approved");
  if (error) throw new Error(error.message);
  return Array.from(new Set((data ?? []).map((row) => row.place_type as string)));
}

const DEFAULT_PLACE_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg/1280px-ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg";

function applyPlaceFilters(
  places: Place[],
  filters?: PlaceFilters,
  regionCodes?: readonly string[]
): Place[] {
  let result = places;
  if (filters?.createdBy) result = result.filter((p) => p.created_by === filters.createdBy);
  if (filters?.status) result = result.filter((p) => p.status === filters.status);
  if (regionCodes?.length) result = result.filter((p) => regionCodes.includes(p.region));
  if (filters?.place_type) result = result.filter((p) => p.place_type === filters.place_type);
  if (filters?.accessibility) {
    result = result.filter((p) => p.accessibility >= filters.accessibility!);
  }
  if (filters?.tags?.length) {
    result = result.filter((p) => filters.tags!.some((t) => p.tags.includes(t)));
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }
  return result;
}

export async function getPlaces(filters?: PlaceFilters): Promise<Place[]> {
  const supabase = createClient();
  let query = supabase.from("places").select("*");
  const regionCodes = filters?.region ? await resolveRegionCodes(filters.region) : undefined;

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.createdBy) query = query.eq("created_by", filters.createdBy);
  if (regionCodes?.length) query = query.in("region", regionCodes);
  if (filters?.place_type) query = query.eq("place_type", filters.place_type);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return applyPlaceFilters((data ?? []).map(mapPlace), filters, regionCodes).filter((place) =>
    isVisibleInDiscoveryList(place.status, Boolean(filters?.createdBy))
  );
}

/** One page of the public (approved) places list, filtered and paged in the database. */
export async function getPlacesPage(
  filters: PlaceFilters,
  page: number,
  pageSize: number
): Promise<Page<Place>> {
  const supabase = createClient();
  const { from, to } = pageRange(page, pageSize);
  let query = supabase.from("places").select("*", { count: "exact" }).eq("status", "approved");
  const regionCodes = filters.region ? await resolveRegionCodes(filters.region) : [];

  if (regionCodes.length) query = query.in("region", regionCodes);
  if (filters.place_type) query = query.eq("place_type", filters.place_type);
  if (filters.accessibility) query = query.gte("accessibility", filters.accessibility);
  if (filters.tags?.length) query = query.overlaps("tags", filters.tags);
  const search = buildSearchFilter(filters.search);
  if (search) query = query.or(search);

  const { data, count, error } = await query
    .order("name", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);
  if (error) throw new Error(error.message);

  return toPage((data ?? []).map(mapPlace), count, page, pageSize);
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq(slugOrIdColumn(id), id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const place = mapPlace(data);
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const favorited = user ? await isFavoriteEntity("place", place.id) : false;
  if (!canViewContent(place.status, place.created_by, role, user?.id ?? null, favorited)) return null;
  return place;
}

export async function createPlace(data: CreatePlaceInput): Promise<Place> {
  const user = await getCurrentUser();
  if (!user) throw new Error("יש להתחבר כדי ליצור מקום");

  const supabase = createClient();
  const row = await insertWithUniqueSlug(data.name, async (slug) => {
    const result = await supabase
      .from("places")
      .insert({
        name: data.name.trim(),
        slug,
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
        opening_time: data.opening_time?.trim() || null,
        closing_time: data.closing_time?.trim() || null,
        phone: data.phone?.trim() || null,
        website: data.website?.trim() || null,
        image_url: toStoredImageUrl(data.image_url.trim()) || DEFAULT_PLACE_IMAGE,
        created_by: user.id,
        status: "pending",
      })
      .select("*")
      .single();
    return { data: result.data, error: result.error };
  });
  return mapPlace(row);
}

/** בעלים רשאי לערוך רק כל עוד המקום לא אושר. מקום מאושר — מנהל בלבד. */
export function canEditPlace(place: Place, role: UserRole, userId: string | null): boolean {
  if (role === "admin") return true;
  if (!userId || place.created_by !== userId) return false;
  return place.status === "pending" || place.status === "rejected";
}

export async function updatePlace(id: string, data: UpdatePlaceInput): Promise<Place | null> {
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const existing = await getPlaceById(id);
  if (!existing) return null;
  if (!canEditPlace(existing, role, user?.id ?? null)) return null;

  const isAdmin = role === "admin";
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("places")
    .update({
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
      opening_time: data.opening_time?.trim() || null,
      closing_time: data.closing_time?.trim() || null,
      phone: data.phone?.trim() || null,
      website: data.website?.trim() || null,
      image_url: toStoredImageUrl(data.image_url.trim()) || DEFAULT_PLACE_IMAGE,
      // עריכה של בעלים מחזירה את המקום לתור האישור; מנהל עורך בלי לשנות סטטוס
      ...(isAdmin ? {} : { status: "pending" as Status, rejection_reason: null }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !row) throw new Error(error?.message ?? "עדכון המקום נכשל");
  if (!isAdmin) {
    void notifyFavoriteEntityUpdated({ entityType: "place", entityId: id });
  }
  return mapPlace(row);
}

export async function deletePlace(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  const existing = await getPlaceById(id);
  if (!existing) return false;
  if (!canHardDeleteContent(existing.status, existing.created_by, role, user?.id ?? null)) {
    throw new Error(HARD_DELETE_APPROVED_MESSAGE);
  }

  const supabase = createClient();
  const { error } = await supabase.from("places").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function updatePlaceStatus(
  id: string,
  status: Status,
  rejectionReason?: string | null
): Promise<Place | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("places")
    .update({
      status,
      rejection_reason: status === "rejected" ? rejectionReason?.trim() || null : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapPlace(data);
}

export async function removePlaceFromSite(id: string, reason?: string | null): Promise<Place | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("places")
    .update({
      status: "removed",
      removal_reason: reason?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapPlace(data);
}

export async function resubmitPlaceForApproval(id: string): Promise<Place | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const existing = await getPlaceById(id);
  if (!existing || existing.created_by !== user.id || existing.status !== "removed") return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("places")
    .update({
      status: "pending",
      removal_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapPlace(data);
}

export async function restorePlace(id: string): Promise<Place | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("places")
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
  return mapPlace(data);
}

export async function getAllPlacesAdmin(): Promise<Place[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("places").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapPlace);
}

export async function getPlacesCatalog(): Promise<Place[]> {
  return getPlaces();
}
