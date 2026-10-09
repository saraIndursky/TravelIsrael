import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mapPlace } from "@/lib/supabase/mappers";
import { slugOrIdColumn } from "@/lib/utils/slug";
import type { Place } from "@/types";

export async function getPublicPlaceByIdServer(id: string): Promise<Place | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq(slugOrIdColumn(id), id)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) return null;
  return mapPlace(data);
}
