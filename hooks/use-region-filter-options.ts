"use client";

import { useEffect, useState } from "react";
import { REGIONS } from "@/types/enums";
import { getRegions } from "@/lib/data/regions";
import {
  buildRegionFilterOptions,
  buildRegionPickerOptions,
  type RegionFilterOption,
} from "@/lib/utils/region-options";

const FALLBACK_OPTIONS: RegionFilterOption[] = REGIONS.map((region) => ({
  value: region,
  label: region,
}));

/**
 * Region filter options in hierarchy order. Starts with the built-in flat list so the filter works
 * immediately, then switches to the live tree from the database (which includes regions added
 * later by users and approved by an admin). Group headings are included because choosing one
 * also matches every region inside it.
 */
export function useRegionFilterOptions(): RegionFilterOption[] {
  const [options, setOptions] = useState<RegionFilterOption[]>(FALLBACK_OPTIONS);

  useEffect(() => {
    let cancelled = false;
    getRegions()
      .then((regions) => {
        if (cancelled) return;
        const approved = regions.filter((region) => region.status === "approved");
        const live = buildRegionFilterOptions(buildRegionPickerOptions(approved));
        if (live.length > 0) setOptions(live);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}
