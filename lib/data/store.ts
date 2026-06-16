import type {
  Comment,
  Favorite,
  Place,
  Rating,
  Report,
  Trail,
  Trip,
  TripStation,
  User,
  UserRole,
} from "@/types";
import {
  seedComments,
  seedFavorites,
  seedPlaces,
  seedRatings,
  seedReports,
  seedTrails,
  seedTripStations,
  seedTrips,
  seedUsers,
  DEMO_USER_ID,
} from "@/data/seed";

function migrateStore(store: DemoStore): DemoStore {
  const trip1Seed = seedTrips.find((t) => t.id === "trip-1");
  const existingTripIds = new Set(store.trips.map((t) => t.id));

  const trips = store.trips.map((t) => {
    const seed = seedTrips.find((s) => s.id === t.id);
    const gallery_images = t.gallery_images ?? seed?.gallery_images ?? [];
    const full_description =
      t.id === "trip-1" && trip1Seed?.full_description
        ? trip1Seed.full_description
        : t.full_description;
    if (!seed) {
      return { ...t, gallery_images, full_description };
    }
    const demoProfileTrips = ["trip-11", "trip-13", "trip-14"].includes(t.id);
    return {
      ...t,
      gallery_images,
      full_description,
      ...(demoProfileTrips
        ? {
            status: seed.status,
            rejection_reason: seed.rejection_reason,
            short_description: seed.short_description,
            name: seed.name,
          }
        : { rejection_reason: t.rejection_reason ?? seed.rejection_reason }),
    };
  });

  const missingTrips = seedTrips
    .filter((t) => !existingTripIds.has(t.id))
    .map((t) => structuredClone(t));

  return {
    ...store,
    trips: [...trips, ...missingTrips],
    users: store.users.map((u) => {
      const seed = seedUsers.find((s) => s.id === u.id);
      return seed ? { ...u, created_at: u.created_at ?? seed.created_at } : u;
    }),
    reports: store.reports.map((r) => ({
      ...r,
      report_type: r.report_type ?? "problem",
    })),
    favorites: store.favorites.map((f) => {
      const legacy = f as Favorite & { trip_id?: string };
      if (legacy.entity_type && legacy.entity_id) return f;
      if (legacy.trip_id) {
        return {
          id: legacy.id,
          user_id: legacy.user_id,
          entity_type: "trip" as const,
          entity_id: legacy.trip_id,
          created_at: legacy.created_at,
        };
      }
      return f;
    }),
  };
}

export interface DemoStore {
  users: User[];
  places: Place[];
  trails: Trail[];
  trips: Trip[];
  tripStations: TripStation[];
  ratings: Rating[];
  comments: Comment[];
  favorites: Favorite[];
  reports: Report[];
  currentUserId: string;
  currentRole: UserRole;
}

const STORAGE_KEY = "travel-israel-demo-store";

function createInitialStore(): DemoStore {
  return {
    users: structuredClone(seedUsers),
    places: structuredClone(seedPlaces),
    trails: structuredClone(seedTrails),
    trips: structuredClone(seedTrips),
    tripStations: structuredClone(seedTripStations),
    ratings: structuredClone(seedRatings),
    comments: structuredClone(seedComments),
    favorites: structuredClone(seedFavorites),
    reports: structuredClone(seedReports),
    currentUserId: DEMO_USER_ID,
    currentRole: "user",
  };
}

let memoryStore: DemoStore = createInitialStore();

function loadStore(): DemoStore {
  if (typeof window === "undefined") return memoryStore;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryStore;
    return migrateStore(JSON.parse(raw) as DemoStore);
  } catch {
    return memoryStore;
  }
}

function saveStore(store: DemoStore): void {
  memoryStore = store;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
}

export function getStore(): DemoStore {
  if (typeof window !== "undefined") {
    memoryStore = loadStore();
  }
  return memoryStore;
}

export function updateStore(updater: (store: DemoStore) => DemoStore): DemoStore {
  const next = updater(getStore());
  saveStore(next);
  return next;
}

export function resetStore(): void {
  memoryStore = createInitialStore();
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
