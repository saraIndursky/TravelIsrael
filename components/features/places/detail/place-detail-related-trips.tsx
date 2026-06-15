import type { Trip } from "@/types";
import { TripCard } from "@/components/features/trips/trip-card";

interface PlaceDetailRelatedTripsProps {
  trips: Trip[];
}

function pickFeaturedTrips(trips: Trip[], limit = 3): Trip[] {
  return [...trips]
    .sort((a, b) => {
      if (b.avg_rating !== a.avg_rating) return b.avg_rating - a.avg_rating;
      if (b.favorites_count !== a.favorites_count) return b.favorites_count - a.favorites_count;
      return b.views_count - a.views_count;
    })
    .slice(0, limit);
}

export function PlaceDetailRelatedTrips({ trips }: PlaceDetailRelatedTripsProps) {
  const featuredTrips = pickFeaturedTrips(trips);

  if (featuredTrips.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
      <h2 className="mb-6 text-3xl font-light text-[#111827]">טיולים הכוללים מקום זה</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} showFavorite />
        ))}
      </div>
    </section>
  );
}
