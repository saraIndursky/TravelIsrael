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
            <h2 className="ti-section-title">פופולריים</h2>
          </div>
          <Link href="/trips" className="text-sm font-medium text-foreground hover:text-primary transition">
            צפה בכל הטיולים
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.slice(0, 3).map((trip, index, shown) => {
            // With two columns, a lone last card would fill only half the row: let it span both.
            const spansRow = index === shown.length - 1 && shown.length % 2 === 1;
            return (
              <div key={trip.id} className={spansRow ? "sm:col-span-2 lg:col-span-1" : "h-full"}>
                <TripCard trip={trip} showFavorite fullRow={spansRow} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
