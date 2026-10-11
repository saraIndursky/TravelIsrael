"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, Heart, Clock, MapPin, Accessibility } from "lucide-react";
import type { Trip } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";
import { formatTripCardDuration, getAccessibilityLabel, getReviewCount } from "@/lib/utils";
import { getDifficultyColor } from "@/lib/utils/trip-display";
import { tripPath } from "@/lib/utils/content-path";
import { RatingStars } from "@/components/ui/custom/rating-stars";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void | Promise<void>;
  favoriteLoading?: boolean;
  /** Two-column layout (image beside the text) for when the card spans a full row. */
  wide?: boolean;
}

export function TripCard({
  trip,
  showFavorite = false,
  isFavorite = false,
  onFavoriteToggle,
  favoriteLoading = false,
  wide = false,
}: TripCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const reviewCount = getReviewCount(trip);

  return (
    <>
      <div
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded border border-[#e5e7eb] bg-white transition-all duration-300 hover:border-[#d1d5db]",
          wide && "sm:flex-row lg:flex-col"
        )}
      >
        <div
          className={cn(
            "relative h-[300px] w-full overflow-hidden bg-[#f3f4f6]",
            wide && "sm:h-auto sm:min-h-[300px] sm:w-1/2 lg:h-[300px] lg:w-full"
          )}
        >
          <div
            role="button"
            tabIndex={0}
            className="relative h-full w-full cursor-pointer overflow-hidden text-right"
            onClick={() => setLightboxOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLightboxOpen(true);
              }
            }}
            aria-label={`הגדל תמונה של ${trip.name}`}
          >
            <Image
              src={trip.main_image}
              alt={trip.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={wide ? "(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" : "(max-width:768px) 100vw, 33vw"}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
              <Camera className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <span className="absolute top-3 right-3 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800">
              {trip.region}
            </span>
          </div>
          {showFavorite && (
            <button
              type="button"
              className="absolute top-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-60"
              onClick={() => void onFavoriteToggle?.()}
              disabled={favoriteLoading}
              aria-label={isFavorite ? "הסר מהמועדפים" : "הוסף למועדפים"}
            >
              <Heart
                className={`h-4 w-4 text-[#111827] ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
          )}
        </div>

        <div className={cn("flex flex-grow flex-col p-5", wide && "sm:w-1/2 lg:w-full")}>
          <h3 className="text-lg font-medium text-[#111827] transition-colors group-hover:text-[#4b5563]">
            {trip.name}
          </h3>

          <div className="flex-grow" />

          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex items-center">
                {reviewCount === 0 ? (
                  <span className="text-sm text-gray-500">חדש</span>
                ) : (
                  <RatingStars rating={trip.avg_rating} />
                )}
              </div>
              <span className="text-sm text-gray-500">({reviewCount} ביקורות)</span>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
              <span className={`rounded px-2 py-1 font-medium ${getDifficultyColor(DIFFICULTY_LABELS[trip.difficulty])}`}>
                {DIFFICULTY_LABELS[trip.difficulty]}
              </span>
              <span className="flex items-center gap-1 text-[#6b7280]">
                <Accessibility className="h-3.5 w-3.5" />
                {getAccessibilityLabel(trip.accessibility)}
              </span>
              <span className="flex items-center gap-1 text-[#6b7280]">
                <Clock className="h-3.5 w-3.5" />
                {formatTripCardDuration(trip.total_duration_minutes)}
              </span>
              <span className="flex items-center gap-1 text-[#6b7280]">
                <MapPin className="h-3.5 w-3.5" />
                {trip.station_count} תחנות
              </span>
            </div>

            <p className="mb-4 line-clamp-2 truncate text-sm text-[#6b7280]">
              {trip.short_description || "אין תיאור זמין"}
            </p>

            <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-3 text-sm text-gray-600">
              <Link
                href={tripPath(trip)}
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] py-2.5 text-center text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6]"
              >
                לפרטים
              </Link>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxOpen(false)}
          role="presentation"
        >
          <div className="relative h-[80vh] w-full max-w-4xl">
            <Image
              src={trip.main_image}
              alt={trip.name}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
