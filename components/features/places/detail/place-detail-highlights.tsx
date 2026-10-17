import { Clock, DollarSign, MapPin, Star, Users, Accessibility } from "lucide-react";
import type { Place } from "@/types";
import { formatDuration, formatPrice, getAccessibilityLabel } from "@/lib/utils";
import { getPlaceAudienceLabel } from "@/lib/utils/place-detail-content";
import { LevelInfoButton } from "@/components/features/shared/level-info-button";
import { ACCESSIBILITY_LEVELS } from "@/lib/levels";

interface PlaceDetailHighlightsProps {
  place: Place;
  avgRating: number;
}

export function PlaceDetailHighlights({ place, avgRating }: PlaceDetailHighlightsProps) {
  const accessibilityLevel = ACCESSIBILITY_LEVELS.find((level) => level.level === place.accessibility);

  const highlights: {
    icon: typeof Star;
    label: string;
    value: string;
    info?: { title: string; description: string; note?: string };
  }[] = [
    {
      icon: Star,
      label: "דירוג",
      value: avgRating > 0 ? `${avgRating.toFixed(1)}/5` : "חדש",
    },
    {
      icon: Users,
      label: "קהל",
      value: getPlaceAudienceLabel(place),
    },
    {
      icon: DollarSign,
      label: "מחיר",
      value: place.estimated_price > 0 ? formatPrice(place.estimated_price) : "חינם",
    },
    {
      icon: Clock,
      label: "משך ביקור",
      value: formatDuration(place.avg_duration_minutes),
    },
    {
      icon: MapPin,
      label: "מיקום",
      value: place.region,
    },
    {
      icon: Accessibility,
      label: "נגישות",
      value: getAccessibilityLabel(place.accessibility),
      info: accessibilityLevel && {
        title: accessibilityLevel.name,
        description: accessibilityLevel.description,
      },
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
