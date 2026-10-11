"use client";

import { useEffect, useState } from "react";
import { REGIONS } from "@/types/enums";
import { getRegions } from "@/lib/data/regions";
import { buildRegionPickerOptions } from "@/lib/utils/region-options";

/**
 * Approved, selectable region names in hierarchy order, for filter dropdowns. Starts with the
 * built-in list so the filter works immediately, then switches to the live list from the
 * database (which includes regions added later by users and approved by an admin).
 */
export function useRegionNames(): string[] {
  const [names, setNames] = useState<string[]>([...REGIONS]);

  useEffect(() => {
    let cancelled = false;
    getRegions()
      .then((regions) => {
        if (cancelled) return;
        const approved = regions.filter((region) => region.status === "approved");
        const live = buildRegionPickerOptions(approved)
          .filter((option) => option.selectable && option.code)
          .map((option) => option.code as string);
        if (live.length > 0) setNames(live);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return names;
}
