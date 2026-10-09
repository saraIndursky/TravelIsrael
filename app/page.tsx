import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeHero } from "@/components/home/hero";
import { HomeFeaturedTripsSection } from "@/components/home/featured-trips-section";
import { HomeFeaturedTripsSkeleton } from "@/components/home/featured-trips-skeleton";
import { HomeStatsSection } from "@/components/home/stats-section";
import { HomeStatsSkeleton } from "@/components/home/stats";
import { HomeFeatures } from "@/components/home/features";
import { HomeCta } from "@/components/home/cta";

const HOME_OG_IMAGE =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=630&fit=crop";

export const metadata: Metadata = {
  title: "TravelIsrael — תכנון, גילוי ושיתוף טיולים בישראל",
  description:
    "גלו מסלולים, מקומות וטיולים מתוכננים בישראל. בנו מסלול מותאם אישית, שמרו מועדפים ושתפו חוויות.",
  openGraph: {
    title: "TravelIsrael — תכנון טיולים בישראל",
    description:
      "גלו מסלולים, מקומות וטיולים מתוכננים בישראל. בנו מסלול מותאם אישית, שמרו מועדפים ושתפו חוויות.",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: HOME_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "נוף טבע בישראל — TravelIsrael",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelIsrael — תכנון טיולים בישראל",
    description:
      "גלו מסלולים, מקומות וטיולים מתוכננים בישראל. בנו מסלול מותאם אישית, שמרו מועדפים ושתפו חוויות.",
    images: [HOME_OG_IMAGE],
  },
};

export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <Suspense fallback={<HomeFeaturedTripsSkeleton />}>
        <HomeFeaturedTripsSection />
      </Suspense>
      <Suspense fallback={<HomeStatsSkeleton />}>
        <HomeStatsSection />
      </Suspense>
      <HomeFeatures />
      <HomeCta />
    </div>
  );
}
