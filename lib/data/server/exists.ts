import "server-only";

import { createClient } from "@/lib/supabase/server";
import { slugOrIdColumn } from "@/lib/utils/slug";

/**
 * Whether the current visitor can see this trip/place/trail (row-level security decides: approved
 * content for everyone, plus the owner's own and everything for admins). Detail pages call this
 * on the server so an unknown address answers with a real HTTP 404 instead of a 200 "not found" view.
 * If the database can't be reached we assume the content exists and let the page handle it.
 */
export async function contentExistsServer(
  table: "trips" | "places" | "trails",
  idOrSlug: string
): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq(slugOrIdColumn(idOrSlug), idOrSlug)
    .maybeSingle();
  if (error) return true;
  return Boolean(data);
}
