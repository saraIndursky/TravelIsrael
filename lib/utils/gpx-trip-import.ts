import type { Place, Trail, TripWithStations } from "@/types";
import { COMMON_TAGS } from "@/types/enums";
import { getPlaces } from "@/lib/data/places";
import { getTrails } from "@/lib/data/trails";
import { createTrip } from "@/lib/data/trips";
import { computeTripStats, type StationInput } from "@/lib/utils/trip-calculations";
import { isTravelIsraelGpx, parseGpx, parseTravelIsraelTripGpx } from "@/lib/utils/gpx-parse";

const DEFAULT_TRIP_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg/1280px-ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg";

function findApprovedPlace(places: Place[], name: string): Place | undefined {
  return places.find((place) => place.status === "approved" && place.name.trim() === name.trim());
}

function findApprovedTrail(trails: Trail[], name: string): Trail | undefined {
  return trails.find((trail) => trail.status === "approved" && trail.name.trim() === name.trim());
}

function collectTripTags(
  stationInputs: StationInput[],
  places: Place[],
  trails: Trail[]
): string[] {
  const tags = new Set<string>();
  for (const station of stationInputs) {
    if (station.station_type === "place" && station.place_id) {
      const place = places.find((item) => item.id === station.place_id);
      place?.tags.forEach((tag) => {
        if (COMMON_TAGS.includes(tag as (typeof COMMON_TAGS)[number])) tags.add(tag);
      });
    }
    if (station.station_type === "trail" && station.trail_id) {
      const trail = trails.find((item) => item.id === station.trail_id);
      trail?.tags.forEach((tag) => {
        if (COMMON_TAGS.includes(tag as (typeof COMMON_TAGS)[number])) tags.add(tag);
      });
    }
  }
  const list = [...tags];
  return list.length > 0 ? list.slice(0, 5) : ["טבע"];
}

function pickTripImage(
  stationInputs: StationInput[],
  places: Place[],
  trails: Trail[]
): string {
  for (const station of stationInputs) {
    if (station.station_type === "place" && station.place_id) {
      const image = places.find((place) => place.id === station.place_id)?.image_url?.trim();
      if (image) return image;
    }
    if (station.station_type === "trail" && station.trail_id) {
      const image = trails.find((trail) => trail.id === station.trail_id)?.image_url?.trim();
      if (image) return image;
    }
  }
  return DEFAULT_TRIP_IMAGE;
}

export async function importTravelIsraelTripFromGpx(xml: string): Promise<TripWithStations> {
  if (!isTravelIsraelGpx(xml)) {
    throw new Error("ייבוא טיול נתמך רק מקובץ GPX שייצא מ-TravelIsrael");
  }

  const parsed = parseGpx(xml);
  const tripImport = parseTravelIsraelTripGpx(parsed);

  const [places, trails] = await Promise.all([getPlaces(), getTrails()]);
  const approvedPlaces = places.filter((place) => place.status === "approved");
  const approvedTrails = trails.filter((trail) => trail.status === "approved");

  const stationInputs: StationInput[] = [];

  for (const station of tripImport.stations) {
    if (station.type === "place") {
      const place = findApprovedPlace(approvedPlaces, station.name);
      if (!place) {
        throw new Error(
          `לא נמצא מקום "${station.name}" — ודאו שה-GPX יוצא מהאתר והמקום עדיין קיים`
        );
      }
      stationInputs.push({
        station_type: "place",
        place_id: place.id,
        trail_id: null,
      });
      continue;
    }

    const trail = findApprovedTrail(approvedTrails, station.name);
    if (!trail) {
      throw new Error(
        `לא נמצא מסלול "${station.name}" — ודאו שה-GPX יוצא מהאתר והמסלול עדיין קיים`
      );
    }
    stationInputs.push({
      station_type: "trail",
      place_id: null,
      trail_id: trail.id,
    });
  }

  const stats = computeTripStats(stationInputs, approvedPlaces, approvedTrails);
  const tags = collectTripTags(stationInputs, approvedPlaces, approvedTrails);
  const main_image = pickTripImage(stationInputs, approvedPlaces, approvedTrails);

  const shortFromFile = tripImport.description?.trim().slice(0, 500);
  const short_description =
    shortFromFile && shortFromFile.length >= 10
      ? shortFromFile
      : "טיול שיובא מקובץ GPX — יש להשלים תיאור קצר";

  const full_description =
    tripImport.description?.trim() && tripImport.description.trim().length >= 20
      ? tripImport.description.trim()
      : "טיול שיובא מקובץ GPX שייצא מ-TravelIsrael. ניתן לערוך פרטים ולשלוח שוב לאישור.";

  return createTrip({
    name: `${tripImport.name} (ייבוא GPX)`.slice(0, 200),
    short_description,
    full_description,
    main_image,
    gallery_images: [],
    tags,
    status: "pending",
    ...stats,
    stations: stationInputs.map((station, order_index) => ({
      order_index,
      station_type: station.station_type,
      place_id: station.place_id,
      trail_id: station.trail_id,
      travel_mode: "car",
    })),
  });
}
