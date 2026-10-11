"use client";

import { useState } from "react";
import { AdminModerationListPage } from "@/components/features/admin/admin-moderation-list-page";
import { useAuthStore } from "@/hooks/use-stores";
import { deleteModerationItem, markModerationSeen } from "@/lib/data/moderation";
import { toast } from "@/components/ui/use-toast";

export default function AdminModerationPage() {
  const { role } = useAuthStore();
  const [version, setVersion] = useState(0);
  const load = async () => setVersion((current) => current + 1);

  if (role !== "admin") return null;

  return (
    <AdminModerationListPage
      version={version}
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
