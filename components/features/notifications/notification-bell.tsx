"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Settings } from "lucide-react";
import type { Notification } from "@/types";
import type { NotificationSoundId } from "@/types/notification-preferences";
import { DEFAULT_NOTIFICATION_SOUND_ID } from "@/types/notification-preferences";
import { NotificationListItem } from "@/components/features/notifications/notification-list-item";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/data/notifications";
import { getNotificationPreferences } from "@/lib/data/notification-preferences";
import { unlockNotificationAudio } from "@/lib/notifications/sounds";
import { notificationGroupKey } from "@/lib/utils/notifications-dedupe";
import { PageLoadingSpinner } from "@/components/layout/page-loading";
import { useNotificationSoundAlert } from "@/hooks/use-notification-sound";
import { useNotificationsRealtime } from "@/hooks/use-notifications-realtime";
import { useAuthStore } from "@/hooks/use-stores";

const DROPDOWN_LIMIT = 6;
/** Fallback when Realtime is unavailable or tab was idle. */
const POLL_INTERVAL_MS = 60_000;

function formatNotificationDate(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationBell() {
  const router = useRouter();
  const { role, userId } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundId, setSoundId] = useState<NotificationSoundId>(DEFAULT_NOTIFICATION_SOUND_ID);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadSoundPrefs = useCallback(async () => {
    if (role === "guest") return;
    try {
      const prefs = await getNotificationPreferences();
      if (prefs) {
        setSoundEnabled(prefs.sound_enabled);
        setSoundId(prefs.sound_id);
      }
    } catch {
      // Keep defaults
    }
  }, [role]);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (role === "guest") return;
    if (!options?.silent) setLoading(true);
    try {
      const [list, count] = await Promise.all([
        getNotifications(DROPDOWN_LIMIT),
        getUnreadNotificationCount(),
      ]);
      setItems(list);
      setUnreadCount(count);
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (role === "guest") return;
    void (async () => {
      await loadSoundPrefs();
      await refresh({ silent: true });
    })();
  }, [role, loadSoundPrefs, refresh]);

  useEffect(() => {
    if (role === "guest") return;

    const interval = window.setInterval(() => {
      void refresh({ silent: true });
    }, POLL_INTERVAL_MS);

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void refresh({ silent: true });
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [role, refresh]);

  const onRealtimeChange = useCallback(() => {
    void refresh({ silent: true });
  }, [refresh]);

  useNotificationsRealtime(userId || null, onRealtimeChange);

  useNotificationSoundAlert({
    unreadCount,
    soundEnabled,
    soundId,
    role,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleItemClick(notification: Notification) {
    const groupKey = notificationGroupKey(notification);
    if (!notification.read_at) {
      await markNotificationRead(notification.id);
      const readAt = new Date().toISOString();
      setUnreadCount((c) => Math.max(0, c - 1));
      setItems((prev) =>
        prev.map((n) =>
          notificationGroupKey(n) === groupKey ? { ...n, read_at: readAt } : n
        )
      );
    }
    setOpen(false);
    router.push(notification.link_path);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setUnreadCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  }

  if (role === "guest") return null;

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        aria-label={unreadCount > 0 ? `התראות, ${unreadCount > 9 ? "9+" : unreadCount} חדשות` : "התראות"}
        aria-expanded={open}
        onClick={() => {
          void unlockNotificationAudio();
          setOpen((prev) => !prev);
          if (!open) {
            void refresh();
            void loadSoundPrefs();
          }
        }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -left-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">התראות</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="text-xs text-gray-500 transition hover:text-gray-900"
              >
                סמן הכל כנקרא
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <PageLoadingSpinner size="sm" className="py-6" />
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">אין התראות</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {items.map((notification) => (
                  <li key={notification.id}>
                    <NotificationListItem
                      notification={notification}
                      formattedDate={formatNotificationDate(notification.created_at)}
                      onClick={() => void handleItemClick(notification)}
                      compact
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-gray-900 transition hover:text-primary"
            >
              ראה הכל
            </Link>
            <Link
              href="/profile#notifications"
              onClick={() => setOpen(false)}
              aria-label="הגדרות התראות"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <Settings className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
