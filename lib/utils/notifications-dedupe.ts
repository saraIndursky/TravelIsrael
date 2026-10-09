import type { Notification } from "@/types";

export function notificationGroupKey(item: Notification): string {
  if (item.entity_type && item.entity_id) {
    return `${item.kind}:${item.entity_type}:${item.entity_id}`;
  }
  return `${item.kind}:${item.link_path}`;
}

export function dedupeNotificationsByEntity(list: Notification[]): Notification[] {
  const byKey = new Map<string, Notification>();

  for (const item of list) {
    const key = notificationGroupKey(item);
    const existing = byKey.get(key);
    if (!existing || new Date(item.created_at) > new Date(existing.created_at)) {
      byKey.set(key, item);
    }
  }

  return [...byKey.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
