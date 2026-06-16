import type { Accessibility, Difficulty, Region, Trail } from "@/types";
import type { TrailFormValues } from "@/lib/validations";

const DEFAULT_TRAIL_IMAGE =
  "https://images.unsplash.com/photo-1551632811-561732b1c4e9?w=800";

export function buildPreviewTrail(values: TrailFormValues): Trail {
  const now = new Date().toISOString();
  const imageUrl = values.image_url?.trim() || DEFAULT_TRAIL_IMAGE;

  return {
    id: "preview",
    name: values.name.trim() || "מסלול ללא שם",
    short_description: values.short_description.trim(),
    full_description: values.full_description.trim(),
    region: (values.region as Region) || "מרכז",
    trail_type: values.trail_type || "הליכה",
    length_km: values.length_km,
    duration_minutes: values.duration_minutes,
    difficulty: values.difficulty as Difficulty,
    accessibility: values.accessibility as Accessibility,
    tags: values.tags ?? [],
    estimated_price: values.estimated_price,
    operating_hours: values.operating_hours?.trim() || undefined,
    start_lat: values.start_lat,
    start_lng: values.start_lng,
    end_lat: values.end_lat,
    end_lng: values.end_lng,
    waypoints: (values.waypoints ?? []).map((w) => ({
      lat: w.lat,
      lng: w.lng,
      name: w.name?.trim() || undefined,
    })),
    image_url: imageUrl,
    created_by: "",
    status: "pending",
    updated_at: now,
  };
}
