import type { EntityType, ModerationKind, ModerationQueueItem } from "@/types";
import { ADMIN_PAGE_SIZE, cleanSearchTerm } from "./admin-lists";
import { pageRange, toPage, type Page } from "./paged";
import { createClient } from "@/lib/supabase/client";
import { mapModerationQueueItem } from "@/lib/supabase/mappers";
import { getCurrentRole, getCurrentUser } from "./auth";
import { deleteEntityImage } from "./images";
import { notifyModerationQueueChanged } from "@/lib/moderation-events";

export { MODERATION_QUEUE_CHANGED_EVENT, notifyModerationQueueChanged } from "@/lib/moderation-events";

export async function getUnseenModerationCount(): Promise<number> {
  const role = await getCurrentRole();
  if (role !== "admin") return 0;

  const supabase = createClient();
  const { count, error } = await supabase
    .from("moderation_queue")
    .select("*", { count: "exact", head: true })
    .is("seen_at", null);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getUnseenModerationQueue(): Promise<ModerationQueueItem[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("moderation_queue")
    .select("*")
    .is("seen_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapModerationQueueItem);
}

export interface ModerationPageParams {
  search: string;
  entityType: EntityType | "";
  kind: ModerationKind | "";
  page: number;
}

/** Admin: one page of unseen items (newest first), filtered on the server. */
export async function getUnseenModerationPage(params: ModerationPageParams): Promise<Page<ModerationQueueItem>> {
  const role = await getCurrentRole();
  if (role !== "admin") return { items: [], total: 0, hasMore: false };

  const supabase = createClient();
  const { from, to } = pageRange(params.page, ADMIN_PAGE_SIZE);
  let query = supabase
    .from("moderation_queue")
    .select("*", { count: "exact" })
    .is("seen_at", null)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (params.entityType) query = query.eq("entity_type", params.entityType);
  if (params.kind) query = query.eq("kind", params.kind);
  const term = cleanSearchTerm(params.search);
  if (term) query = query.or(`entity_name.ilike.%${term}%,content.ilike.%${term}%`);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return toPage((data ?? []).map(mapModerationQueueItem), count, params.page, ADMIN_PAGE_SIZE);
}

export async function getUnseenModerationCounts(): Promise<{ total: number; comment: number; gallery_image: number }> {
  const supabase = createClient();
  const count = async (kind?: ModerationKind) => {
    let query = supabase.from("moderation_queue").select("*", { count: "exact", head: true }).is("seen_at", null);
    if (kind) query = query.eq("kind", kind);
    const { count: value, error } = await query;
    if (error) throw new Error(error.message);
    return value ?? 0;
  };
  const [total, comment, gallery_image] = await Promise.all([count(), count("comment"), count("gallery_image")]);
  return { total, comment, gallery_image };
}

export async function markModerationSeen(id: string): Promise<boolean> {
  const role = await getCurrentRole();
  const user = await getCurrentUser();
  if (role !== "admin" || !user) return false;

  const supabase = createClient();
  const { error } = await supabase
    .from("moderation_queue")
    .update({ seen_at: new Date().toISOString(), seen_by: user.id })
    .eq("id", id)
    .is("seen_at", null);
  if (error) return false;
  notifyModerationQueueChanged();
  return true;
}

export async function deleteModerationItem(id: string): Promise<boolean> {
  const role = await getCurrentRole();
  if (role !== "admin") return false;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("moderation_queue")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return false;

  const item = mapModerationQueueItem(data);

  if (item.kind === "comment") {
    const { error: deleteError } = await supabase.from("comments").delete().eq("id", item.source_id);
    if (deleteError) return false;
  } else {
    const removed = await deleteEntityImage(item.source_id);
    if (!removed) return false;
  }

  await supabase.from("moderation_queue").delete().eq("id", id);
  notifyModerationQueueChanged();
  return true;
}
