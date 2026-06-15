"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, Search, SlidersHorizontal, X } from "lucide-react";
import type { Difficulty, Region, Trip } from "@/types";
import { TripCard } from "@/components/features/trips/trip-card";
import {
  TripFilters,
  defaultTripFilterValues,
  FILTER_LIMITS,
  type TripFilterValues,
} from "@/components/features/trips/trip-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { getTrips, type SortDirection, type TripSort } from "@/lib/data/trips";

function parseFiltersFromParams(params: URLSearchParams): TripFilterValues {
  return {
    search: params.get("search") ?? "",
    region: params.get("region") ?? "",
    difficulty: params.get("difficulty") ?? "",
    accessibility: params.get("accessibility") ?? "",
    tripType: params.get("tripType") ?? "",
    stationCount: Number(params.get("stationCount") ?? 0),
    maxDurationHours: Number(params.get("maxDurationHours") ?? FILTER_LIMITS.maxDurationHours),
    maxDistanceKm: Number(params.get("maxDistanceKm") ?? FILTER_LIMITS.maxDistanceKm),
    maxPrice: Number(params.get("maxPrice") ?? FILTER_LIMITS.maxPrice),
  };
}

function buildParamsFromFilters(
  values: TripFilterValues,
  sortBy: TripSort,
  sortDirection: SortDirection
): URLSearchParams {
  const params = new URLSearchParams();
  if (values.search) params.set("search", values.search);
  if (values.region) params.set("region", values.region);
  if (values.difficulty) params.set("difficulty", values.difficulty);
  if (values.accessibility) params.set("accessibility", values.accessibility);
  if (values.tripType) params.set("tripType", values.tripType);
  if (values.stationCount > 0) params.set("stationCount", String(values.stationCount));
  if (values.maxDurationHours < FILTER_LIMITS.maxDurationHours) {
    params.set("maxDurationHours", String(values.maxDurationHours));
  }
  if (values.maxDistanceKm < FILTER_LIMITS.maxDistanceKm) {
    params.set("maxDistanceKm", String(values.maxDistanceKm));
  }
  if (values.maxPrice < FILTER_LIMITS.maxPrice) {
    params.set("maxPrice", String(values.maxPrice));
  }
  if (sortBy !== "createAt") params.set("sortBy", sortBy);
  if (sortDirection !== "desc") params.set("sortDirection", sortDirection);
  return params;
}

function isFilterActive(values: TripFilterValues): boolean {
  return Boolean(
    values.search ||
      values.region ||
      values.difficulty ||
      values.accessibility ||
      values.tripType ||
      values.stationCount > 0 ||
      values.maxDurationHours < FILTER_LIMITS.maxDurationHours ||
      values.maxDistanceKm < FILTER_LIMITS.maxDistanceKm ||
      values.maxPrice < FILTER_LIMITS.maxPrice
  );
}

export function TripsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const appliedFilters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams]
  );

  const sortBy = (searchParams.get("sortBy") as TripSort) || "createAt";
  const sortDirection = (searchParams.get("sortDirection") as SortDirection) || "desc";

  const [draftFilters, setDraftFilters] = useState<TripFilterValues>(appliedFilters);

  useEffect(() => {
    setDraftFilters(appliedFilters);
  }, [appliedFilters]);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    const f = appliedFilters;
    const result = await getTrips(
      {
        region: (f.region as Region) || undefined,
        difficulty: (f.difficulty as Difficulty) || undefined,
        accessibility: f.accessibility ? Number(f.accessibility) : undefined,
        tripType: f.tripType || undefined,
        stationCount: f.stationCount > 0 ? f.stationCount : undefined,
        maxDuration:
          f.maxDurationHours < FILTER_LIMITS.maxDurationHours
            ? f.maxDurationHours * 60
            : undefined,
        maxDistance:
          f.maxDistanceKm < FILTER_LIMITS.maxDistanceKm ? f.maxDistanceKm : undefined,
        maxPrice: f.maxPrice < FILTER_LIMITS.maxPrice ? f.maxPrice : undefined,
        search: f.search || undefined,
        status: "approved",
      },
      sortBy,
      sortDirection,
      0,
      100
    );
    setTrips(result.trips);
    setVisibleCount(12);
    setLoading(false);
  }, [appliedFilters, sortBy, sortDirection]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const pushState = (
    filters: TripFilterValues,
    nextSortBy: TripSort = sortBy,
    nextSortDirection: SortDirection = sortDirection
  ) => {
    const params = buildParamsFromFilters(filters, nextSortBy, nextSortDirection);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const applyFilters = (values: TripFilterValues) => {
    pushState(values);
    setMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    pushState(defaultTripFilterValues);
    setDraftFilters(defaultTripFilterValues);
    setMobileFiltersOpen(false);
  };

  const visibleTrips = trips.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <h1 className="mb-3 text-4xl font-light text-[#111827]">מצא את הטיול הבא שלך</h1>
          <p className="text-sm text-[#6b7280]">
            סינון טיולים לפי אזור, רמת קושי, נגישות, משך זמן ועוד
          </p>
        </div>
      </div>

      <div className="w-full px-6 py-8 xl:px-12 2xl:px-20">
        <div className="flex gap-8">
          <aside className="hidden w-80 shrink-0 lg:block">
            <div className="sticky top-8">
              <TripFilters
                values={draftFilters}
                onChange={setDraftFilters}
                onApply={() => applyFilters(draftFilters)}
                onClear={clearFilters}
              />
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-end gap-3">
              <span className="text-sm text-gray-600">מיין לפי</span>
              <select
                value={sortBy}
                onChange={(e) => pushState(appliedFilters, e.target.value as TripSort, sortDirection)}
                className="rounded-sm border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="createAt">תאריך יצירה</option>
                <option value="name">שם</option>
                <option value="price">מחיר</option>
                <option value="duration">משך זמן</option>
                <option value="lengthKM">אורך מסלול</option>
                <option value="numberOfViews">מספר צפיות</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  pushState(
                    appliedFilters,
                    sortBy,
                    sortDirection === "asc" ? "desc" : "asc"
                  )
                }
                className="rounded-sm border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                aria-label="החלף כיוון מיון"
              >
                {sortDirection === "asc" ? (
                  <ArrowUp className="inline h-4 w-4 text-black" />
                ) : (
                  <ArrowDown className="inline h-4 w-4 text-black" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-sm bg-[#111827] py-3 text-sm font-medium text-white lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              סינון
            </button>

            <div className="mb-6 text-sm text-[#6b7280]">נמצאו {trips.length} טיולים</div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[520px] rounded-lg" />
                ))}
              </div>
            ) : visibleTrips.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {visibleTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} showFavorite />
                  ))}
                </div>

                {visibleCount < trips.length && (
                  <div className="pt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((count) => count + 12)}
                      className="rounded-sm bg-[#111827] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
                    >
                      טען עוד...
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f4f6]">
                  <Search className="h-8 w-8 text-[#9ca3af]" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-[#111827]">לא נמצאו טיולים</h3>
                <p className="mb-6 text-sm text-[#6b7280]">לא נמצאו טיולים לפי הסינון שבחרת</p>
                {isFilterActive(appliedFilters) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-sm bg-[#111827] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
                  >
                    איפוס סינון
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
            role="presentation"
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-medium text-[#111827]">סינון</h3>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-[#f3f4f6]"
                  aria-label="סגור סינון"
                >
                  <X className="h-5 w-5 text-[#111827]" />
                </button>
              </div>
              <TripFilters
                values={draftFilters}
                onChange={setDraftFilters}
                onApply={() => applyFilters(draftFilters)}
                onClear={clearFilters}
                className="border-0 p-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
