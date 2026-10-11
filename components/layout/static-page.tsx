import type { LucideIcon } from "lucide-react";

/** Hero photos are Wikimedia Commons images served through our cached proxy. */
export function wikimediaBackground(url: string): string {
  return `/api/wiki-image?u=${encodeURIComponent(url)}`;
}

interface PageHeroProps {
  icon: LucideIcon;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  imageUrl: string;
  compact?: boolean;
}

export function PageHero({
  icon: Icon,
  badge,
  title,
  highlight,
  description,
  imageUrl,
  compact = false,
}: PageHeroProps) {
  return (
    <div className={`relative overflow-hidden ${compact ? "h-[46vh] md:h-[52vh]" : "h-[60vh] md:h-[70vh]"}`}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${wikimediaBackground(imageUrl)}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>
      <div className="relative flex h-full items-center justify-center">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white backdrop-blur-sm">
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium">{badge}</span>
          </div>
          <h1 className="mb-6 text-4xl font-light leading-tight text-white md:text-6xl lg:text-7xl">
            {title}
            <br />
            <span className="font-medium">{highlight}</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/90 md:text-2xl">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function SectionHeading({ title, subtitle, centered = false }: { title: string; subtitle?: string; centered?: boolean }) {
  return (
    <div className={centered ? "mb-12 text-center" : "mb-8"}>
      <div className={`mb-4 flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
        <div className="h-1 w-12 rounded-full bg-gradient-to-r from-gray-500 to-gray-900" />
        <h2 className="text-3xl font-light text-gray-900 md:text-4xl">{title}</h2>
        {centered && <div className="h-1 w-12 rounded-full bg-gradient-to-l from-gray-500 to-gray-900" />}
      </div>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  );
}

/** Simple readable layout for text pages (terms, privacy, help). */
export function TextPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-3 text-4xl font-light text-gray-900">{title}</h1>
        {intro && <p className="mb-2 text-lg text-gray-600">{intro}</p>}
        {updated && <p className="mb-10 text-sm text-gray-400">עודכן לאחרונה: {updated}</p>}
        <div className="space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">{children}</div>
      </div>
    </div>
  );
}

export function TextSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-gray-900">{title}</h2>
      <div className="space-y-3 leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}
