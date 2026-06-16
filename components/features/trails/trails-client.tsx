"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import type { Difficulty, Region } from "@/types";
import { DIFFICULTY_LABELS, REGIONS } from "@/types/enums";
import { TrailCard } from "@/components/features/trails/trail-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTrails } from "@/lib/data/trails";
import { useAuthStore } from "@/hooks/use-stores";

const inputClass =
  "w-full rounded-sm border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#111827] focus:border-[#111827] focus:outline-none";

export function TrailsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useAuthStore();
  const [trails, setTrails] = useState<Awaited<ReturnType<typeof getTrails>>>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") ?? "");

  const appliedSearch = searchParams.get("search") ?? "";
  const appliedRegion = searchParams.get("region") ?? "";
  const appliedDifficulty = searchParams.get("difficulty") ?? "";

  useEffect(() => {
    setSearch(appliedSearch);
    setRegion(appliedRegion);
    setDifficulty(appliedDifficulty);
  }, [appliedSearch, appliedRegion, appliedDifficulty]);

  const loadTrails = useCallback(async () => {
    setLoading(true);
    const result = await getTrails({
      status: "approved",
      search: appliedSearch || undefined,
      region: (appliedRegion as Region) || undefined,
      difficulty: (appliedDifficulty as Difficulty) || undefined,
    });
    setTrails(result);
    setVisibleCount(12);
    setLoading(false);
  }, [appliedSearch, appliedRegion, appliedDifficulty]);

  useEffect(() => {
    loadTrails();
  }, [loadTrails]);

  function applyFilters() {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (region) params.set("region", region);
    if (difficulty) params.set("difficulty", difficulty);
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }

  const visibleTrails = trails.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mb-3 text-4xl font-light text-[#111827]">מסלולים לטיול</h1>
              <p className="text-sm text-[#6b7280]">הליכה, טיפוס, אופניים ומסלולים מרהיבים</p>
            </div>
            {role !== "guest" && (
              <Link
                href="/trails/create"
                className="inline-flex items-center gap-2 rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"
              >
                <Plus className="h-4 w-4" />
                הוסף מסלול
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חפש מסלול..."
              className={inputClass + " pr-10"}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>
          <select className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">כל האזורים</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            className={inputClass}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">כל רמות הקושי</option>
            {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-[#111827] py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] sm:col-span-4"
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
        ) : trails.length === 0 ? (
          <p className="text-center text-[#6b7280]">לא נמצאו מסלולים</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {visibleTrails.map((trail) => (
                <TrailCard key={trail.id} trail={trail} />
              ))}
            </div>
            {visibleCount < trails.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 12)}
                className="mt-8 w-full rounded-lg border border-[#d1d5db] bg-white py-3 text-sm font-medium text-[#111827] hover:bg-[#f9fafb]"
              >
                טען עוד...
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
