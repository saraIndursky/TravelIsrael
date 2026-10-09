import type { Place, Trail, Trip } from "@/types";

export function createTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "trip-1",
    name: "טיול בדיקה",
    short_description: "תיאור קצר לבדיקה",
    full_description: "תיאור מלא לבדיקה של הטיול",
    main_image: "https://example.com/image.jpg",
    gallery_images: [],
    tags: ["משפחות", "נוף"],
    created_by: "user-1",
    status: "approved",
    total_duration_minutes: 240,
    total_distance_km: 5,
    estimated_price: 100,
    difficulty: "easy",
    accessibility: 4,
    region: "מרכז",
    station_count: 2,
    views_count: 0,
    favorites_count: 0,
    avg_rating: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

export function createPlace(overrides: Partial<Place> = {}): Place {
  return {
    id: "place-1",
    name: "מקום בדיקה",
    short_description: "תיאור קצר",
    full_description: "תיאור מלא של המקום לבדיקה",
    address: "רחוב 1, תל אביב",
    lat: 32.0853,
    lng: 34.7818,
    region: "מרכז",
    place_type: "attraction",
    accessibility: 3,
    tags: ["משפחות"],
    avg_duration_minutes: 60,
    estimated_price: 50,
    image_url: "https://example.com/place.jpg",
    created_by: "user-1",
    status: "approved",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

export function createTrail(overrides: Partial<Trail> = {}): Trail {
  return {
    id: "trail-1",
    name: "מסלול בדיקה",
    short_description: "תיאור קצר",
    full_description: "תיאור מלא של המסלול לבדיקה",
    region: "צפון",
    trail_type: "hike",
    length_km: 8,
    duration_minutes: 180,
    difficulty: "hard",
    accessibility: 2,
    tags: ["נוף"],
    estimated_price: 0,
    start_lat: 32.9,
    start_lng: 35.3,
    end_lat: 32.95,
    end_lng: 35.35,
    waypoints: [],
    image_url: "https://example.com/trail.jpg",
    created_by: "user-1",
    status: "approved",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}
