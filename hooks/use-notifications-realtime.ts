"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseSchema } from "@/lib/supabase/env";

/** Subscribes to notification INSERT/UPDATE for the signed-in user (instant badge). */
export function useNotificationsRealtime(
  userId: string | null | undefined,
  onChange: () => void
): void {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const schema = getSupabaseSchema();
    const channelName = `notifications:${userId}:${crypto.randomUUID()}`;

    const channel = supabase.channel(channelName);

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema,
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        onChangeRef.current();
      }
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);
}
