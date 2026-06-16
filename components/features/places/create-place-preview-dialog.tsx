"use client";

import { X } from "lucide-react";
import type { Place } from "@/types";
import { PlaceDetailHero } from "@/components/features/places/detail/place-detail-hero";
import { PlaceDetailHighlights } from "@/components/features/places/detail/place-detail-highlights";
import { PlaceDetailGallery } from "@/components/features/places/detail/place-detail-gallery";
import { PlaceDetailSidebar } from "@/components/features/places/detail/place-detail-sidebar";
import { PlaceDetailMapSection } from "@/components/features/places/detail/place-detail-map-section";
import { TripDetailDescription } from "@/components/features/trips/detail/trip-detail-description";
import { TripDetailRating } from "@/components/features/trips/detail/trip-detail-rating";
import { getPlaceGalleryImages } from "@/lib/utils/place-detail-content";

interface CreatePlacePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  place: Place;
  onSave: () => void;
  saving?: boolean;
}

export function CreatePlacePreviewDialog({
  open,
  onClose,
  place,
  onSave,
  saving = false,
}: CreatePlacePreviewDialogProps) {
  if (!open) return null;

  const galleryImages = getPlaceGalleryImages(place);
  const tagsDisplay = place.tags.join(" · ");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-2 sm:p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="תצוגה מקדימה של המקום"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e5e7eb] bg-white px-4 py-3 md:px-6">
          <span className="text-sm font-medium text-[#6b7280]">תצוגה מקדימה — כך ייראה עמוד המקום</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#111827] transition-colors hover:bg-[#f3f4f6]"
            aria-label="סגור תצוגה מקדימה"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <PlaceDetailHero place={place} avgRating={0} reviewsCount={0} previewMode />
          <PlaceDetailHighlights place={place} avgRating={0} />

          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 md:px-6">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="space-y-12 lg:col-span-2">
                <TripDetailDescription
                  description={place.full_description}
                  title="על המקום"
                  variant="compact"
                  truncateAt={300}
                />
                {tagsDisplay && (
                  <p className="text-sm text-[#6b7280]">
                    תגיות: <span className="text-[#111827]">{tagsDisplay}</span>
                  </p>
                )}
                <PlaceDetailMapSection place={place} />
                <PlaceDetailGallery images={galleryImages} />
              </div>
              <PlaceDetailSidebar place={place} />
            </div>
          </div>

          <TripDetailRating avgRating={0} userRating={0} onRate={() => {}} canRate={false} title="דרג את המקום" />
          <div className="h-4" />
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-[#e5e7eb] bg-white px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#d1d5db] py-3 text-sm font-medium text-[#111827] hover:bg-[#f9fafb]"
          >
            חזרה לעריכה
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="flex-1 rounded-lg bg-[#111827] py-3 text-sm font-bold text-white hover:bg-[#1f2937] disabled:opacity-50"
          >
            {saving ? "שומר..." : "שמור ושלח לאישור"}
          </button>
        </div>
      </div>
    </div>
  );
}
