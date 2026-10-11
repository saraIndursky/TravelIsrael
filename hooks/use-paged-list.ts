"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Page } from "@/lib/data/paged";

/**
 * Loads a list one page at a time from the server. The first page is fetched whenever
 * `resetKey` changes (filters / sort), and `loadMore` fetches the next page and appends it.
 */
export function usePagedList<T extends { id: string }>(
  fetchPage: (page: number) => Promise<Page<T>>,
  resetKey: string
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(0);
  const requestRef = useRef(0);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  useEffect(() => {
    const request = ++requestRef.current;
    pageRef.current = 0;
    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setItems([]);
    setHasMore(false);

    fetchRef
      .current(0)
      .then((result) => {
        if (request !== requestRef.current) return;
        setItems(result.items);
        setTotal(result.total);
        setHasMore(result.hasMore);
      })
      .catch(() => {
        if (request === requestRef.current) setError("שגיאה בטעינת הנתונים");
      })
      .finally(() => {
        if (request === requestRef.current) setLoading(false);
      });
  }, [resetKey]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    const request = requestRef.current;
    const next = pageRef.current + 1;
    setLoadingMore(true);
    setError(null);
    try {
      const result = await fetchRef.current(next);
      if (request !== requestRef.current) return;
      pageRef.current = next;
      setItems((previous) => {
        const seen = new Set(previous.map((item) => item.id));
        return [...previous, ...result.items.filter((item) => !seen.has(item.id))];
      });
      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch {
      if (request === requestRef.current) setError("שגיאה בטעינת עוד תוצאות");
    } finally {
      if (request === requestRef.current) setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore]);

  return { items, total, hasMore, loading, loadingMore, error, loadMore };
}
