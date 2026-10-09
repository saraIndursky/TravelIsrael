import type { HomeStats } from "@/lib/data/server/stats";

function formatStatCount(count: number): string {
  if (count === 0) return "0";
  return `+${count.toLocaleString("he-IL")}`;
}

interface HomeStatsProps {
  stats: HomeStats;
}

export function HomeStats({ stats }: HomeStatsProps) {
  const items = [
    { value: formatStatCount(stats.placesCount), label: "מקומות לטיול" },
    { value: formatStatCount(stats.tripsCount), label: "טיולים מתוכננים" },
    { value: formatStatCount(stats.usersCount), label: "משתמשים" },
  ];

  return (
    <section className="ti-stats-band">
      <div className="ti-container">
        <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-3">
          {items.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <p className="text-4xl font-light tracking-tight md:text-5xl">{stat.value}</p>
              <p className="text-sm text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeStatsSkeleton() {
  return (
    <section className="ti-stats-band">
      <div className="ti-container">
        <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="mx-auto h-12 w-24 animate-pulse rounded bg-white/20 md:h-14" />
              <div className="mx-auto h-4 w-28 animate-pulse rounded bg-white/15" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
