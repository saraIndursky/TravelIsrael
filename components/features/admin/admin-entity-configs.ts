import type { Place, Trail, Trip } from "@/types";
import type { AdminEntityListConfig } from "@/components/features/admin/admin-entity-list-page";
import { computePopularity } from "@/lib/utils/admin-popularity";

export const tripsAdminConfig: AdminEntityListConfig<Trip> = {
  title: "ניהול טיולים",
  subtitle: "נהל את כל הטיולים במערכת",
  entityLabel: "טיול",
  entityLabelPlural: "טיולים",
  addHref: "/trips/create",
  addLabel: "הוסף טיול",
  searchPlaceholder: "חפש לפי שם, אזור או יוצר...",
  typeFilter: {
    label: "קושי",
    allLabel: "כל רמות הקושי",
    options: ["קל", "בינוני", "קשה"],
    getValue: (t) => ({ easy: "קל", medium: "בינוני", hard: "קשה" }[t.difficulty]),
  },
  getImageUrl: (t) => t.main_image,
  getName: (t) => t.name,
  getTypeLabel: (t) => `${t.station_count} תחנות • ${t.total_duration_minutes} דק׳`,
  getCreatorId: (t) => t.created_by,
  getRegion: (t) => t.region,
  getRejectionReason: (t) => t.rejection_reason,
  getStats: (t) => ({
    rating: t.avg_rating,
    saves: t.favorites_count,
    views: t.views_count,
    popularity: computePopularity(t.views_count, t.favorites_count, t.avg_rating),
  }),
  viewHref: (t) => `/trips/${t.id}`,
  editHref: (t) => `/trips/${t.id}/edit`,
  showPopularity: true,
};

export function placesAdminConfig(types: string[]): AdminEntityListConfig<Place> {
  return {
    title: "ניהול מקומות",
    subtitle: "נהל את כל המקומות במערכת",
    entityLabel: "מקום",
    entityLabelPlural: "מקומות",
    addHref: "/places/create",
    addLabel: "הוסף מקום",
    searchPlaceholder: "חפש לפי שם או אזור...",
    typeFilter: {
      label: "סוג",
      allLabel: "כל הסוגים",
      options: types,
      getValue: (p) => p.place_type,
    },
    getImageUrl: (p) => p.image_url,
    getName: (p) => p.name,
    getTypeLabel: (p) => p.place_type,
    getCreatorId: (p) => p.created_by,
    getRegion: (p) => p.region,
    getRejectionReason: (p) => p.rejection_reason,
    viewHref: (p) => `/places/${p.id}`,
  };
}

export function trailsAdminConfig(types: string[]): AdminEntityListConfig<Trail> {
  return {
    title: "ניהול מסלולים",
    subtitle: "נהל את כל המסלולים במערכת",
    entityLabel: "מסלול",
    entityLabelPlural: "מסלולים",
    addHref: "/trails/create",
    addLabel: "הוסף מסלול",
    searchPlaceholder: "חפש לפי שם או אזור...",
    typeFilter: {
      label: "סוג",
      allLabel: "כל הסוגים",
      options: types,
      getValue: (t) => t.trail_type,
    },
    getImageUrl: (t) => t.image_url,
    getName: (t) => t.name,
    getTypeLabel: (t) => `${t.trail_type} • ${t.length_km} ק״מ`,
    getCreatorId: (t) => t.created_by,
    getRegion: (t) => t.region,
    getRejectionReason: (t) => t.rejection_reason,
    viewHref: (t) => `/trails/${t.id}`,
  };
}
