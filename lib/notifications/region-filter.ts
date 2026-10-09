import "server-only";

import type { createClient } from "@/lib/supabase/server";
import type { Region } from "@/types/enums";

type RegionRow = {
  id: string;
  parent_id: string | null;
  code: string | null;
};

type SupabaseServer = ReturnType<typeof createClient>;

export async function resolveEntityRegionId(
  supabase: SupabaseServer,
  region: Region,
  regionId?: string | null
): Promise<string | null> {
  if (regionId) return regionId;

  const { data } = await supabase
    .from("regions")
    .select("id")
    .eq("code", region)
    .maybeSingle();

  return data?.id ?? null;
}

export function entityRegionMatchesFilter(
  entityRegionId: string,
  filterRegionIds: string[] | null | undefined,
  regions: RegionRow[]
): boolean {
  const filters = filterRegionIds ?? [];
  if (filters.length === 0) return false;

  const byId = new Map(regions.map((row) => [row.id, row]));
  let current: string | null = entityRegionId;

  while (current) {
    if (filters.includes(current)) return true;
    current = byId.get(current)?.parent_id ?? null;
  }

  return false;
}
