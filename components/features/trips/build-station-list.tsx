"use client";

import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  MapPin,
  Trash2,
} from "lucide-react";
import type { Place, Trail, TripStation, TravelMode } from "@/types";
import { TRAVEL_MODE_LABELS } from "@/types/enums";
import { resolveStationDetails } from "@/lib/utils/trip-calculations";
import { formatStopDuration } from "@/lib/utils/trip-time";
import { getDifficultyColor, getDifficultyLabel, getTypeStyle } from "@/lib/utils/trip-display";

interface BuildStationListProps {
  stations: TripStation[];
  places: Place[];
  trails: Trail[];
  segmentDistances: (string | null)[];
  onChange: (stations: TripStation[]) => void;
}

function getStationEntity(
  station: TripStation,
  places: Place[],
  trails: Trail[]
): Place | Trail | null {
  if (station.station_type === "place" && station.place_id) {
    return places.find((p) => p.id === station.place_id) ?? null;
  }
  if (station.station_type === "trail" && station.trail_id) {
    return trails.find((t) => t.id === station.trail_id) ?? null;
  }
  return null;
}

export function BuildStationList({
  stations,
  places,
  trails,
  segmentDistances,
  onChange,
}: BuildStationListProps) {
  const sorted = [...stations].sort((a, b) => a.order_index - b.order_index);

  const reorder = (from: number, to: number) => {
    if (to < 0 || to >= sorted.length) return;
    const next = [...sorted];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(
      next.map((s, i) => ({
        ...s,
        order_index: i,
        travel_mode: i === next.length - 1 ? undefined : (s.travel_mode ?? "car"),
      }))
    );
  };

  const remove = (id: string) => {
    onChange(
      sorted
        .filter((s) => s.id !== id)
        .map((s, i) => ({
          ...s,
          order_index: i,
          travel_mode: i === sorted.length - 2 ? undefined : s.travel_mode,
        }))
    );
  };

  const setTravelMode = (index: number, mode: TravelMode) => {
    const next = [...sorted];
    next[index] = { ...next[index], travel_mode: mode };
    onChange(next);
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-[#e5e7eb] py-12 text-center">
        <MapPin className="mx-auto mb-3 h-12 w-12 text-[#9ca3af]" />
        <p className="mb-4 text-[#6b7280]">עדיין אין תחנות במסלול</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((station, index) => {
        const entity = getStationEntity(station, places, trails);
        const details = resolveStationDetails(station, places, trails);
        if (!entity || !details) return null;

        const typeStyle = getTypeStyle(details.type);
        const difficultyLabel = getDifficultyLabel(details.difficulty);

        return (
          <div
            key={station.id}
            className="rounded-lg border border-[#e5e7eb] p-4 transition-all hover:border-[#d1d5db]"
          >
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <span className="cursor-grab p-1 text-[#6b7280]">
                  <GripVertical className="h-5 w-5" />
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => reorder(index, index - 1)}
                    disabled={index === 0}
                    className={`p-1 ${index === 0 ? "text-[#d1d5db]" : "text-[#6b7280] hover:text-[#111827]"}`}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => reorder(index, index + 1)}
                    disabled={index === sorted.length - 1}
                    className={`p-1 ${index === sorted.length - 1 ? "text-[#d1d5db]" : "text-[#6b7280] hover:text-[#111827]"}`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={entity.image_url}
                  alt={details.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="mb-2 font-bold text-[#111827]">{details.name}</h3>
                <div className="mb-2 flex items-center gap-3 text-sm text-[#6b7280]">
                  <span>{entity.region}</span>
                  <span>•</span>
                  <span className={`inline-block rounded px-2 py-1 text-xs ${getDifficultyColor(details.difficulty)}`}>
                    {difficultyLabel}
                  </span>
                  <span>•</span>
                  <span>{formatStopDuration(details.duration)}</span>
                </div>
                <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${typeStyle}`}>
                  {details.type}
                </span>
              </div>

              <button
                type="button"
                onClick={() => remove(station.id)}
                className="rounded-lg p-2 text-[#dc2626] transition-colors hover:bg-[#fee2e2]"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {index < sorted.length - 1 && (
              <div className="mt-4 flex w-fit items-center gap-3 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2">
                <span className="text-xs font-medium text-[#6b7280]">מעבר ליעד הבא:</span>
                <select
                  aria-label="אמצעי הגעה"
                  value={station.travel_mode ?? "car"}
                  onChange={(e) => setTravelMode(index, e.target.value as TravelMode)}
                  className="cursor-pointer bg-transparent text-sm font-medium text-[#111827] outline-none"
                >
                  {(Object.entries(TRAVEL_MODE_LABELS) as [TravelMode, string][]).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {segmentDistances[index] && (
                  <span className="text-xs text-[#6b7280]">({segmentDistances[index]})</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
