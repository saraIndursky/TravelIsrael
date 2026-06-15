"use client";

import { X } from "lucide-react";
import type { Place, Trail, TripStation, TripWithStations, User } from "@/types";
import { TripDetailHero } from "@/components/features/trips/detail/trip-detail-hero";
import { TripDetailHighlights } from "@/components/features/trips/detail/trip-detail-highlights";
import { TripDetailDescription } from "@/components/features/trips/detail/trip-detail-description";
import { TripDetailItinerary } from "@/components/features/trips/detail/trip-detail-itinerary";
import { TripDetailGallery } from "@/components/features/trips/detail/trip-detail-gallery";
import { TripDetailStats } from "@/components/features/trips/detail/trip-detail-stats";
import { TripDetailRating } from "@/components/features/trips/detail/trip-detail-rating";
import { TripDetailReviews } from "@/components/features/trips/detail/trip-detail-reviews";
import { computeTripSchedule } from "@/lib/utils/trip-schedule";
import { buildTripMapMarkers } from "@/lib/utils/trip-map";
import type { TripStats } from "@/lib/utils/trip-calculations";

interface BuildTripPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  name: string;
  shortDescription: string;
  fullDescription: string;
  tags: string[];
  imageUrl: string;
  stations: TripStation[];
  places: Place[];
  trails: Trail[];
  users: User[];
  stats: TripStats;
  startTime: string;
}

function buildPreviewTrip(
  props: Pick<
    BuildTripPreviewDialogProps,
    | "name"
    | "shortDescription"
    | "fullDescription"
    | "tags"
    | "imageUrl"
    | "stats"
  >,
  stations: TripStation[]
): TripWithStations {
  const now = new Date().toISOString();
  return {
    id: "preview",
    name: props.name || "טיול ללא שם",
    short_description: props.shortDescription,
    full_description: props.fullDescription,
    main_image: props.imageUrl,
    gallery_images: [],
    tags: props.tags,
    created_by: "",
    status: "draft",
    total_duration_minutes: props.stats.total_duration_minutes,
    total_distance_km: props.stats.total_distance_km,
    estimated_price: props.stats.estimated_price,
    difficulty: props.stats.difficulty,
    accessibility: props.stats.accessibility,
    region: props.stats.region,
    station_count: props.stats.station_count,
    views_count: 0,
    favorites_count: 0,
    avg_rating: 0,
    created_at: now,
    updated_at: now,
    stations,
  };
}

export function BuildTripPreviewDialog({
  open,
  onClose,
  name,
  shortDescription,
  fullDescription,
  tags,
  imageUrl,
  stations,
  places,
  trails,
  users,
  stats,
  startTime,
}: BuildTripPreviewDialogProps) {
  if (!open) return null;

  const sorted = [...stations].sort((a, b) => a.order_index - b.order_index);
  const trip = buildPreviewTrip(
    { name, shortDescription, fullDescription, tags, imageUrl, stats },
    sorted
  );

  const startHour = Number.parseInt(startTime.split(":")[0] ?? "9", 10) || 9;
  const { totalTravelKm } = computeTripSchedule(sorted, places, trails, startHour);
  const mapMarkers = buildTripMapMarkers(sorted, places, trails);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-2 sm:p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="תצוגה מקדימה של הטיול"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e5e7eb] bg-white px-4 py-3 md:px-6">
          <span className="text-sm font-medium text-[#6b7280]">תצוגה מקדימה — כך ייראה עמוד הטיול</span>
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
          <TripDetailHero trip={trip} previewMode />
          <TripDetailHighlights trip={trip} totalTravelKm={totalTravelKm} />
          <TripDetailDescription description={trip.full_description} />
          <TripDetailItinerary
            stations={sorted}
            places={places}
            trails={trails}
            mapMarkers={mapMarkers}
          />
          <TripDetailGallery
            trip={trip}
            stations={sorted}
            places={places}
            trails={trails}
          />
          <div className="py-8">
            <TripDetailStats trip={trip} reviewsCount={0} ratingsCount={0} />
          </div>
          <TripDetailRating avgRating={0} userRating={0} onRate={() => {}} canRate={false} />
          <TripDetailReviews comments={[]} users={users} onAddReview={() => {}} canAddReview={false} />
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
