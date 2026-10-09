"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Heart, Share2 } from "lucide-react";
import type { Trip } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";
import { getReviewCount } from "@/lib/utils";
import { getMatchStyle } from "@/lib/utils/match-display";
import { RatingStars } from "@/components/ui/custom/rating-stars";
import { cn } from "@/lib/utils";

interface WizardResultHeroProps {
  trip: Trip;
  matchScore: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
}

const heroBtnClass =
  "flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white";

export function WizardResultHero({
  trip,
  matchScore,
  isFavorite,
  onToggleFavorite,
  onShare,
}: WizardResultHeroProps) {
  const reviewCount = getReviewCount(trip);
  const matchStyle = getMatchStyle(matchScore);

  return (
    <div className="relative h-[60vh] min-h-[420px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${trip.main_image}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      <div className="absolute inset-x-4 top-6 z-10 flex items-center justify-between md:inset-x-6" dir="ltr">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onToggleFavorite}
            className={cn(heroBtnClass, "text-[#111827]")}
            aria-label="שמור למועדפים"
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </button>
          {onShare && (
            <button type="button" onClick={onShare} className={heroBtnClass} aria-label="שתף טיול">
              <Share2 className="h-5 w-5 text-[#111827]" />
            </button>
          )}
        </div>
        <Link href="/wizard" className={heroBtnClass} aria-label="חזרה לוויזארד">
          <ArrowRight className="h-5 w-5 text-[#111827]" />
        </Link>
      </div>

      <div className="relative flex h-full flex-col justify-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 md:px-6">
          <div
            className={cn(
              "mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold backdrop-blur-sm",
              matchStyle.bgLight,
              matchStyle.color
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            {matchStyle.text} — {matchScore}%
          </div>

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

          <h1 className="mb-3 text-4xl font-light text-white md:text-6xl">{trip.name}</h1>
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
