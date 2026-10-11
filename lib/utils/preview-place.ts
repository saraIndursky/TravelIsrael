import type { Accessibility, Place, Region } from "@/types";
import type { PlaceFormValues } from "@/lib/validations";
import { toDisplayImageUrl } from "@/lib/utils/image-url";

const DEFAULT_PLACE_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg/1280px-ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg";

type PreviewPlaceBase = Pick<Place, "id" | "created_by" | "status">;

export function buildPreviewPlace(values: PlaceFormValues, base?: PreviewPlaceBase): Place {
  const now = new Date().toISOString();
  const imageUrl = toDisplayImageUrl(values.image_url?.trim() || DEFAULT_PLACE_IMAGE);

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
