import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface HomeStats {
  placesCount: number;
  tripsCount: number;
  usersCount: number;
}

async function countRows(
  table: "places" | "trips" | "profiles",
  filter?: { column: string; value: string }
): Promise<number> {
  const supabase = createClient();
  let query = supabase.from(table).select("*", { count: "exact", head: true });

  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getHomeStatsServer(): Promise<HomeStats> {
  const [placesCount, tripsCount, usersCount] = await Promise.all([
    countRows("places", { column: "status", value: "approved" }),
    countRows("trips", { column: "status", value: "approved" }),
    countRows("profiles"),
  ]);

  return { placesCount, tripsCount, usersCount };
}
