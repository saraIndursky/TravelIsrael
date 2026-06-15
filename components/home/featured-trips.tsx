import Link from "next/link";
import type { Trip } from "@/types";
import { TripCard } from "@/components/features/trips/trip-card";

interface HomeFeaturedTripsProps {
  trips: Trip[];
}

export function HomeFeaturedTrips({ trips }: HomeFeaturedTripsProps) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="ti-container">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="ti-section-subtitle">טיולים נבחרים</p>
            <h2 className="ti-section-title">מומלצים השבוע</h2>
          </div>
          <Link href="/trips" className="text-sm font-medium text-foreground hover:text-primary transition">
            צפה בכל הטיולים
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.slice(0, 3).map((trip) => (
            <TripCard key={trip.id} trip={trip} showFavorite />
          ))}
        </div>
      </div>
    </section>
  );
}
