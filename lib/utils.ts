import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ACCESSIBILITY_LEVELS } from "@/lib/levels";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTripCardDuration(minutes: number): string {
  if (minutes >= 1440) {
    const days = Math.floor(minutes / 1440);
    const hours = Math.round((minutes % 1440) / 60);
    if (hours > 0) {
      return `כ-${days} ימים ו-${hours} שעות`;
    }
    return days === 1 ? "כ-יום אחד" : `כ-${days} ימים`;
  }
  const hours = Math.max(1, Math.round(minutes / 60));
  return `כ-${hours} שעות`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} דק׳`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} שע׳ ${mins} דק׳` : `${hours} שע׳`;
}

export function formatPrice(price: number): string {
  if (price === 0) return "חינם";
  return `₪${price}`;
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} מ׳` : `${km.toFixed(1)} ק״מ`;
}

export function getAccessibilityLabel(level: number): string {
  const rounded = Math.min(5, Math.max(1, Math.round(level)));
  return ACCESSIBILITY_LEVELS.find((entry) => entry.level === rounded)?.name ?? "לא נגיש";
}

export function getReviewCount(trip: { views_count: number; favorites_count: number; avg_rating: number }): number {
  if (trip.avg_rating <= 0) return 0;
  return Math.max(1, Math.round(trip.favorites_count * 0.6 + trip.views_count / 120));
}
