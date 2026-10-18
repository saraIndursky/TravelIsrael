import type { LatLng } from "@/lib/utils/geo";

function isValid({ lat, lng }: LatLng): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function round(value: number): string {
  return value.toFixed(6);
}

/** Opens Waze with directions to the point (the app on a phone, the website on a computer). */
export function wazeNavigationUrl(point: LatLng): string | null {
  if (!isValid(point)) return null;
  return `https://waze.com/ul?ll=${round(point.lat)},${round(point.lng)}&navigate=yes`;
}

/** Opens Google Maps with directions to the point. */
export function googleMapsNavigationUrl(point: LatLng): string | null {
  if (!isValid(point)) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${round(point.lat)},${round(point.lng)}`;
}
