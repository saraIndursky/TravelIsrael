"use client";

import Link from "next/link";
import { Navigation, Pencil, Phone, Plus } from "lucide-react";
import type { Place } from "@/types";
import { getNavigationUrl } from "@/lib/utils/place-detail-content";
import { canEditPlace } from "@/lib/data/places";
import { placeEditPath } from "@/lib/utils/content-path";
import { useAuthStore } from "@/hooks/use-stores";

interface PlaceDetailActionsProps {
  place: Place;
}

export function PlaceDetailActions({ place }: PlaceDetailActionsProps) {
  const { role, userId } = useAuthStore();
  const navUrl = getNavigationUrl(place);
  const showEdit = canEditPlace(place, role, userId || null);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 md:px-6">
      <div className="rounded-[2px] border border-[#e5e7eb] bg-white p-4">
        <div className="flex flex-col gap-2">
          {place.phone ? (
            <a
              href={`tel:${place.phone}`}
              className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-[#111827] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
            >
              <Phone className="h-4 w-4" />
              התקשר
            </a>
          ) : (
            <a
              href={navUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-[#111827] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
            >
              <Navigation className="h-4 w-4" />
              נווט למקום
            </a>
          )}
          <Link
            href="/trips/create"
            className="flex w-full items-center justify-center gap-2 rounded-[2px] border-2 border-[#111827] bg-white py-3.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
          >
            <Plus className="h-4 w-4" />
            הוספה לטיול
          </Link>
          {showEdit && (
            <Link
              href={placeEditPath(place)}
              className="flex w-full items-center justify-center gap-2 rounded-[2px] border border-[#d1d5db] bg-white py-3.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
            >
              <Pencil className="h-4 w-4" />
              עריכת המקום
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
