import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

function getProvider(): string | null {
  const value = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER?.trim().toLowerCase();
  if (value === "vercel" || value === "plausible") return value;
  return null;
}

function shouldLoadAnalytics(): boolean {
  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true") return true;
  if (process.env.NODE_ENV !== "production") return false;
  return getProvider() !== null;
}

export function AnalyticsScripts() {
  if (!shouldLoadAnalytics()) return null;

  const provider = getProvider();
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();

  return (
    <>
      {provider === "plausible" && plausibleDomain ? (
        <Script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      ) : null}
      {provider === "vercel" ? <Analytics /> : null}
    </>
  );
}
