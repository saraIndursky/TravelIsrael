import { tripPath, type ContentRef } from "@/lib/utils/content-path";

export function getAppBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export function buildTripShareUrl(trip: ContentRef): string {
  return `${getAppBaseUrl()}${tripPath(trip)}`;
}

export type ShareResult = "shared" | "copied";

export async function shareLink(input: {
  url: string;
  title: string;
  text?: string;
}): Promise<ShareResult> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: input.title,
        text: input.text,
        url: input.url,
      });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(input.url);
    return "copied";
  }

  throw new Error("שיתוף לא נתמך בדפדפן זה");
}

export async function shareTrip(trip: ContentRef & {
  name: string;
  short_description: string;
}): Promise<ShareResult> {
  const result = await shareLink({
    url: buildTripShareUrl(trip),
    title: trip.name,
    text: trip.short_description,
  });

  const { trackEvent } = await import("@/lib/analytics");
  trackEvent("trip_shared", { trip_id: trip.id });

  return result;
}
