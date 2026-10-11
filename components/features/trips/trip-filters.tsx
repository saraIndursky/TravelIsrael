"use client";

import { Accessibility, MapPin, Search, TrendingUp } from "lucide-react";
import { useRegionNames } from "@/hooks/use-region-names";
import { cn } from "@/lib/utils";

export const TRIP_TYPE_OPTIONS = ["טבע", "תרבות", "ים", "מדבר", "משפחות", "היסטוריה", "אוכל"] as const;

export const FILTER_LIMITS = {
  maxDurationHours: 100,
  maxDistanceKm: 500,
  maxPrice: 500,
} as const;

export interface TripFilterValues {
  search: string;
  region: string;
  difficulty: string;
  accessibility: string;
  tripType: string;
  stationCount: number;
  maxDurationHours: number;
  maxDistanceKm: number;
  maxPrice: number;
}

export const defaultTripFilterValues: TripFilterValues = {
  search: "",
  region: "",
  difficulty: "",
  accessibility: "",
  tripType: "",
  stationCount: 0,
  maxDurationHours: FILTER_LIMITS.maxDurationHours,
  maxDistanceKm: FILTER_LIMITS.maxDistanceKm,
  maxPrice: FILTER_LIMITS.maxPrice,
};

interface TripFiltersProps {
  values: TripFilterValues;
  onChange: (values: TripFilterValues) => void;
  onApply: () => void;
  onClear: () => void;
  className?: string;
}

const selectClass =
  "w-full rounded-sm border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#111827] transition-colors focus:border-[#111827] focus:outline-none";

export function TripFilters({ values, onChange, onApply, onClear, className }: TripFiltersProps) {
  const regionNames = useRegionNames();
  const set = <K extends keyof TripFilterValues>(key: K, value: TripFilterValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className={cn("rounded-lg border border-[#e5e7eb] bg-white p-6", className)}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-[#111827]">סינון</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-[#6b7280] transition-colors hover:text-[#111827]"
        >
          ניקוי הכול
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">חיפוש</label>
          <div className="relative">
            <input
              type="text"
              value={values.search}
              onChange={(e) => set("search", e.target.value)}
              placeholder="חיפוש טיול..."
              className="w-full rounded-sm border border-[#d1d5db] bg-white px-4 py-2.5 pr-10 text-sm text-[#111827] transition-colors focus:border-[#111827] focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && onApply()}
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">
            <MapPin className="ml-1 inline h-4 w-4 text-gray-600" />
            אזור
          </label>
          <select aria-label="אזור" value={values.region} onChange={(e) => set("region", e.target.value)} className={selectClass}>
            <option value="">כל האזורים</option>
            {regionNames.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">
            <TrendingUp className="ml-1 inline h-4 w-4 text-gray-600" />
            רמת קושי
          </label>
          <select aria-label="רמת קושי" value={values.difficulty} onChange={(e) => set("difficulty", e.target.value)} className={selectClass}>
            <option value="">כל הרמות</option>
            <option value="easy">קל</option>
            <option value="medium">בינוני</option>
            <option value="hard">קשה</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">
            <Accessibility className="ml-1 inline h-4 w-4 text-gray-600" />
            נגישות
          </label>
          <select aria-label="נגישות" value={values.accessibility} onChange={(e) => set("accessibility", e.target.value)} className={selectClass}>
            <option value="">הכל</option>
            <option value="2">נגישות בסיסית ומעלה</option>
            <option value="3">נגישות בינונית ומעלה</option>
            <option value="4">נגישות גבוהה ומעלה</option>
            <option value="5">נגישות מלאה</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">סוג טיול</label>
          <select aria-label="סוג טיול" value={values.tripType} onChange={(e) => set("tripType", e.target.value)} className={selectClass}>
            <option value="">הכל</option>
            {TRIP_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">מספר תחנות</label>
          <input
            type="number"
            aria-label="מספר תחנות מינימלי"
            min={1}
            max={15}
            value={values.stationCount || ""}
            onChange={(e) => set("stationCount", Number(e.target.value) || 0)}
            className={selectClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">
            משך זמן: עד {values.maxDurationHours} שעות
          </label>
          <input
            type="range"
            aria-label="משך זמן מקסימלי בשעות"
            min={1}
            max={FILTER_LIMITS.maxDurationHours}
            value={values.maxDurationHours}
            onChange={(e) => set("maxDurationHours", Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#e5e7eb]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">
            אורך מסלול: עד {values.maxDistanceKm} ק&quot;מ
          </label>
          <input
            type="range"
            aria-label="אורך מסלול מקסימלי בקילומטרים"
            min={1}
            max={FILTER_LIMITS.maxDistanceKm}
            value={values.maxDistanceKm}
            onChange={(e) => set("maxDistanceKm", Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#e5e7eb]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">
            מחיר: עד {values.maxPrice} ₪
          </label>
          <input
            type="range"
            aria-label="מחיר מקסימלי בשקלים"
            min={1}
            max={FILTER_LIMITS.maxPrice}
            value={values.maxPrice}
            onChange={(e) => set("maxPrice", Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#e5e7eb]"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onApply}
        className="mt-6 w-full rounded-sm bg-[#111827] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
      >
        החל סינון
      </button>
    </div>
  );
}
