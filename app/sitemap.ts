import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/trips`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/places`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/trails`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/wizard`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  return staticRoutes;
}
