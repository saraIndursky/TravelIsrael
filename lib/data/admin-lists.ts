/** Server-side pagination for the admin lists (trips, places, trails): one page per request. */

import { createClient } from "@/lib/supabase/client";
import { adminListShowsE2eContent, E2E_CONTENT_PREFIX } from "@/lib/utils/e2e-content";
import type { Status } from "@/types";
import { pageRange, toPage, type Page } from "./paged";

export const ADMIN_PAGE_SIZE = 20;

export type AdminEntityTable = "trips" | "places" | "trails";

export interface AdminListParams {
  status: Status;
  search: string;
  /** Column to filter by (`place_type`, `trail_type`, `difficulty`) and the stored value to match. */
  typeColumn?: string;
  typeValue?: string;
  region?: string;
  page: number;
}

export type AdminStatusCounts = Record<Status | "total", number>;

/** Characters that have a meaning inside a PostgREST `or` filter are removed from user input. */
export function cleanSearchTerm(search: string): string {
  return search
    .replace(/[%,()"'\\*{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getAdminEntityPage<Row, T>(
  table: AdminEntityTable,
  map: (row: Row) => T,
  params: AdminListParams
): Promise<Page<T>> {
  const supabase = createClient();
  const { from, to } = pageRange(params.page, ADMIN_PAGE_SIZE);

  let query = supabase
    .from(table)
    .select("*", { count: "exact" })
    .eq("status", params.status)
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (params.typeColumn && params.typeValue) query = query.eq(params.typeColumn, params.typeValue);
  if (params.region) query = query.eq("region", params.region);
  if (!adminListShowsE2eContent(params.search)) query = query.not("name", "like", `${E2E_CONTENT_PREFIX}%`);

  const term = cleanSearchTerm(params.search);
  if (term) {
    const parts = [`name.ilike.%${term}%`, `region.ilike.%${term}%`];
    const { data: creators } = await supabase.from("profiles").select("id").ilike("name", `%${term}%`).limit(50);
    const ids = (creators ?? []).map((row) => row.id as string);
    if (ids.length > 0) parts.push(`created_by.in.(${ids.join(",")})`);
    query = query.or(parts.join(","));
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return toPage(((data ?? []) as Row[]).map(map), count, params.page, ADMIN_PAGE_SIZE);
}

export async function getAdminEntityCounts(table: AdminEntityTable): Promise<AdminStatusCounts> {
  const supabase = createClient();
  const statuses: Status[] = ["approved", "pending", "rejected", "removed"];

  const results = await Promise.all(
    statuses.map(async (status) => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("status", status);
      if (error) throw new Error(error.message);
      return [status, count ?? 0] as const;
    })
  );

  const counts = Object.fromEntries(results) as Record<Status, number>;
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return { ...counts, total };
}

/** Distinct values of a type column: every type in use, and the ones used by approved items. */
export async function getAdminTypeOptions(
  table: "places" | "trails",
  column: "place_type" | "trail_type"
): Promise<{ all: string[]; approved: string[] }> {
  const supabase = createClient();
  const { data, error } = await supabase.from(table).select(`${column}, status`);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as Array<Record<string, string>>;
  const all = Array.from(new Set(rows.map((row) => row[column]).filter(Boolean))).sort();
  const approved = Array.from(new Set(rows.filter((row) => row.status === "approved").map((row) => row[column])));
  return { all, approved };
}
