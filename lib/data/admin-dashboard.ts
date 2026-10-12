import { createClient } from "@/lib/supabase/client";

export interface OldestPending {
  trips: string | null;
  places: string | null;
  trails: string | null;
  reports: string | null;
  moderation: string | null;
  messages: string | null;
}

/** Date of the oldest item still waiting in each admin queue (null when the queue is empty). */
export async function getOldestPending(): Promise<OldestPending> {
  const supabase = createClient();

  async function oldest(table: string, dateColumn: string, filter: (q: any) => any): Promise<string | null> {
    const query = filter(supabase.from(table).select(dateColumn));
    const { data, error } = await query.order(dateColumn, { ascending: true }).limit(1);
    if (error || !data?.length) return null;
    return (data[0] as Record<string, string>)[dateColumn] ?? null;
  }

  const [trips, places, trails, reports, moderation, messages] = await Promise.all([
    oldest("trips", "created_at", (q) => q.eq("status", "pending")),
    // places and trails have no creation date; the last update is when they were sent for review
    oldest("places", "updated_at", (q) => q.eq("status", "pending")),
    oldest("trails", "updated_at", (q) => q.eq("status", "pending")),
    oldest("reports", "created_at", (q) => q.eq("status", "pending")),
    oldest("moderation_queue", "created_at", (q) => q.is("seen_at", null)),
    oldest("contact_messages", "created_at", (q) => q.eq("status", "new")),
  ]);

  return { trips, places, trails, reports, moderation, messages };
}

export interface QueueSummary {
  counts: Record<keyof OldestPending, number>;
  oldest: OldestPending;
}

/** How many items wait in each admin queue, and how long the oldest one has been waiting. */
export async function getQueueSummary(): Promise<QueueSummary> {
  const supabase = createClient();

  async function count(table: string, filter: (q: any) => any): Promise<number> {
    const { count: value, error } = await filter(supabase.from(table).select("*", { count: "exact", head: true }));
    return error ? 0 : (value ?? 0);
  }

  const [trips, places, trails, reports, moderation, messages, oldest] = await Promise.all([
    count("trips", (q) => q.eq("status", "pending")),
    count("places", (q) => q.eq("status", "pending")),
    count("trails", (q) => q.eq("status", "pending")),
    count("reports", (q) => q.eq("status", "pending")),
    count("moderation_queue", (q) => q.is("seen_at", null)),
    count("contact_messages", (q) => q.eq("status", "new")),
    getOldestPending(),
  ]);

  return { counts: { trips, places, trails, reports, moderation, messages }, oldest };
}
