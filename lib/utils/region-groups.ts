import type { Region } from "@/types";

const REGION_GROUP_MAP: Record<string, Region[]> = {
  דרום: ["נגב", "אילת", "ים המלח"],
  מרכז: ["מרכז", "חוף"],
  צפון: ["צפון", "גליל", "כרמל"],
  "ירושלים והסביבה": ["ירושלים", "יהודה ושומרון"],
};

export function getRegionsInGroup(groupLabel: string): Region[] {
  return REGION_GROUP_MAP[groupLabel] ?? [];
}
