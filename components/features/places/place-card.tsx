"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Heart, MapPin } from "lucide-react";
import type { Place } from "@/types";
import { formatTripCardDuration } from "@/lib/utils";
import { placePath } from "@/lib/utils/content-path";

interface PlaceCardProps {
  place: Place;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void | Promise<void>;
  favoriteLoading?: boolean;
}

export function PlaceCard({
  place,
  showFavorite = false,
  isFavorite = false,
  onFavoriteToggle,
  favoriteLoading = false,
}: PlaceCardProps) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded border border-[#e5e7eb] bg-white transition-all duration-300 hover:border-[#d1d5db]">
      <div className="relative h-[240px] w-full overflow-hidden bg-[#f3f4f6]">
        <Image
          src={place.image_url}
          alt={place.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <span className="absolute top-3 right-3 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800">
          {place.region}
        </span>
        {showFavorite && (
          <button
            type="button"
            className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-60"
            onClick={() => void onFavoriteToggle?.()}
            disabled={favoriteLoading}
            aria-label={isFavorite ? "הסר מהמועדפים" : "הוסף למועדפים"}
          >
            <Heart className={`h-4 w-4 text-[#111827] ${isFavorite ? "fill-current" : ""}`} />
          </button>
        )}
      </div>

      <div className="flex flex-grow flex-col p-5">
        <h3 className="text-lg font-medium text-[#111827]">{place.name}</h3>
        <p className="mt-1 text-sm text-[#6b7280]">{place.place_type}</p>
        <div className="flex-grow" />
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#6b7280]">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatTripCardDuration(place.avg_duration_minutes)}
          </span>
          {place.estimated_price > 0 && (
            <span>₪{place.estimated_price}</span>
          )}
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-[#6b7280]">{place.short_description}</p>
        <div className="mt-4 border-t border-[#e5e7eb] pt-3">
          <Link
            href={placePath(place)}
            className="block w-full rounded border border-[#e5e7eb] bg-[#f9fafb] py-2.5 text-center text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6]"
          >
            לפרטים
          </Link>
        </div>
      </div>
    </div>
  );
}
