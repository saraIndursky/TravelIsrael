"use client";

import { useRouter } from "next/navigation";

export function useGoBack(fallback = "/trips") {
  const router = useRouter();

  return () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };
}
