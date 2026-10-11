import "server-only";

/**
 * Best-effort in-memory rate limiter. On serverless each instance keeps its own counters, so
 * this only slows down simple abuse; the database constraints remain the real safety net.
 */
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound.
  if (hits.size > 5000) {
    for (const [mapKey, times] of hits) {
      if (times.every((time) => now - time >= windowMs)) hits.delete(mapKey);
    }
  }
  return false;
}
