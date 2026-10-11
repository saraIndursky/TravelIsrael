"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollFooterProps {
  hasMore: boolean;
  loadingMore: boolean;
  error: string | null;
  /** Called when the footer scrolls into view and another page is available. */
  onLoadMore: () => void;
  /** Shown when every page has been loaded. */
  endMessage?: string;
}

/**
 * Sits under a list: triggers loading the next page from the server when it becomes visible,
 * shows a spinner while that request is running, and lets the user retry after an error.
 */
export function InfiniteScrollFooter({
  hasMore,
  loadingMore,
  error,
  onLoadMore,
  endMessage,
}: InfiniteScrollFooterProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loadingMore || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, error, onLoadMore]);

  if (loadingMore) {
    return (
      <div
        className="flex items-center justify-center gap-2 py-8 text-sm text-[#6b7280]"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        <span>טוען עוד...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-sm text-[#6b7280]">
        <span>{error}</span>
        <button
          type="button"
          onClick={onLoadMore}
          className="rounded-sm border border-[#d1d5db] bg-white px-4 py-2 text-[#111827] hover:bg-[#f3f4f6]"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  if (hasMore) {
    return <div ref={sentinelRef} className="h-12" aria-hidden="true" />;
  }

  return endMessage ? (
    <p className="py-8 text-center text-sm text-[#9ca3af]">{endMessage}</p>
  ) : null;
}
