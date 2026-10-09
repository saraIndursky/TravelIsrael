"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Replaces a UUID (or stale) URL with the canonical English slug path. */
export function useCanonicalContentPath(param: string, canonicalPath: string | null) {
  const router = useRouter();

  useEffect(() => {
    if (!canonicalPath) return;
    const current = window.location.pathname;
    if (current === canonicalPath) return;
    if (!param || canonicalPath.split("/").includes(param)) return;
    router.replace(canonicalPath);
  }, [param, canonicalPath, router]);
}
