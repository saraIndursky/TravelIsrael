import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mapTrail } from "@/lib/supabase/mappers";
import { slugOrIdColumn } from "@/lib/utils/slug";
import type { Trail } from "@/types";

export async function getPublicTrailByIdServer(id: string): Promise<Trail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trails")
    .select("*")
    .eq(slugOrIdColumn(id), id)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) return null;
  return mapTrail(data);
}
