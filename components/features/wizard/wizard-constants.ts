import {
  Accessibility,
  Check,
  FileText,
  Footprints,
  MapPin,
  Settings,
  Tags,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { Difficulty, Region } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";

export const WIZARD_STEPS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "region", label: "אזור הטיול", icon: MapPin },
  { key: "difficulty", label: "רמת קושי", icon: TrendingUp },
  { key: "accessibility", label: "רמת נגישות", icon: Accessibility },
  { key: "tripType", label: "סוג הטיול", icon: Footprints },
  { key: "tags", label: "בחירת תגיות", icon: Tags },
  { key: "specialPreferences", label: "העדפות מיוחדות", icon: Settings },
  { key: "summary", label: "סיכום", icon: FileText },
];

export interface RegionTreeNode {
  label: string;
  region?: Region;
  children?: RegionTreeNode[];
}

export const REGION_TREE: RegionTreeNode[] = [
  { label: "ישראל" },
  {
    label: "דרום",
    children: [
      { label: "נגב", region: "נגב" },
      { label: "אילת", region: "אילת" },
      { label: "ים המלח", region: "ים המלח" },
    ],
  },
  {
    label: "מרכז",
    children: [
      { label: "מרכז", region: "מרכז" },
      { label: "חוף", region: "חוף" },
    ],
  },
  {
    label: "צפון",
    children: [
      { label: "צפון", region: "צפון" },
      { label: "גליל", region: "גליל" },
      { label: "כרמל", region: "כרמל" },
    ],
  },
  {
    label: "ירושלים והסביבה",
    children: [
      { label: "ירושלים", region: "ירושלים" },
      { label: "יהודה ושומרון", region: "יהודה ושומרון" },
    ],
  },
];

export const DIFFICULTY_OPTIONS: { label: string; value: Difficulty }[] = [
  { label: "קל", value: "easy" },
  { label: "קל-בינוני", value: "easy" },
  { label: "בינוני", value: "medium" },
  { label: "בינוני-קשה", value: "medium" },
  { label: "קשה", value: "hard" },
];

export const ACCESSIBILITY_OPTIONS: { label: string; value: number }[] = [
  { label: "לא נגיש בכלל", value: 1 },
  { label: "נגישות נמוכה", value: 2 },
  { label: "נגישות חלקית", value: 3 },
  { label: "נגיש לכיסאות גלגלים", value: 4 },
  { label: "נגישות מלאה", value: 5 },
];

export const TRIP_TYPE_OPTIONS = [
  "טיול טבע",
  "טיול תרבות",
  "טיול ים",
  "טיול מדבר",
  "טיול משפחות",
  "טיול ספורט",
] as const;

export const WIZARD_TAG_GROUPS: { label: string; tags: readonly string[] }[] = [
  { label: "טבע ונוף", tags: ["נוף", "טבע", "מים", "קמפינג"] },
  { label: "מתקנים ושירותים", tags: ["מתקנים", "שולחנות אוכל", "מוצל"] },
  { label: "סוג חוויה", tags: ["היסטוריה", "משפחות"] },
];

export const WIZARD_TAG_OPTIONS = WIZARD_TAG_GROUPS.flatMap((group) => [...group.tags]);

export function getDifficultyDisplayLabel(label?: string, difficulty?: Difficulty): string {
  if (label) return label;
  if (difficulty) return DIFFICULTY_LABELS[difficulty];
  return "";
}

export { Check };
