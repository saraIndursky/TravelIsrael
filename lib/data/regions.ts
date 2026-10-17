import type { Region } from "@/types";
import type { RegionRecord, RegionStatus, RegionTreeNode } from "@/types/region";
import { createClient } from "@/lib/supabase/client";
import { expandRegionFilter } from "@/lib/utils/region-options";
import { getCurrentRole, getCurrentUser } from "./auth";

type RegionRow = {
  id: string;
  name: string;
  code: string | null;
  parent_id: string | null;
  sort_order: number;
  is_selectable: boolean;
  status: RegionStatus;
  created_by: string | null;
  created_at: string;
};

export interface CreateRegionInput {
  name: string;
  parent_id: string | null;
  code?: Region | null;
  is_selectable: boolean;
  sort_order?: number;
}

export interface UpdateRegionInput {
  name?: string;
  parent_id?: string | null;
  code?: Region | null;
  is_selectable?: boolean;
  sort_order?: number;
  status?: RegionStatus;
}

function mapRegion(row: RegionRow): RegionRecord {
  return {
    id: row.id,
    name: row.name,
    code: row.code as Region | null,
    parent_id: row.parent_id,
    sort_order: row.sort_order,
    is_selectable: row.is_selectable,
    status: row.status ?? "approved",
    created_by: row.created_by ?? null,
    created_at: row.created_at,
  };
}

async function assertAdmin(): Promise<void> {
  const role = await getCurrentRole();
  if (role !== "admin") {
    throw new Error("אין הרשאה לניהול אזורים");
  }
}

function collectDescendantIds(regions: RegionRecord[], rootId: string): Set<string> {
  const descendants = new Set<string>();
  const queue = [rootId];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current) continue;
    for (const region of regions) {
      if (region.parent_id === current && !descendants.has(region.id)) {
        descendants.add(region.id);
        queue.push(region.id);
      }
    }
  }

  return descendants;
}

export function buildRegionTree(regions: RegionRecord[]): RegionTreeNode[] {
  const byParent = new Map<string | null, RegionRecord[]>();

  for (const region of regions) {
    const key = region.parent_id;
    const siblings = byParent.get(key);
    if (siblings) {
      siblings.push(region);
    } else {
      byParent.set(key, [region]);
    }
  }

  function build(parentId: string | null): RegionTreeNode[] {
    return (byParent.get(parentId) ?? [])
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "he"))
      .map((region) => ({
        id: region.id,
        name: region.name,
        code: region.code,
        is_selectable: region.is_selectable,
        children: build(region.id),
      }));
  }

  return build(null);
}

export function flattenRegionTree(
  nodes: RegionTreeNode[],
  depth = 0
): Array<RegionTreeNode & { depth: number }> {
  return nodes.flatMap((node) => [
    { ...node, depth },
    ...flattenRegionTree(node.children ?? [], depth + 1),
  ]);
}

export async function getRegions(): Promise<RegionRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("regions")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRegion);
}

const REGION_CACHE_MS = 60_000;
let regionCache: { at: number; promise: Promise<RegionRecord[]> } | null = null;

/** Regions for filter lookups. A short cache avoids one extra query per search. */
function getRegionsCached(): Promise<RegionRecord[]> {
  const now = Date.now();
  if (!regionCache || now - regionCache.at > REGION_CACHE_MS) {
    const promise = getRegions();
    promise.catch(() => {
      if (regionCache?.promise === promise) regionCache = null;
    });
    regionCache = { at: now, promise };
  }
  return regionCache.promise;
}

/**
 * The region codes a region filter stands for: the chosen region and everything inside it.
 * Falls back to the value itself if the regions can't be loaded, so the filter still works.
 */
export async function resolveRegionCodes(value: string): Promise<string[]> {
  try {
    return expandRegionFilter(await getRegionsCached(), value);
  } catch {
    return [value];
  }
}

export async function getRegionTree(): Promise<RegionTreeNode[]> {
  return buildRegionTree(await getRegions());
}

export async function getSelectableRegions(): Promise<RegionRecord[]> {
  const regions = await getRegions();
  return regions.filter((region) => region.is_selectable);
}

export async function getRegionByCode(code: Region): Promise<RegionRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("regions")
    .select("*")
    .eq("code", code)
    .eq("is_selectable", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRegion(data) : null;
}

export async function getRegionById(id: string): Promise<RegionRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("regions").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRegion(data) : null;
}

export async function createRegion(input: CreateRegionInput): Promise<RegionRecord> {
  await assertAdmin();

  const name = input.name.trim();
  if (!name) throw new Error("יש להזין שם אזור");

  if (input.is_selectable && !input.code) {
    throw new Error("אזור לבחירה חייב לכלול קוד");
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("regions")
    .insert({
      name,
      parent_id: input.parent_id,
      code: input.is_selectable ? input.code ?? null : null,
      is_selectable: input.is_selectable,
      sort_order: input.sort_order ?? 0,
    })
    .select("*")
    .single();

  if (error?.code === "23505") throw new Error("כבר קיים אזור עם אותו שם או קוד");
  if (error || !data) throw new Error(error?.message ?? "יצירת האזור נכשלה");
  return mapRegion(data);
}

export async function updateRegion(id: string, input: UpdateRegionInput): Promise<RegionRecord | null> {
  await assertAdmin();

  const regions = await getRegions();
  const existing = regions.find((region) => region.id === id);
  if (!existing) return null;

  if (input.parent_id === id) {
    throw new Error("אזור לא יכול להיות הורה של עצמו");
  }

  if (input.parent_id) {
    const descendants = collectDescendantIds(regions, id);
    if (descendants.has(input.parent_id)) {
      throw new Error("לא ניתן להגדיר ילד כהורה");
    }
  }

  const nextSelectable = input.is_selectable ?? existing.is_selectable;
  const nextCode = input.code !== undefined ? input.code : existing.code;

  if (nextSelectable && !nextCode) {
    throw new Error("אזור לבחירה חייב לכלול קוד");
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("regions")
    .update({
      name: input.name?.trim() ?? existing.name,
      parent_id: input.parent_id !== undefined ? input.parent_id : existing.parent_id,
      code: nextSelectable ? nextCode : null,
      is_selectable: nextSelectable,
      sort_order: input.sort_order ?? existing.sort_order,
      status: input.status ?? existing.status,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error?.code === "23505") throw new Error("כבר קיים אזור עם אותו שם או קוד");
  if (error || !data) throw new Error(error?.message ?? "עדכון האזור נכשל");
  return mapRegion(data);
}

export async function deleteRegion(id: string): Promise<boolean> {
  await assertAdmin();

  const regions = await getRegions();
  const hasChildren = regions.some((region) => region.parent_id === id);
  if (hasChildren) {
    throw new Error("לא ניתן למחוק אזור שיש לו תתי-אזורים");
  }

  const supabase = createClient();
  const { count: placeCount } = await supabase
    .from("places")
    .select("id", { count: "exact", head: true })
    .eq("region_id", id);
  const { count: trailCount } = await supabase
    .from("trails")
    .select("id", { count: "exact", head: true })
    .eq("region_id", id);
  const { count: tripCount } = await supabase
    .from("trips")
    .select("id", { count: "exact", head: true })
    .eq("region_id", id);

  if ((placeCount ?? 0) + (trailCount ?? 0) + (tripCount ?? 0) > 0) {
    throw new Error("לא ניתן למחוק אזור שמשויך לתוכן");
  }

  const { error } = await supabase.from("regions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

/**
 * Returns the code of the region to store on content. An existing region is reused; otherwise a
 * new one is proposed under `parentId`. It stays pending until an admin approves it (or the
 * content that uses it), and admins create approved regions directly.
 */
export async function ensureRegion(name: string, parentId: string): Promise<string> {
  const code = name.replace(/\s+/g, " ").trim();
  if (!code) throw new Error("יש להזין אזור");

  const regions = await getRegions();
  const existing = regions.find(
    (region) => region.is_selectable && region.code?.toLowerCase() === code.toLowerCase()
  );
  if (existing?.code) return existing.code;

  if (!parentId) throw new Error("יש לבחור את האזור שמכיל את האזור החדש");

  const user = await getCurrentUser();
  if (!user) throw new Error("יש להתחבר כדי להוסיף אזור");
  const role = await getCurrentRole();

  const supabase = createClient();
  const { error } = await supabase.from("regions").insert({
    name: code,
    code,
    parent_id: parentId,
    is_selectable: true,
    sort_order: 100,
    status: role === "admin" ? "approved" : "pending",
    created_by: user.id,
  });

  if (error) {
    if (error.code === "23505") throw new Error("אזור בשם הזה כבר קיים או ממתין לאישור");
    throw new Error(error.message);
  }
  return code;
}
