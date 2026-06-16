"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Heart, MapPin } from "lucide-react";
import type { Trail } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";
import { formatTripCardDuration } from "@/lib/utils";
import { getDifficultyColor } from "@/lib/utils/trip-display";

interface TrailCardProps {
  trail: Trail;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void | Promise<void>;
  favoriteLoading?: boolean;
}

export function TrailCard({
  trail,
  showFavorite = false,
  isFavorite = false,
  onFavoriteToggle,
  favoriteLoading = false,
}: TrailCardProps) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded border border-[#e5e7eb] bg-white transition-all duration-300 hover:border-[#d1d5db]">
      <div className="relative h-[240px] w-full overflow-hidden bg-[#f3f4f6]">
        <Image
          src={trail.image_url}
          alt={trail.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <span className="absolute top-3 right-3 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800">
          {trail.region}
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
        <h3 className="text-lg font-medium text-[#111827]">{trail.name}</h3>
        <p className="mt-1 text-sm text-[#6b7280]">{trail.trail_type}</p>
        <div className="flex-grow" />
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          <span
            className={`rounded px-2 py-1 font-medium ${getDifficultyColor(DIFFICULTY_LABELS[trail.difficulty])}`}
          >
            {DIFFICULTY_LABELS[trail.difficulty]}
          </span>
          <span className="flex items-center gap-1 text-[#6b7280]">
            <MapPin className="h-3.5 w-3.5" />
            {trail.length_km} ק״מ
          </span>
          <span className="flex items-center gap-1 text-[#6b7280]">
            <Clock className="h-3.5 w-3.5" />
            {formatTripCardDuration(trail.duration_minutes)}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-[#6b7280]">{trail.short_description}</p>
        <div className="mt-4 border-t border-[#e5e7eb] pt-3">
          <Link
            href={`/trails/${trail.id}`}
            className="block w-full rounded border border-[#e5e7eb] bg-[#f9fafb] py-2.5 text-center text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6]"
          >
            לפרטים
          </Link>
        </div>
      </div>
    </div>
  );
}
