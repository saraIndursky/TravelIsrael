"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/hooks/use-stores";
import { syncUserFromAuth } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/client";

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { setSession, logout } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    async function applySessionUser(authUser: {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
    } | null) {
      if (!authUser) {
        setSession(null);
        return;
      }
      const user = await syncUserFromAuth(authUser);
      setSession(user);
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void applySessionUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        logout();
        return;
      }

      // Avoid Supabase auth deadlock: don't await other auth calls inside this callback.
      const authUser = session?.user ?? null;
      window.setTimeout(() => {
        void applySessionUser(authUser);
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, logout]);

  return <>{children}</>;
}
