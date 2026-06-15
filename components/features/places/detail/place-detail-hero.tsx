"use client";

import { ArrowRight, Heart, Share2 } from "lucide-react";
import type { Place } from "@/types";
import { RatingStars } from "@/components/ui/custom/rating-stars";
import { useGoBack } from "@/hooks/use-go-back";

interface PlaceDetailHeroProps {
  place: Place;
  avgRating: number;
  reviewsCount: number;
  isSaved?: boolean;
  onToggleSaved?: () => void;
}

const heroBtnClass =
  "flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white text-[#111827]";

export function PlaceDetailHero({
  place,
  avgRating,
  reviewsCount,
  isSaved,
  onToggleSaved,
}: PlaceDetailHeroProps) {
  const goBack = useGoBack();

  return (
    <div className="relative h-[70vh] md:h-[80vh]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${place.image_url}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      <div
        className="absolute inset-x-4 top-6 z-10 flex items-center justify-between md:inset-x-6"
        dir="ltr"
      >
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onToggleSaved}
            className={heroBtnClass}
            aria-label="שמור למועדפים"
          >
            <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </button>
          <button type="button" className={heroBtnClass} aria-label="שתף">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={goBack}
          className={heroBtnClass}
          aria-label="חזור אחורה"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex h-full flex-col justify-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 md:px-6 md:pb-16">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[#111827] backdrop-blur-sm">
              {place.place_type}
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[#111827] backdrop-blur-sm">
              {place.region}
            </span>
          </div>
          <h1 className="text-4xl font-light text-white md:text-6xl">{place.name}</h1>
          <p className="max-w-2xl text-xl text-white/90">{place.short_description}</p>
          <div className="mt-2 flex items-center gap-2">
            {reviewsCount === 0 && avgRating === 0 ? (
              <span className="text-sm text-gray-200">חדש</span>
            ) : (
              <RatingStars rating={avgRating} />
            )}
            <span className="text-sm text-gray-200">({reviewsCount} ביקורות)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
