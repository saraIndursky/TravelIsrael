"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import type { Region } from "@/types";
import { useRegionNames } from "@/hooks/use-region-names";
import { PlaceCard } from "@/components/features/places/place-card";
import { Skeleton } from "@/components/ui/skeleton";
import { InfiniteScrollFooter } from "@/components/ui/custom/infinite-scroll-footer";
import { usePagedList } from "@/hooks/use-paged-list";
import { PAGE_SIZE } from "@/lib/data/paged";
import { getPlacesPage } from "@/lib/data/places";
import { useAuthStore } from "@/hooks/use-stores";

const inputClass =
  "w-full rounded-sm border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#111827] focus:border-[#111827] focus:outline-none";

export function PlacesClient() {
  const regionNames = useRegionNames();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useAuthStore();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");

  const appliedSearch = searchParams.get("search") ?? "";
  const appliedRegion = searchParams.get("region") ?? "";

  useEffect(() => {
    setSearch(appliedSearch);
    setRegion(appliedRegion);
  }, [appliedSearch, appliedRegion]);

  const fetchPlacesPage = useCallback(
    (page: number) =>
      getPlacesPage(
        {
          search: appliedSearch || undefined,
          region: (appliedRegion as Region) || undefined,
        },
        page,
        PAGE_SIZE
      ),
    [appliedSearch, appliedRegion]
  );

  const { items: places, total, hasMore, loading, loadingMore, error, loadMore } = usePagedList(
    fetchPlacesPage,
    `${appliedSearch}|${appliedRegion}`
  );

  function applyFilters() {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (region) params.set("region", region);
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }


  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mb-3 text-4xl font-light text-[#111827]">מקומות לביקור</h1>
              <p className="text-sm text-[#6b7280]">גלה מוזיאונים, חופים, אתרים ועוד ברחבי ישראל</p>
            </div>
            {role !== "guest" && (
              <Link
                href="/places/create"
                className="inline-flex items-center gap-2 rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"
              >
                <Plus className="h-4 w-4" />
                הוסף מקום
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חפש מקום..."
              className={inputClass + " pr-10"}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>
          <select aria-label="אזור" className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">כל האזורים</option>
            {regionNames.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-[#111827] py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] sm:col-span-3"
          >
            חיפוש
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        ) : places.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">לא נמצאו מקומות</p>
        ) : (
          <>
            <div className="mb-4 text-sm text-[#6b7280]">נמצאו {total} מקומות</div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
            <InfiniteScrollFooter
              hasMore={hasMore}
              loadingMore={loadingMore}
              error={error}
              onLoadMore={loadMore}
              endMessage="הוצגו כל המקומות"
            />
          </>
        )}
      </div>
    </div>
  );
}
