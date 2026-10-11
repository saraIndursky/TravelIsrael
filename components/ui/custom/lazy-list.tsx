"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyListProps<T> {
  items: T[];
  pageSize?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

export function LazyList<T>({
  items,
  pageSize = 12,
  renderItem,
  className,
  emptyMessage = "לא נמצאו פריטים",
}: LazyListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + pageSize, items.length));
  }, [items.length, pageSize]);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && visibleCount < items.length) loadMore();
      },
      { rootMargin: "200px" }
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [visibleCount, items.length, loadMore]);

  const visible = items.slice(0, visibleCount);

  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-12">{emptyMessage}</p>;
  }

  return (
    <div className={className}>
      {visible.map((item, i) => renderItem(item, i))}
      {visibleCount < items.length && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          <Skeleton className="h-8 w-32" />
        </div>
      )}
    </div>
  );
}
