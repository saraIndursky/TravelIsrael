import {
  Accessibility,
  Clock,
  MapPin,
  Navigation,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Trail } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";
import { formatDistance, formatDuration, getAccessibilityLabel } from "@/lib/utils";
import { getTrailAudienceLabel } from "@/lib/utils/trail-detail-content";

interface TrailDetailHighlightsProps {
  trail: Trail;
}

export function TrailDetailHighlights({ trail }: TrailDetailHighlightsProps) {
  const highlights = [
    {
      icon: Clock,
      label: "משך זמן",
      value: formatDuration(trail.duration_minutes),
    },
    {
      icon: MapPin,
      label: "אורך",
      value: formatDistance(trail.length_km),
    },
    {
      icon: Navigation,
      label: "סוג",
      value: trail.trail_type,
    },
    {
      icon: Accessibility,
      label: "נגישות",
      value: getAccessibilityLabel(trail.accessibility),
    },
    {
      icon: Users,
      label: "מתאים ל",
      value: getTrailAudienceLabel(trail),
    },
    {
      icon: TrendingUp,
      label: "קושי",
      value: DIFFICULTY_LABELS[trail.difficulty],
    },
  ];

  return (
    <div className="relative z-10 mx-auto -mb-6 -mt-12 max-w-7xl px-4 md:px-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-[2px] border border-[#e5e7eb] bg-white p-4 text-center"
            >
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
