import { HomeHero } from "@/components/home/hero";
import { HomeFeaturedTrips } from "@/components/home/featured-trips";
import { HomeStats } from "@/components/home/stats";
import { HomeFeatures } from "@/components/home/features";
import { HomeCta } from "@/components/home/cta";
import { getTrips } from "@/lib/data/trips";

export default async function HomePage() {
  const { trips } = await getTrips({}, "numberOfViews", "desc", 0, 6);

  return (
    <div>
      <HomeHero />
      <HomeFeaturedTrips trips={trips} />
      <HomeStats />
      <HomeFeatures />
      <HomeCta />
    </div>
  );
}
