const stats = [
  { value: "+500", label: "מקומות לטיול" },
  { value: "+200", label: "טיולים מתוכננים" },
  { value: "+10,000", label: "משתמשים" },
];

export function HomeStats() {
  return (
    <section className="ti-stats-band">
      <div className="ti-container">
        <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <p className="text-4xl md:text-5xl font-light tracking-tight">{stat.value}</p>
              <p className="text-sm text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
