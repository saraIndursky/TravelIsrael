"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { PlaceCard } from "@/components/features/places/place-card";
import { TrailCard } from "@/components/features/trails/trail-card";
import { TripCard } from "@/components/features/trips/trip-card";
import { UnderlineTabNav } from "@/components/features/profile/underline-tab-nav";
import { PageLoadingSpinner } from "@/components/layout/page-loading";
import { LazyList } from "@/components/ui/custom/lazy-list";
import { Skeleton } from "@/components/ui/skeleton";
import { globalSearch } from "@/lib/data/search";
import type { Place, Trail, Trip } from "@/types";

type SearchTab = "all" | "trips" | "places" | "trails";

const inputClass =
  "w-full rounded-sm border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#111827] focus:border-[#111827] focus:outline-none";

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appliedQuery = searchParams.get("q")?.trim() ?? "";
  const [query, setQuery] = useState(appliedQuery);
  const [tab, setTab] = useState<SearchTab>("all");
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);

  useEffect(() => {
    setQuery(appliedQuery);
  }, [appliedQuery]);

  const loadResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setTrips([]);
      setPlaces([]);
      setTrails([]);
      return;
    }

    setLoading(true);
    const result = await globalSearch({ q });
    setTrips(result.trips);
    setPlaces(result.places);
    setTrails(result.trails);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadResults(appliedQuery);
  }, [appliedQuery, loadResults]);

  function applySearch() {
    const trimmed = query.trim();
    router.replace(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  const tabs = useMemo(
    () =>
      [
        { value: "all" as const, label: "הכל", count: trips.length + places.length + trails.length },
        { value: "trips" as const, label: "טיולים", count: trips.length },
        { value: "places" as const, label: "מקומות", count: places.length },
        { value: "trails" as const, label: "מסלולים", count: trails.length },
      ] satisfies { value: SearchTab; label: string; count: number }[],
    [trips.length, places.length, trails.length]
  );

  const showEmptyPrompt = !appliedQuery;
  const showNoResults = appliedQuery && !loading && tabs[0].count === 0;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <h1 className="mb-3 text-4xl font-light text-[#111827]">חיפוש</h1>
          <p className="text-sm text-[#6b7280]">חפשו טיולים, מקומות ומסלולים בכל האתר</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש טיול, מקום או מסלול..."
              className={inputClass + " pr-10"}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              aria-label="חיפוש גלובלי"
            />
          </div>
          <button
            type="button"
            onClick={applySearch}
            className="mt-3 w-full rounded-lg bg-[#111827] py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] sm:w-auto sm:px-8"
          >
            חיפוש
          </button>
        </div>

        {appliedQuery && (
          <UnderlineTabNav tabs={tabs} value={tab} onChange={setTab} className="mb-6" />
        )}

        {showEmptyPrompt && (
          <p className="py-12 text-center text-sm text-[#6b7280]">הקלידו מילת חיפוש כדי להתחיל</p>
        )}

        {loading && appliedQuery && (
          <div className="space-y-6">
            <PageLoadingSpinner size="sm" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          </div>
        )}

        {showNoResults && (
          <p className="py-12 text-center text-sm text-[#6b7280]">
            לא נמצאו תוצאות עבור &quot;{appliedQuery}&quot;
          </p>
        )}

        {!loading && appliedQuery && tab === "all" && tabs[0].count > 0 && (
          <div className="space-y-10">
            {trips.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-medium text-[#111827]">טיולים</h2>
                <LazyList
                  items={trips}
                  pageSize={20}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3"
                  emptyMessage=""
                  renderItem={(trip) => <TripCard key={trip.id} trip={trip} />}
                />
              </section>
            )}
            {places.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-medium text-[#111827]">מקומות</h2>
                <LazyList
                  items={places}
                  pageSize={20}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3"
                  emptyMessage=""
                  renderItem={(place) => <PlaceCard key={place.id} place={place} />}
                />
              </section>
            )}
            {trails.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-medium text-[#111827]">מסלולים</h2>
                <LazyList
                  items={trails}
                  pageSize={20}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3"
                  emptyMessage=""
                  renderItem={(trail) => <TrailCard key={trail.id} trail={trail} />}
                />
              </section>
            )}
          </div>
        )}

        {!loading && appliedQuery && tab === "trips" && (
          <LazyList
            items={trips}
            pageSize={20}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3"
            emptyMessage="לא נמצאו טיולים"
            renderItem={(trip) => <TripCard key={trip.id} trip={trip} />}
          />
        )}

        {!loading && appliedQuery && tab === "places" && (
          <LazyList
            items={places}
            pageSize={20}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3"
            emptyMessage="לא נמצאו מקומות"
            renderItem={(place) => <PlaceCard key={place.id} place={place} />}
          />
        )}

        {!loading && appliedQuery && tab === "trails" && (
          <LazyList
            items={trails}
            pageSize={20}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3"
            emptyMessage="לא נמצאו מסלולים"
            renderItem={(trail) => <TrailCard key={trail.id} trail={trail} />}
          />
        )}
      </div>
    </div>
  );
}
