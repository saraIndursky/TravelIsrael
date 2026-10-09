import "server-only";

import { getEntityDetailPath, type ContentEntityType } from "@/lib/email/templates";
import { createClient } from "@/lib/supabase/server";
import type { EntityType } from "@/types/enums";

export interface EntityOwnerInfo {
  ownerId: string;
  entityName: string;
  entityPath: string;
}

export async function getEntityOwnerInfo(
  entityType: EntityType,
  entityId: string
): Promise<EntityOwnerInfo | null> {
  const supabase = createClient();
  const table =
    entityType === "place" ? "places" : entityType === "trail" ? "trails" : "trips";

  const { data, error } = await supabase
    .from(table)
    .select("name, created_by")
    .eq("id", entityId)
    .maybeSingle();

  if (error || !data?.created_by) return null;

  return {
    ownerId: data.created_by,
    entityName: data.name,
    entityPath: getEntityDetailPath(entityType as ContentEntityType, entityId),
  };
}
