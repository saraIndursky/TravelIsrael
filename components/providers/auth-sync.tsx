"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/hooks/use-stores";
import { updateStore } from "@/lib/data/store";

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { role, userId } = useAuthStore();

  useEffect(() => {
    updateStore((store) => ({
      ...store,
      currentRole: role,
      currentUserId: userId,
    }));
  }, [role, userId]);

  return <>{children}</>;
}
