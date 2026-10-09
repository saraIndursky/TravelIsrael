import type { Metadata } from "next";

interface EntitySeoInput {
  name: string;
  shortDescription: string;
  imageUrl?: string | null;
}

interface EntityMetadataOptions {
  notFoundTitle: string;
  fallbackDescription: string;
  /** e.g. `/trips/abc` — for Open Graph url + canonical */
  canonicalPath?: string;
}

function getSiteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export function buildEntityMetadata(
  entity: EntitySeoInput | null,
  options: EntityMetadataOptions
): Metadata {
  if (!entity) {
    return { title: options.notFoundTitle };
  }

  const title = `${entity.name} — TravelIsrael`;
  const description = entity.shortDescription.trim() || options.fallbackDescription;
  const canonicalUrl = options.canonicalPath
    ? `${getSiteBaseUrl()}${options.canonicalPath}`
    : undefined;

  return {
    title,
    description,
    ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
    openGraph: {
      title: entity.name,
      description,
      locale: "he_IL",
      type: "website",
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      ...(entity.imageUrl
        ? { images: [{ url: entity.imageUrl, alt: entity.name }] }
        : {}),
    },
    twitter: {
      card: entity.imageUrl ? "summary_large_image" : "summary",
      title: entity.name,
      description,
      ...(entity.imageUrl ? { images: [entity.imageUrl] } : {}),
    },
  };
}

export const LIST_PAGE_METADATA = {
  trips: {
    title: "טיולים — TravelIsrael",
    description: "גלו טיולים מתוכננים בישראל — לפי אזור, קושי, משך ונגישות",
  },
  places: {
    title: "מקומות — TravelIsrael",
    description: "גלו מקומות לביקור בישראל — אטרקציות, טבע, תרבות ועוד",
  },
  trails: {
    title: "מסלולים — TravelIsrael",
    description: "גלו מסלולי הליכה וטיול בישראל — לפי אזור, קושי ואורך",
  },
  search: {
    title: "חיפוש — TravelIsrael",
    description: "חפשו טיולים, מקומות ומסלולים בישראל",
  },
  wizard: {
    title: "אשף התאמת טיולים — TravelIsrael",
    description: "מצאו טיולים שמתאימים לכם — אזור, קושי, נגישות, סוג טיול והעדפות",
  },
} as const satisfies Record<string, Metadata>;
