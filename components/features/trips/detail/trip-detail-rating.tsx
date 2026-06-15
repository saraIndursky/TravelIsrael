"use client";

import { StarRating } from "@/components/ui/custom/star-rating";
import { RatingStars } from "@/components/ui/custom/rating-stars";

interface TripDetailRatingProps {
  avgRating: number;
  userRating: number;
  onRate: (score: number) => void;
  canRate: boolean;
}

export function TripDetailRating({
  avgRating,
  userRating,
  onRate,
  canRate,
}: TripDetailRatingProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="rounded-[2px] border border-[#e5e7eb] bg-[#f9fafb] p-6">
        <h2 className="mb-4 text-2xl font-light text-[#111827]">דרג את הטיול</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm text-[#6b7280]">דירוג ממוצע</p>
            {avgRating > 0 ? (
              <RatingStars rating={avgRating} size="md" />
            ) : (
              <span className="text-sm text-[#9ca3af]">עדיין אין דירוגים</span>
            )}
          </div>
          {canRate && (
            <div>
              <p className="mb-2 text-sm text-[#6b7280]">הדירוג שלך</p>
              <StarRating value={userRating} onChange={onRate} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
