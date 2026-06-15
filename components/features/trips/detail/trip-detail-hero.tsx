"use client";

import { Heart, Share2, ArrowRight } from "lucide-react";
import type { Trip } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";
import { getReviewCount } from "@/lib/utils";
import { RatingStars } from "@/components/ui/custom/rating-stars";
import { useGoBack } from "@/hooks/use-go-back";

interface TripDetailHeroProps {
  trip: Trip;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  /** מצב תצוגה מקדימה — ללא כפתורי פעולה */
  previewMode?: boolean;
}

const heroBtnClass =
  "flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white";

export function TripDetailHero({ trip, isFavorite, onToggleFavorite, previewMode }: TripDetailHeroProps) {
  const reviewCount = getReviewCount(trip);
  const goBack = useGoBack();

  return (
    <div className={previewMode ? "relative h-[50vh] min-h-[280px]" : "relative h-[70vh] md:h-[80vh]"}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${trip.main_image}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {!previewMode && (
        <div
          className="absolute inset-x-4 top-6 z-10 flex items-center justify-between md:inset-x-6"
          dir="ltr"
        >
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`${heroBtnClass} text-[#111827]`}
              aria-label="שמור למועדפים"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            <button type="button" className={heroBtnClass} aria-label="שתף">
              <Share2 className="h-5 w-5 text-[#111827]" />
            </button>
          </div>
          <button
            type="button"
            onClick={goBack}
            className={heroBtnClass}
            aria-label="חזור אחורה"
          >
            <ArrowRight className="h-5 w-5 text-[#111827]" />
          </button>
        </div>
      )}

      <div className="relative flex h-full flex-col justify-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 md:px-6 md:pb-16">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[#111827] backdrop-blur-sm">
              {trip.region}
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[#111827] backdrop-blur-sm">
              {DIFFICULTY_LABELS[trip.difficulty]}
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[#111827] backdrop-blur-sm">
              {trip.station_count} תחנות
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-light text-white md:text-6xl">{trip.name}</h1>
          <p className="mb-4 max-w-2xl text-xl text-white/90">{trip.short_description}</p>
          <div className="flex items-center gap-2">
            {reviewCount === 0 ? (
              <span className="text-sm text-gray-200">חדש</span>
            ) : (
              <RatingStars rating={trip.avg_rating} />
            )}
            <span className="text-sm text-gray-200">({reviewCount} ביקורות)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
