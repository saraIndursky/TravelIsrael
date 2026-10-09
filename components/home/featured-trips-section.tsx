import { getTripsServer } from "@/lib/data/server/trips";
import { HomeFeaturedTrips } from "@/components/home/featured-trips";

export async function HomeFeaturedTripsSection() {
  const { trips } = await getTripsServer({ status: "approved" }, "numberOfViews", "desc", 0, 3);
  return <HomeFeaturedTrips trips={trips} />;
}
