import type { Comment, EntityType, Rating } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { mapComment, mapRating } from "@/lib/supabase/mappers";
import { notifySocialActivity } from "@/lib/notifications/client";
import { getCurrentUser } from "./auth";

export async function getRatings(entityType: EntityType, entityId: string): Promise<Rating[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRating);
}

export async function getUserRating(
  entityType: EntityType,
  entityId: string
): Promise<Rating | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("user_id", user.id)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRating(data) : null;
}

async function refreshTripAverage(entityId: string): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase.from("ratings").select("score").eq("entity_type", "trip").eq("entity_id", entityId);
  if (error) throw new Error(error.message);

  const avg =
    (data ?? []).length > 0
      ? (data ?? []).reduce((sum, row) => sum + row.score, 0) / (data ?? []).length
      : 0;

  await supabase.from("trips").update({ avg_rating: avg }).eq("id", entityId);
}

export async function upsertRating(
  entityType: EntityType,
  entityId: string,
  score: number
): Promise<Rating | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("ratings")
    .upsert(
      {
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        score,
      },
      { onConflict: "user_id,entity_type,entity_id" }
    )
    .select("*")
    .single();

  if (error || !data) return null;

  if (entityType === "trip") {
    await refreshTripAverage(entityId);
  }

  void notifySocialActivity({ entityType, entityId, event: "rating" });

  return mapRating(data);
}

export async function getComments(entityType: EntityType, entityId: string): Promise<Comment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapComment);
}

export async function getUserComment(
  entityType: EntityType,
  entityId: string
): Promise<Comment | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("user_id", user.id)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapComment(data) : null;
}

export async function addComment(
  entityType: EntityType,
  entityId: string,
  content: string
): Promise<Comment | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const existing = await getUserComment(entityType, entityId);
  if (existing) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      user_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      content,
    })
    .select("*")
    .single();

  if (error || !data) return null;
  void notifySocialActivity({ entityType, entityId, event: "comment" });
  return mapComment(data);
}

export async function getUserComments(): Promise<Comment[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("comments").select("*").eq("user_id", user.id);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapComment);
}

export async function getUserRatings(): Promise<Rating[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("ratings").select("*").eq("user_id", user.id);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRating);
}
