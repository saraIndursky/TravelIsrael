import {
  Accessibility,
  CircleDollarSign,
  Clock,
  MapPin,
  Navigation,
  TrendingUp,
} from "lucide-react";
import type { Trip } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";
import { LevelInfoButton } from "@/components/features/shared/level-info-button";
import { ACCESSIBILITY_LEVELS, DIFFICULTY_LEVELS } from "@/lib/levels";
import { formatTripCardDuration, formatPrice, getAccessibilityLabel } from "@/lib/utils";

interface TripDetailHighlightsProps {
  trip: Trip;
  totalTravelKm?: number;
  /** overlap = cards pull up over hero (trip detail); stacked = below nav (wizard results) */
  layout?: "overlap" | "stacked";
}

export function TripDetailHighlights({
  trip,
  totalTravelKm,
  layout = "overlap",
}: TripDetailHighlightsProps) {
  const distance =
    totalTravelKm && totalTravelKm > 0
      ? `${totalTravelKm.toFixed(2)} ק"מ`
      : trip.total_distance_km > 0
        ? `${trip.total_distance_km.toFixed(2)} ק"מ`
        : "—";

  const accessibilityLevel = ACCESSIBILITY_LEVELS.find((level) => level.level === trip.accessibility);
  const difficultyLevel = DIFFICULTY_LEVELS.find((level) => level.code === trip.difficulty);

  const highlights: {
    icon: typeof Clock;
    label: string;
    value: string;
    info?: { title: string; description: string; note?: string };
  }[] = [
    {
      icon: Clock,
      label: "משך זמן",
      value: formatTripCardDuration(trip.total_duration_minutes),
    },
    {
      icon: MapPin,
      label: "תחנות",
      value: `${trip.station_count} תחנות`,
    },
    {
      icon: Navigation,
      label: "מרחק כולל",
      value: distance,
    },
    {
      icon: Accessibility,
      label: "נגישות",
      value: getAccessibilityLabel(trip.accessibility),
      info: accessibilityLevel && {
        title: accessibilityLevel.name,
        description: accessibilityLevel.description,
        note: "נגישות הטיול נקבעת לפי התחנה הפחות נגישה בו.",
      },
    },
    {
      icon: CircleDollarSign,
      label: "מחיר משוער לנפש",
      value: formatPrice(trip.estimated_price),
    },
    {
      icon: TrendingUp,
      label: "קושי",
      value: DIFFICULTY_LABELS[trip.difficulty],
      info: difficultyLevel && {
        title: difficultyLevel.name,
        description: difficultyLevel.description,
        note: "קושי הטיול נקבע לפי המסלול הקשה ביותר בו.",
      },
    },
  ];

  return (
    <div
      className={
        layout === "overlap"
          ? "relative z-10 mx-auto -mb-6 -mt-12 max-w-7xl px-4 md:px-6"
          : "mx-auto max-w-7xl px-4 pb-2 pt-2 md:px-6"
      }
    >
      <div className="print-highlights grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="relative rounded-[2px] border border-[#e5e7eb] bg-white p-4 text-center"
            >
              {item.info && <LevelInfoButton {...item.info} />}
              <Icon className="mx-auto mb-2 h-5 w-5 text-[#6b7280]" />
              <div className="mb-1 text-xs text-[#6b7280]">{item.label}</div>
              <div className="text-sm font-medium text-[#111827]">{item.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
