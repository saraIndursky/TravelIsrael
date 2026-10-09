import type { ModerationQueueItem } from "@/types";
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
