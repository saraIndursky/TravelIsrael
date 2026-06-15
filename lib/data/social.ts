import type { Comment, EntityType, Rating } from "@/types";
import { getCurrentUser } from "./auth";
import { generateId, getStore, updateStore } from "./store";

export async function getRatings(entityType: EntityType, entityId: string): Promise<Rating[]> {
  return getStore().ratings.filter(
    (r) => r.entity_type === entityType && r.entity_id === entityId
  );
}

export async function getUserRating(
  entityType: EntityType,
  entityId: string
): Promise<Rating | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    getStore().ratings.find(
      (r) =>
        r.user_id === user.id && r.entity_type === entityType && r.entity_id === entityId
    ) ?? null
  );
}

export async function upsertRating(
  entityType: EntityType,
  entityId: string,
  score: number
): Promise<Rating | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const existing = getStore().ratings.find(
    (r) =>
      r.user_id === user.id && r.entity_type === entityType && r.entity_id === entityId
  );

  let rating: Rating;
  if (existing) {
    rating = { ...existing, score };
    updateStore((s) => ({
      ...s,
      ratings: s.ratings.map((r) => (r.id === existing.id ? rating : r)),
    }));
  } else {
    rating = {
      id: generateId("r"),
      user_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      score,
      created_at: new Date().toISOString(),
    };
    updateStore((s) => ({ ...s, ratings: [...s.ratings, rating] }));
  }

  if (entityType === "trip") {
    const tripRatings = getStore().ratings.filter(
      (r) => r.entity_type === "trip" && r.entity_id === entityId
    );
    const avg = tripRatings.reduce((sum, r) => sum + r.score, 0) / tripRatings.length;
    updateStore((s) => ({
      ...s,
      trips: s.trips.map((t) => (t.id === entityId ? { ...t, avg_rating: avg } : t)),
    }));
  }

  return rating;
}

export async function getComments(entityType: EntityType, entityId: string): Promise<Comment[]> {
  return getStore().comments.filter(
    (c) => c.entity_type === entityType && c.entity_id === entityId
  );
}

export async function getUserComment(
  entityType: EntityType,
  entityId: string
): Promise<Comment | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    getStore().comments.find(
      (c) =>
        c.user_id === user.id && c.entity_type === entityType && c.entity_id === entityId
    ) ?? null
  );
}

export async function addComment(
  entityType: EntityType,
  entityId: string,
  content: string
): Promise<Comment | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const alreadyCommented = getStore().comments.some(
    (c) =>
      c.user_id === user.id && c.entity_type === entityType && c.entity_id === entityId
  );
  if (alreadyCommented) return null;

  const comment: Comment = {
    id: generateId("c"),
    user_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
    content,
    created_at: new Date().toISOString(),
  };

  updateStore((s) => ({ ...s, comments: [...s.comments, comment] }));
  return comment;
}

export async function getUserComments(): Promise<Comment[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return getStore().comments.filter((c) => c.user_id === user.id);
}

export async function getUserRatings(): Promise<Rating[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return getStore().ratings.filter((r) => r.user_id === user.id);
}
