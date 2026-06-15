import type { Difficulty, Region, Status, Trail } from "@/types";
import { canViewStatus, getCurrentRole, getCurrentUser } from "./auth";
import { getStore } from "./store";

export interface TrailFilters {
  region?: Region;
  difficulty?: Difficulty;
  trail_type?: string;
  tags?: string[];
  accessibility?: number;
  search?: string;
  status?: Status;
}

export async function getTrails(filters?: TrailFilters): Promise<Trail[]> {
  const store = getStore();
  const user = await getCurrentUser();
  const role = await getCurrentRole();

  let trails = store.trails.filter((t) =>
    canViewStatus(t.status, t.created_by, role, user?.id ?? null)
  );

  if (filters?.status) trails = trails.filter((t) => t.status === filters.status);
  if (filters?.region) trails = trails.filter((t) => t.region === filters.region);
  if (filters?.difficulty) trails = trails.filter((t) => t.difficulty === filters.difficulty);
  if (filters?.trail_type) trails = trails.filter((t) => t.trail_type === filters.trail_type);
  if (filters?.accessibility)
    trails = trails.filter((t) => t.accessibility >= filters.accessibility!);
  if (filters?.tags?.length)
    trails = trails.filter((t) => filters.tags!.some((tag) => t.tags.includes(tag)));
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    trails = trails.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.short_description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
    );
  }

  return trails;
}

export async function getTrailById(id: string): Promise<Trail | null> {
  const trails = await getTrails();
  return trails.find((t) => t.id === id) ?? null;
}

export async function updateTrailStatus(id: string, status: Status): Promise<Trail | null> {
  const role = await getCurrentRole();
  if (role !== "admin") return null;
  const { updateStore } = await import("./store");
  updateStore((store) => ({
    ...store,
    trails: store.trails.map((t) =>
      t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t
    ),
  }));
  return getTrailById(id);
}

export async function getAllTrailsAdmin(): Promise<Trail[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];
  return getStore().trails;
}
