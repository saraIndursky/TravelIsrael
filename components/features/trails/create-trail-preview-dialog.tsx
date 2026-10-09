"use client";

import { X } from "lucide-react";
import type { Trail } from "@/types";
import { TrailDetailHero } from "@/components/features/trails/detail/trail-detail-hero";
import { TrailDetailHighlights } from "@/components/features/trails/detail/trail-detail-highlights";
import { TrailDetailWaypoints } from "@/components/features/trails/detail/trail-detail-waypoints";
import { TrailDetailMapSection } from "@/components/features/trails/detail/trail-detail-map-section";
import { TrailDetailGallery } from "@/components/features/trails/detail/trail-detail-gallery";
import { getTrailGalleryImages } from "@/lib/utils/trail-detail-content";
import { TrailDetailNature } from "@/components/features/trails/detail/trail-detail-nature";
import { TrailDetailSidebar } from "@/components/features/trails/detail/trail-detail-sidebar";
import { TripDetailDescription } from "@/components/features/trips/detail/trip-detail-description";
import { TripDetailRating } from "@/components/features/trips/detail/trip-detail-rating";

interface CreateTrailPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  trail: Trail;
  onSave: () => void;
  saving?: boolean;
  saveLabel?: string;
}

export function CreateTrailPreviewDialog({
  open,
  onClose,
  trail,
  onSave,
  saving = false,
  saveLabel = "שמור ושלח לאישור",
}: CreateTrailPreviewDialogProps) {
  if (!open) return null;

  const tagsDisplay = trail.tags.join(" · ");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-2 sm:p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="תצוגה מקדימה של המסלול"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e5e7eb] bg-white px-4 py-3 md:px-6">
          <span className="text-sm font-medium text-[#6b7280]">תצוגה מקדימה — כך ייראה עמוד המסלול</span>
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
          <TrailDetailHero trail={trail} avgRating={0} reviewsCount={0} previewMode />
          <TrailDetailHighlights trail={trail} />

          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 md:px-6">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="space-y-12 lg:col-span-2">
                <TripDetailDescription
                  description={trail.full_description}
                  title="על המסלול"
                  variant="compact"
                  truncateAt={200}
                />
                {tagsDisplay && (
                  <p className="text-sm text-[#6b7280]">
                    תגיות: <span className="text-[#111827]">{tagsDisplay}</span>
                  </p>
                )}
                <TrailDetailWaypoints trail={trail} />
                <TrailDetailMapSection trail={trail} />
                <TrailDetailGallery images={getTrailGalleryImages(trail)} />
                <TrailDetailNature trail={trail} />
              </div>
              <TrailDetailSidebar trail={trail} />
            </div>
          </div>

          <TripDetailRating avgRating={0} userRating={0} onRate={() => {}} canRate={false} title="דרג את המסלול" />
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
            {saving ? "שומר..." : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
