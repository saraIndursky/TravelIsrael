import type { Place, Trail, TripStation } from "@/types";
import type { MapMarker } from "@/components/ui/custom/map-view";
import { resolveStationDetails } from "@/lib/utils/trip-calculations";

export function buildTripMapMarkers(
  stations: TripStation[],
  places: Place[],
  trails: Trail[]
): MapMarker[] {
  const sorted = [...stations].sort((a, b) => a.order_index - b.order_index);

  return sorted.reduce<MapMarker[]>((markers, station, index) => {
    const details = resolveStationDetails(station, places, trails);
    if (!details) return markers;

    if (station.station_type === "place" && station.place_id) {
      const place = places.find((p) => p.id === station.place_id);
      if (!place) return markers;
      markers.push({
        lat: place.lat,
        lng: place.lng,
        label: `${index + 1}. ${details.name}`,
      });
      return markers;
    }

    if (station.trail_id) {
      const trail = trails.find((t) => t.id === station.trail_id);
      if (!trail) return markers;
      markers.push({
        lat: trail.start_lat,
        lng: trail.start_lng,
        label: `${index + 1}. ${details.name}`,
      });
    }

    return markers;
  }, []);
}
