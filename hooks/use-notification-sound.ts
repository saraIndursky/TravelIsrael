"use client";

import { useEffect, useRef } from "react";
import type { NotificationSoundId } from "@/types/notification-preferences";
import { playNotificationSound } from "@/lib/notifications/sounds";

interface UseNotificationSoundAlertOptions {
  unreadCount: number;
  soundEnabled: boolean;
  soundId: NotificationSoundId;
  role: string;
}

export function useNotificationSoundAlert({
  unreadCount,
  soundEnabled,
  soundId,
  role,
}: UseNotificationSoundAlertOptions): void {
  const prevUnreadRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (role === "guest") {
      prevUnreadRef.current = null;
      initializedRef.current = false;
      return;
    }

    if (!initializedRef.current) {
      prevUnreadRef.current = unreadCount;
      initializedRef.current = true;
      return;
    }

    const previous = prevUnreadRef.current ?? unreadCount;
    if (soundEnabled && unreadCount > previous) {
      void playNotificationSound(soundId);
    }

    prevUnreadRef.current = unreadCount;
  }, [unreadCount, soundEnabled, soundId, role]);
}
