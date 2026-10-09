import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import type { Place, Trail, Trip, TripStation } from "@/types";
import { getTypeStyle } from "@/lib/utils/trip-display";
import { computeTripSchedule } from "@/lib/utils/trip-schedule";
import { resolveStationDetails } from "@/lib/utils/trip-calculations";
import { placePath, trailPath } from "@/lib/utils/content-path";
import { TripDetailMap } from "@/components/features/trips/detail/trip-detail-map";
import type { MapMarker } from "@/components/ui/custom/map-view";

interface TripDetailItineraryProps {
  trip: Trip;
  stations: TripStation[];
  places: Place[];
  trails: Trail[];
  mapMarkers: MapMarker[];
  mapPlacement?: "bottom" | "mobile-only";
}

function getStationEntity(
  station: TripStation,
  places: Place[],
  trails: Trail[]
): Place | Trail | null {
  if (station.station_type === "place" && station.place_id) {
    return places.find((p) => p.id === station.place_id) ?? null;
  }
  if (station.station_type === "trail" && station.trail_id) {
    return trails.find((t) => t.id === station.trail_id) ?? null;
  }
  return null;
}

function getStationLink(station: TripStation, entity: Place | Trail): string {
  if (station.station_type === "trail") return trailPath(entity);
  return placePath(entity);
}

function getStationImage(entity: Place | Trail): string {
  return entity.image_url;
}

function getStationDescription(entity: Place | Trail): string {
  return entity.full_description || entity.short_description;
}

export function TripDetailItinerary({
  trip,
  stations,
  places,
  trails,
  mapMarkers,
  mapPlacement = "bottom",
}: TripDetailItineraryProps) {
  const sorted = [...stations].sort((a, b) => a.order_index - b.order_index);
  const { items } = computeTripSchedule(sorted, places, trails);

  if (sorted.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-24 text-[#6b7280] md:px-6">
        לא נמצאו תחנות לטיול
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 md:px-6">
      <section>
        <h2 className="mb-4 text-3xl font-light text-[#111827]">מסלול יומי מפורט</h2>
        <div className="space-y-8">
          {sorted.map((station, index) => {
            const entity = getStationEntity(station, places, trails);
            const details = resolveStationDetails(station, places, trails);
            const schedule = items[index];
            if (!entity || !details || !schedule) return null;

            const typeName = details.type;
            const typeStyle = getTypeStyle(typeName);

            return (
              <Link key={station.id} href={getStationLink(station, entity)} className="block">
                <div className="overflow-hidden rounded-sm border border-[#e5e7eb] transition-all hover:border-[#d1d5db]">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <div className="relative aspect-[4/3] md:aspect-square">
                        <Image
                          src={getStationImage(entity)}
                          alt={details.name}
                          fill
                          className="object-cover"
                          sizes="(max-width:768px) 100vw, 33vw"
                        />
                        <div className="absolute right-3 top-3">
                          <span
                            className={`rounded-full px-4 py-1.5 text-xs font-medium ${typeStyle}`}
                          >
                            {typeName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 md:col-span-2">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <div className="mb-2 flex items-center gap-3">
                            <span className="text-2xl font-bold text-[#111827]">{index + 1}.</span>
                            <h3 className="text-2xl font-medium text-[#111827]">{details.name}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#6b7280]">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {schedule.arrivalTime}
                            </span>
                            <span>•</span>
                            <span>{schedule.stayDuration}</span>
                            {schedule.travelToNext && (
                              <>
                                <span>•</span>
                                <span>{schedule.travelToNext}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="mb-4 line-clamp-4 leading-relaxed text-[#4b5563]">
                        {getStationDescription(entity)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {mapPlacement === "bottom" && (
        <TripDetailMap
          markers={mapMarkers}
          trip={trip}
          stations={stations}
          places={places}
          trails={trails}
        />
      )}
      {mapPlacement === "mobile-only" && (
        <div className="lg:hidden">
          <TripDetailMap
            markers={mapMarkers}
            trip={trip}
            stations={stations}
            places={places}
            trails={trails}
          />
        </div>
      )}
    </div>
  );
}
