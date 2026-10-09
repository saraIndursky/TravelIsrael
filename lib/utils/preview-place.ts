import type { Accessibility, Place, Region } from "@/types";
import type { PlaceFormValues } from "@/lib/validations";

const DEFAULT_PLACE_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";

type PreviewPlaceBase = Pick<Place, "id" | "created_by" | "status">;

export function buildPreviewPlace(values: PlaceFormValues, base?: PreviewPlaceBase): Place {
  const now = new Date().toISOString();
  const imageUrl = values.image_url?.trim() || DEFAULT_PLACE_IMAGE;

  return {
    id: base?.id ?? "preview",
    name: values.name.trim() || "מקום ללא שם",
    short_description: values.short_description.trim(),
    full_description: values.full_description.trim(),
    address: values.address.trim(),
    lat: values.lat,
    lng: values.lng,
    region: (values.region as Region) || "מרכז",
    place_type: values.place_type || "אחר",
    accessibility: values.accessibility as Accessibility,
    tags: values.tags ?? [],
    avg_duration_minutes: values.avg_duration_minutes,
    estimated_price: values.estimated_price,
    opening_time: values.opening_time?.trim() || undefined,
    closing_time: values.closing_time?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    website: values.website?.trim() || undefined,
    image_url: imageUrl,
    created_by: base?.created_by ?? "",
    status: base?.status ?? "pending",
    updated_at: now,
  };
}
