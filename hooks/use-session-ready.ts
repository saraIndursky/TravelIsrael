"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** True after the browser Supabase client has read the current auth session. */
export function useSessionReady(): { ready: boolean; hasSession: boolean } {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setReady(true);
    });
  }, []);

  return { ready, hasSession };
}
