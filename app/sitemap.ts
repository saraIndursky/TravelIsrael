import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { placePath, trailPath, tripPath } from "@/lib/utils/content-path";

// rebuilt at most once an hour, so new approved content shows up without a redeploy
export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/trips`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/places`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/trails`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/wizard`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // approved content only (drafts, pending and removed items are not public)
  let contentRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createClient();
    const [trips, places, trails] = await Promise.all(
      (["trips", "places", "trails"] as const).map((table) =>
        supabase.from(table).select("id, slug, updated_at").eq("status", "approved").limit(5000)
      )
    );
    const entries = (
      rows: { id: string; slug: string | null; updated_at: string | null }[] | null,
      path: (ref: { id: string; slug?: string }) => string
    ) =>
      (rows ?? []).map((row) => ({
        url: `${BASE}${path({ id: row.id, slug: row.slug ?? undefined })}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    contentRoutes = [
      ...entries(trips.data, tripPath),
      ...entries(places.data, placePath),
      ...entries(trails.data, trailPath),
    ];
  } catch {
    // the static pages are still listed if the database can't be reached
  }

  return [...staticRoutes, ...contentRoutes];
}
