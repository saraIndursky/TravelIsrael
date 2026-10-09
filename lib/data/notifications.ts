import type { Notification } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { mapNotification } from "@/lib/supabase/mappers";
import { dedupeNotificationsByEntity } from "@/lib/utils/notifications-dedupe";
import { getCurrentUser } from "./auth";

export async function getNotifications(limit = 50): Promise<Notification[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return dedupeNotificationsByEntity((data ?? []).map(mapNotification));
}

export async function getUnreadNotificationCount(): Promise<number> {
  const notifications = await getNotifications(100);
  return notifications.filter((n) => !n.read_at).length;
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = createClient();
  const { data: row, error: fetchError } = await supabase
    .from("notifications")
    .select("entity_type, entity_id, kind, link_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !row) return false;

  const readAt = new Date().toISOString();
  let query = supabase
    .from("notifications")
    .update({ read_at: readAt })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (row.entity_type && row.entity_id) {
    query = query
      .eq("entity_type", row.entity_type)
      .eq("entity_id", row.entity_id)
      .eq("kind", row.kind);
  } else if (row.link_path) {
    query = query.eq("link_path", row.link_path).eq("kind", row.kind);
  } else {
    query = query.eq("id", id);
  }

  const { error } = await query;
  return !error;
}

export async function markAllNotificationsRead(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  return !error;
}
