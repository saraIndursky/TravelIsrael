import { Eye, Heart, MessageSquare, Star } from "lucide-react";
import type { Trip } from "@/types";
import { RatingStars } from "@/components/ui/custom/rating-stars";

interface TripDetailStatsProps {
  trip: Trip;
  reviewsCount: number;
  ratingsCount: number;
}

export function TripDetailStats({
  trip,
  reviewsCount,
  ratingsCount,
}: TripDetailStatsProps) {
  const items = [
    { icon: Eye, label: "צפיות", value: trip.views_count.toLocaleString("he-IL") },
    { icon: Heart, label: "שמירות", value: trip.favorites_count.toLocaleString("he-IL") },
    { icon: Star, label: "דירוג ממוצע", value: trip.avg_rating > 0 ? "stars" : "חדש" },
    { icon: MessageSquare, label: "ביקורות", value: String(reviewsCount) },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6">
      <h2 className="mb-4 text-3xl font-light text-[#111827]">סטטיסטיקות</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-[2px] border border-[#e5e7eb] bg-white p-4 text-center"
            >
              <Icon className="mx-auto mb-2 h-5 w-5 text-[#6b7280]" />
              <div className="mb-1 text-xs text-[#6b7280]">{item.label}</div>
              <div className="text-sm font-medium text-[#111827]">
                {item.label === "דירוג ממוצע" && trip.avg_rating > 0 ? (
                  <div className="flex justify-center">
                    <RatingStars rating={trip.avg_rating} />
                  </div>
                ) : (
                  item.value
                )}
              </div>
              {item.label === "דירוג ממוצע" && ratingsCount > 0 && (
                <div className="mt-1 text-xs text-[#6b7280]">{ratingsCount} מדרגים</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
