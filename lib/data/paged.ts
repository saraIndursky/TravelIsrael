/** Server-side pagination helpers shared by the trips, places and trails discovery lists. */

export const PAGE_SIZE = 12;

export interface Page<T> {
  items: T[];
  /** Number of rows matching the filters across all pages (exact count from the database). */
  total: number;
  hasMore: boolean;
}

export function pageRange(page: number, pageSize: number): { from: number; to: number } {
  const from = Math.max(0, page) * pageSize;
  return { from, to: from + pageSize - 1 };
}

export function toPage<T>(items: T[], total: number | null, page: number, pageSize: number): Page<T> {
  const count = total ?? items.length;
  return { items, total: count, hasMore: page * pageSize + items.length < count };
}

/**
 * Builds a PostgREST `or` expression that matches the name, short description and (for a
 * single-word search) an exact tag. Characters that have a meaning inside an `or` filter are
 * stripped so user input can never change the structure of the query.
 */
export function buildSearchFilter(search: string | undefined): string | null {
  const term = (search ?? "")
    .replace(/[%,()"'\\*{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!term) return null;

  const parts = [`name.ilike.%${term}%`, `short_description.ilike.%${term}%`];
  if (!/\s/.test(term)) parts.push(`tags.cs.{${term}}`);
  return parts.join(",");
}
