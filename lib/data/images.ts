import type { EntityImage, EntityType } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { mapEntityImage } from "@/lib/supabase/mappers";
import { getCurrentRole, getCurrentUser } from "./auth";
import { removeContentImage } from "./content-images";
import { notifyModerationQueueChanged } from "@/lib/moderation-events";

function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export async function getEntityImages(
  entityType: EntityType,
  entityId: string
): Promise<EntityImage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapEntityImage);
}

export async function getEntityImageUrls(
  entityType: EntityType,
  entityId: string
): Promise<string[]> {
  const rows = await getEntityImages(entityType, entityId);
  return rows.map((row) => row.url);
}

export async function addEntityGalleryImage(
  entityType: EntityType,
  entityId: string,
  input: { url: string; storagePath?: string }
): Promise<EntityImage | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const url = input.url.trim();
  if (!isHttpUrl(url)) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("images")
    .insert({
      user_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      url,
      storage_path: input.storagePath?.trim() ?? "",
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return mapEntityImage(data);
}

export async function deleteEntityImage(imageId: string): Promise<boolean> {
  const user = await getCurrentUser();
  const role = await getCurrentRole();
  if (!user) return false;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("images")
    .select("user_id, storage_path")
    .eq("id", imageId)
    .maybeSingle();
  if (error) return false;
  if (!data) return true;
  if (data.user_id !== user.id && role !== "admin") return false;

  const { error: deleteError } = await supabase.from("images").delete().eq("id", imageId);
  if (deleteError) return false;

  if (data.storage_path) {
    await removeContentImage(data.storage_path);
  }
  notifyModerationQueueChanged();
  return true;
}
