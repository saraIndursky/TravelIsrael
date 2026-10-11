"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Filter, Plus, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LazyList } from "@/components/ui/custom/lazy-list";
import { getPlaces } from "@/lib/data/places";
import { getTrails } from "@/lib/data/trails";
import type { Place, Trail } from "@/types";
import { useRegionNames } from "@/hooks/use-region-names";
import { formatStopDuration } from "@/lib/utils/trip-time";
import { getDifficultyColor, getDifficultyLabel, getTypeStyle } from "@/lib/utils/trip-display";
import { PageLoadingSpinner } from "@/components/layout/page-loading";

interface StationPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: "place" | "trail", id: string) => void;
  variant?: "list" | "grid";
  onCreatePlace?: () => void;
  onCreateTrail?: () => void;
}

type StationItem = { type: "place" | "trail"; item: Place | Trail };

export function StationPicker({
  open,
  onClose,
  onSelect,
  variant = "list",
  onCreatePlace,
  onCreateTrail,
}: StationPickerProps) {
  const regionNames = useRegionNames();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [items, setItems] = useState<StationItem[]>([]);
  const [tab, setTab] = useState<"all" | "place" | "trail">("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      getPlaces({ search, region: region as never, status: "approved" }),
      getTrails({ search, region: region as never, status: "approved" }),
    ]).then(([places, trails]) => {
      const combined: StationItem[] = [
        ...places.map((p) => ({ type: "place" as const, item: p })),
        ...trails.map((t) => ({ type: "trail" as const, item: t })),
      ];
      setItems(combined);
      setLoading(false);
    });
  }, [open, search, region]);

  const filtered = items.filter((i) => tab === "all" || i.type === tab);

  if (variant === "grid") {
    return (
      open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white">
            <div className="border-b border-[#e5e7eb] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#111827]">הוספת תחנה למסלול</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-[#f3f4f6]"
                >
                  <X className="h-5 w-5 text-[#111827]" />
                </button>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                  <input
                    type="text"
                    placeholder="חיפוש לפי שם או אזור..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-[#d1d5db] px-4 py-3 pr-10 transition-colors focus:border-[#111827] focus:outline-none"
                  />
                </div>
                <select
                  aria-label="אזור"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="rounded-lg border border-[#d1d5db] px-4 py-3 transition-colors focus:border-[#111827] focus:outline-none"
                >
                  <option value="">כל האזורים</option>
                  {regionNames.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex gap-2">
                {(["all", "place", "trail"] as const).map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={tab === t ? "default" : "outline"}
                    onClick={() => setTab(t)}
                  >
                    {t === "all" ? "הכל" : t === "place" ? "מקומות" : "מסלולים"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="max-h-[calc(90vh-220px)] overflow-y-auto p-6">
              {loading ? (
                <PageLoadingSpinner size="sm" className="py-8" />
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <Filter className="mx-auto mb-3 h-12 w-12 text-[#6b7280]" />
                  <p className="mb-4 text-[#6b7280]">לא נמצאו תוצאות</p>
                  {(onCreatePlace || onCreateTrail) && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {onCreatePlace && (
                        <button
                          type="button"
                          onClick={() => {
                            onCreatePlace();
                            onClose();
                          }}
                          className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6]"
                        >
                          + יצירת מקום חדש
                        </button>
                      )}
                      {onCreateTrail && (
                        <button
                          type="button"
                          onClick={() => {
                            onCreateTrail();
                            onClose();
                          }}
                          className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6]"
                        >
                          + יצירת מסלול חדש
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filtered.map(({ type, item }) => {
                    const duration =
                      type === "place"
                        ? (item as Place).avg_duration_minutes
                        : (item as Trail).duration_minutes;
                    const difficulty =
                      type === "trail" ? (item as Trail).difficulty : undefined;
                    const typeName =
                      type === "place"
                        ? (item as Place).place_type
                        : (item as Trail).trail_type;

                    return (
                      <div
                        key={item.id}
                        className="rounded-lg border border-[#e5e7eb] p-4 transition-all hover:border-[#d1d5db]"
                      >
                        <div className="flex gap-4">
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="mb-2 font-bold text-[#111827]">{item.name}</h3>
                            <div className="mb-2 flex items-center gap-2 text-xs text-[#6b7280]">
                              <span>{item.region}</span>
                              <span>•</span>
                              <span
                                className={`inline-block rounded px-2 py-1 text-xs ${getDifficultyColor(difficulty)}`}
                              >
                                {getDifficultyLabel(difficulty)}
                              </span>
                              <span>•</span>
                              <span>{formatStopDuration(duration)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span
                                className={`rounded px-2 py-1 text-xs font-medium ${getTypeStyle(typeName)}`}
                              >
                                {typeName}
                              </span>
                              <button
                                type="button"
                                onClick={() => onSelect(type, item.id)}
                                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6]"
                              >
                                <Plus className="h-4 w-4" />
                                הוספה
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {(onCreatePlace || onCreateTrail) && (
              <div className="flex flex-wrap gap-2 border-t border-[#e5e7eb] bg-[#f9fafb] p-4">
                <p className="w-full text-xs text-[#6b7280]">לא מצאת? צרי חדש ויחזור אוטומטית לטיול:</p>
                {onCreatePlace && (
                  <button
                    type="button"
                    onClick={() => {
                      onCreatePlace();
                      onClose();
                    }}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#d1d5db] bg-white px-3 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6]"
                  >
                    <Plus className="h-4 w-4" />
                    מקום חדש
                  </button>
                )}
                {onCreateTrail && (
                  <button
                    type="button"
                    onClick={() => {
                      onCreateTrail();
                      onClose();
                    }}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#d1d5db] bg-white px-3 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6]"
                  >
                    <Plus className="h-4 w-4" />
                    מסלול חדש
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>בחירת תחנה</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="חיפוש..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select
            aria-label="אזור"
            className="h-10 w-full rounded-md border px-3 text-sm"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="">כל האזורים</option>
            {regionNames.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            {(["all", "place", "trail"] as const).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={tab === t ? "default" : "outline"}
                onClick={() => setTab(t)}
              >
                {t === "all" ? "הכל" : t === "place" ? "מקומות" : "מסלולים"}
              </Button>
            ))}
          </div>
          {loading ? (
            <PageLoadingSpinner size="sm" className="py-4" />
          ) : (
            <LazyList
              items={filtered}
              pageSize={10}
              className="space-y-2"
              renderItem={({ type, item }) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full rounded-lg border p-3 text-right transition-colors hover:bg-muted"
                  onClick={() => onSelect(type, item.id)}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{type === "place" ? "מקום" : "מסלול"}</Badge>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.short_description}</p>
                </button>
              )}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
