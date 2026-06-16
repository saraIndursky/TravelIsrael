export const PLACE_FIELD_LABELS: Record<string, string> = {
  name: "שם",
  short_description: "תיאור קצר",
  full_description: "תיאור מלא",
  address: "כתובת",
  lat: "קו רוחב",
  lng: "קו אורך",
  region: "אזור",
  place_type: "סוג מקום",
  accessibility: "נגישות",
  tags: "תגיות",
  avg_duration_minutes: "משך ביקור",
  estimated_price: "מחיר משוער",
  opening_time: "שעת פתיחה",
  closing_time: "שעת סגירה",
  phone: "טלפון",
  website: "אתר",
  image_url: "תמונה",
};

export const TRAIL_FIELD_LABELS: Record<string, string> = {
  name: "שם",
  short_description: "תיאור קצר",
  full_description: "תיאור מלא",
  region: "אזור",
  trail_type: "סוג מסלול",
  length_km: "אורך",
  duration_minutes: "משך",
  difficulty: "קושי",
  accessibility: "נגישות",
  tags: "תגיות",
  estimated_price: "מחיר משוער",
  operating_hours: "שעות פעילות",
  start_lat: "התחלה — lat",
  start_lng: "התחלה — lng",
  end_lat: "סיום — lat",
  end_lng: "סיום — lng",
  waypoints: "נקודות ביניים",
  image_url: "תמונה",
};

export const TRIP_FIELD_LABELS: Record<string, string> = {
  name: "שם הטיול",
  short_description: "תיאור קצר",
  full_description: "תיאור מלא",
  tags: "תגיות",
  main_image: "תמונה",
};

export function getFieldLabel(entity: "place" | "trail" | "trip", field: string): string {
  const maps = {
    place: PLACE_FIELD_LABELS,
    trail: TRAIL_FIELD_LABELS,
    trip: TRIP_FIELD_LABELS,
  };
  return maps[entity][field] ?? field;
}
