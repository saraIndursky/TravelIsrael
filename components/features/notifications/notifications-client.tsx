"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Notification } from "@/types";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/data/notifications";
import { notificationGroupKey } from "@/lib/utils/notifications-dedupe";
import { PageLoadingSpinner } from "@/components/layout/page-loading";
import { NotificationListItem } from "@/components/features/notifications/notification-list-item";

function formatNotificationDate(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsClient() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getNotifications(100);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleItemClick(notification: Notification) {
    const groupKey = notificationGroupKey(notification);
    if (!notification.read_at) {
      await markNotificationRead(notification.id);
      const readAt = new Date().toISOString();
      setItems((prev) =>
        prev.map((n) =>
          notificationGroupKey(n) === groupKey ? { ...n, read_at: readAt } : n
        )
      );
    }
    router.push(notification.link_path);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  }

  const unreadCount = items.filter((n) => !n.read_at).length;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-10 md:py-12">
          <div>
            <h1 className="text-3xl font-light text-[#111827] md:text-4xl">התראות</h1>
            <p className="mt-2 text-sm text-[#6b7280]">עדכונים על התוכן שלך</p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              className="shrink-0 text-sm text-gray-600 transition hover:text-gray-900"
            >
              סמן הכל כנקרא
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {loading ? (
          <PageLoadingSpinner size="sm" />
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#6b7280]">אין התראות עדיין</p>
        ) : (
          <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white">
            {items.map((notification) => (
              <li key={notification.id}>
                <NotificationListItem
                  notification={notification}
                  formattedDate={formatNotificationDate(notification.created_at)}
                  onClick={() => void handleItemClick(notification)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
