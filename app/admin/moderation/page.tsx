"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminModerationListPage } from "@/components/features/admin/admin-moderation-list-page";
import { useAuthStore } from "@/hooks/use-stores";
import {
  deleteModerationItem,
  getUnseenModerationQueue,
  markModerationSeen,
} from "@/lib/data/moderation";
import type { ModerationQueueItem } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function AdminModerationPage() {
  const { role } = useAuthStore();
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setItems(await getUnseenModerationQueue());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (role === "admin") load();
  }, [role, load]);

  if (role !== "admin") return null;

  return (
    <AdminModerationListPage
      items={items}
      loading={loading}
      onSeen={async (id) => {
        const ok = await markModerationSeen(id);
        if (!ok) {
          toast({ title: "סימון הצפייה נכשל", variant: "destructive" });
          return;
        }
        await load();
        toast({ title: "סומן כנצפה" });
      }}
      onDelete={async (id) => {
        const ok = await deleteModerationItem(id);
        if (!ok) {
          toast({ title: "המחיקה נכשלה", variant: "destructive" });
          return;
        }
        await load();
        toast({ title: "הפריט נמחק" });
      }}
    />
  );
}
