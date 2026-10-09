import { getHomeStatsServer } from "@/lib/data/server/stats";
import { HomeStats } from "@/components/home/stats";

export async function HomeStatsSection() {
  const stats = await getHomeStatsServer();
  return <HomeStats stats={stats} />;
}
