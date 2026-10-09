export type AnalyticsEventName =
  | "wizard_completed"
  | "wizard_results_viewed"
  | "wizard_trip_selected"
  | "trip_created"
  | "trip_shared"
  | "user_registered";

export type AnalyticsEventProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: AnalyticsEventProps }) => void;
  }
}

function getProvider(): "vercel" | "plausible" | null {
  const value = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER?.trim().toLowerCase();
  if (value === "vercel" || value === "plausible") return value;
  return null;
}

export function isAnalyticsEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true") return true;
  if (process.env.NODE_ENV !== "production") return false;
  return getProvider() !== null;
}

/** Client-only — no-op in dev unless NEXT_PUBLIC_ANALYTICS_DEBUG=true */
export function trackEvent(name: AnalyticsEventName, props?: AnalyticsEventProps): void {
  if (typeof window === "undefined" || !isAnalyticsEnabled()) return;

  const provider = getProvider();
  if (provider === "plausible") {
    window.plausible?.(name, props ? { props } : undefined);
    return;
  }

  if (provider === "vercel") {
    void import("@vercel/analytics").then(({ track }) => track(name, props));
  }
}
