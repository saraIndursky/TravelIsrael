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
import type { Difficulty } from "@/types";
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
