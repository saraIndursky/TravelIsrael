"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, ArrowRight } from "lucide-react";
import type { Region, Status, Trip } from "@/types";
import { REGIONS, STATUS_LABELS } from "@/types/enums";
import { UnderlineTabNav } from "@/components/features/profile/underline-tab-nav";
import { TripCard } from "@/components/features/trips/trip-card";
import { CREATED_STATUS_TABS, MyTripCard } from "@/components/features/profile/my-trip-card";
import { MyTripsEmptyState } from "@/components/features/profile/my-trips-empty-state";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/hooks/use-stores";
import { getFavoriteTrips, toggleFavorite } from "@/lib/data/favorites";
import {
  deleteTrip,
  duplicateTrip,
  getTrips,
  submitTripForApproval,
} from "@/lib/data/trips";

type MainTab = "created" | "favorites";

interface FavoriteFilters {
  search: string;
  region: Region | "all";
  duration: "all" | "short" | "medium" | "long";
  sortDate: "newest" | "oldest";
  status: Status | "all";
  tag: string;
}

const DEFAULT_FAVORITE_FILTERS: FavoriteFilters = {
  search: "",
  region: "all",
  duration: "all",
  sortDate: "newest",
  status: "all",
  tag: "",
};

function filterByDuration(trip: Trip, duration: FavoriteFilters["duration"]): boolean {
  if (duration === "all") return true;
  const hours = trip.total_duration_minutes / 60;
  if (duration === "short") return hours <= 4;
  if (duration === "medium") return hours > 4 && hours <= 8;
  return hours > 8;
}

export function ProfileTripsClient() {
  const router = useRouter();
  const { role, userId } = useAuthStore();
  const [mainTab, setMainTab] = useState<MainTab>("created");
  const [statusTab, setStatusTab] = useState<Status>("draft");
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [favorites, setFavorites] = useState<Trip[]>([]);
  const [favoriteFilters, setFavoriteFilters] = useState<FavoriteFilters>(DEFAULT_FAVORITE_FILTERS);
  const [busyTripId, setBusyTripId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (role === "guest") {
      setLoading(false);
      return;
    }
    const [{ trips }, favTrips] = await Promise.all([
      getTrips({ createdBy: userId }),
      getFavoriteTrips(),
    ]);
    setMyTrips(trips);
    setFavorites(favTrips);
    setLoading(false);
  }, [role, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const counts = useMemo(
    () => ({
      draft: myTrips.filter((t) => t.status === "draft").length,
      pending: myTrips.filter((t) => t.status === "pending").length,
      approved: myTrips.filter((t) => t.status === "approved").length,
      rejected: myTrips.filter((t) => t.status === "rejected").length,
    }),
    [myTrips]
  );

  const filteredCreatedTrips = useMemo(
    () => myTrips.filter((t) => t.status === statusTab),
    [myTrips, statusTab]
  );

  const filteredFavorites = useMemo(() => {
    let trips = [...favorites];
    const q = favoriteFilters.search.trim().toLowerCase();

    if (q) {
      trips = trips.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.short_description.toLowerCase().includes(q) ||
          t.region.includes(q)
      );
    }
    if (favoriteFilters.region !== "all") {
      trips = trips.filter((t) => t.region === favoriteFilters.region);
    }
    if (favoriteFilters.status !== "all") {
      trips = trips.filter((t) => t.status === favoriteFilters.status);
    }
    if (favoriteFilters.tag) {
      trips = trips.filter((t) => t.tags.includes(favoriteFilters.tag));
    }
    trips = trips.filter((t) => filterByDuration(t, favoriteFilters.duration));

    trips.sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return favoriteFilters.sortDate === "newest" ? bTime - aTime : aTime - bTime;
    });

    return trips;
  }, [favorites, favoriteFilters]);

  const favoriteTags = useMemo(
    () => Array.from(new Set(favorites.flatMap((t) => t.tags))).sort((a, b) => a.localeCompare(b, "he")),
    [favorites]
  );

  async function handleSubmit(tripId: string) {
    setBusyTripId(tripId);
    try {
      const result = await submitTripForApproval(tripId);
      if (!result) {
        toast({ title: "שליחה לאישור נכשלה", variant: "destructive" });
        return;
      }
      toast({ title: "הטיול נשלח לאישור" });
      await loadData();
      setStatusTab("pending");
    } finally {
      setBusyTripId(null);
    }
  }

  async function handleDelete(tripId: string) {
    setBusyTripId(tripId);
    try {
      const ok = await deleteTrip(tripId);
      if (!ok) {
        toast({ title: "מחיקת הטיול נכשלה", variant: "destructive" });
        return;
      }
      toast({ title: "הטיול נמחק" });
      await loadData();
    } finally {
      setBusyTripId(null);
    }
  }

  async function handleDuplicate(tripId: string) {
    setBusyTripId(tripId);
    try {
      const copy = await duplicateTrip(tripId);
      if (!copy) {
        toast({ title: "שכפול הטיול נכשל", variant: "destructive" });
        return;
      }
      toast({ title: "הטיול שוכפל כטיוטה" });
      router.push(`/trips/${copy.id}/edit`);
    } finally {
      setBusyTripId(null);
    }
  }

  async function handleRemoveFavorite(tripId: string) {
    setBusyTripId(tripId);
    try {
      await toggleFavorite(tripId);
      toast({ title: "הוסר מהמועדפים" });
      await loadData();
    } finally {
      setBusyTripId(null);
    }
  }

  if (role === "guest") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-[#f5f6f8] to-[#eef0f4] px-4">
        <div className="max-w-md rounded border border-gray-100 bg-white p-10 text-center shadow-sm">
          <h1 className="mb-2 text-2xl font-light text-gray-900">הטיולים שלי</h1>
          <p className="mb-6 text-sm text-gray-400">יש להתחבר כדי לראות את הטיולים והמועדפים</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="rounded bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            התחברות
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-border bg-white">
          <div className="ti-container animate-pulse py-8 md:py-10">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="mt-4 h-10 w-64 rounded bg-muted" />
            <div className="mt-2 h-4 w-96 max-w-full rounded bg-muted" />
          </div>
        </div>
        <div className="border-b border-border bg-white">
          <div className="ti-container animate-pulse py-4">
            <div className="h-8 w-48 rounded bg-muted" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#f5f6f8] to-[#eef0f4]">
          <div className="ti-container animate-pulse py-8 md:py-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded bg-white" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-white text-right">
      <header className="border-b border-border bg-white">
        <div className="ti-container py-8 md:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-right">
              <Link
                href="/profile"
                className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
              >
                חזרה לאזור האישי
                <ArrowRight className="h-4 w-4" />
              </Link>
              <h1 className="ti-section-title text-foreground">הטיולים שלי</h1>
              <p className="ti-section-subtitle mt-2 text-muted-foreground/80">
                ניהול הטיולים שיצרת והטיולים ששמרת למועדפים.
              </p>
            </div>
            <Link href="/trips/create" className="ti-btn-primary shrink-0 self-end sm:self-auto">
              <Plus className="h-4 w-4" />
              צור טיול חדש
            </Link>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-white">
        <div className="ti-container pt-4 pb-0">
          <UnderlineTabNav
            className="border-0"
            tabs={[
              { value: "created", label: "יצרתי", count: myTrips.length },
              { value: "favorites", label: "אהבתי", count: favorites.length },
            ]}
            value={mainTab}
            onChange={(v) => setMainTab(v)}
          />
        </div>
      </div>

      {mainTab === "created" && (
        <div className="border-b border-border bg-white">
          <div className="ti-container pt-3 pb-0">
            <UnderlineTabNav
              className="border-0"
              tabs={CREATED_STATUS_TABS.map(({ value, label }) => ({
                value,
                label,
                count: counts[value],
              }))}
              value={statusTab}
              onChange={setStatusTab}
            />
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-[#f5f6f8] to-[#eef0f4]">
        <div className="ti-container py-8 md:py-10">
        {mainTab === "created" ? (
          myTrips.length === 0 ? (
            <MyTripsEmptyState />
          ) : filteredCreatedTrips.length === 0 ? (
            <MyTripsEmptyState
              title={`אין טיולים בקטגוריית "${CREATED_STATUS_TABS.find((t) => t.value === statusTab)?.label}"`}
              description="נסי קטגוריה אחרת או צרי טיול חדש."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCreatedTrips.map((trip) => (
                <MyTripCard
                  key={trip.id}
                  trip={trip}
                  busy={busyTripId === trip.id}
                  onSubmit={() => handleSubmit(trip.id)}
                  onDelete={() => handleDelete(trip.id)}
                  onDuplicate={() => handleDuplicate(trip.id)}
                />
              ))}
            </div>
          )
        ) : (
          <>
            <div className="mb-6 rounded border border-border/60 bg-white p-4 text-right shadow-sm md:p-5">
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={favoriteFilters.search}
                  onChange={(e) => setFavoriteFilters((f) => ({ ...f, search: e.target.value }))}
                  placeholder="מצא טיול..."
                  className="ti-input ps-10"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <select
                  value={favoriteFilters.region}
                  onChange={(e) =>
                    setFavoriteFilters((f) => ({ ...f, region: e.target.value as Region | "all" }))
                  }
                  className="ti-input"
                >
                  <option value="all">כל האזורים</option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>

                <select
                  value={favoriteFilters.duration}
                  onChange={(e) =>
                    setFavoriteFilters((f) => ({
                      ...f,
                      duration: e.target.value as FavoriteFilters["duration"],
                    }))
                  }
                  className="ti-input"
                >
                  <option value="all">כל משך הטיול</option>
                  <option value="short">עד 4 שעות</option>
                  <option value="medium">4–8 שעות</option>
                  <option value="long">מעל 8 שעות</option>
                </select>

                <select
                  value={favoriteFilters.sortDate}
                  onChange={(e) =>
                    setFavoriteFilters((f) => ({
                      ...f,
                      sortDate: e.target.value as FavoriteFilters["sortDate"],
                    }))
                  }
                  className="ti-input"
                >
                  <option value="newest">תאריך: חדש לישן</option>
                  <option value="oldest">תאריך: ישן לחדש</option>
                </select>

                <select
                  value={favoriteFilters.status}
                  onChange={(e) =>
                    setFavoriteFilters((f) => ({
                      ...f,
                      status: e.target.value as Status | "all",
                    }))
                  }
                  className="ti-input"
                >
                  <option value="all">כל הסטטוסים</option>
                  {(Object.keys(STATUS_LABELS) as Status[]).map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>

                <select
                  value={favoriteFilters.tag}
                  onChange={(e) => setFavoriteFilters((f) => ({ ...f, tag: e.target.value }))}
                  className="ti-input"
                >
                  <option value="">מצבים מיוחדים</option>
                  {favoriteTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {favorites.length === 0 ? (
              <MyTripsEmptyState
                title="עדיין לא שמרת טיולים למועדפים"
                description="גלשי בטיולים ולחצי על «שמור למועדפים» כדי לראות אותם כאן."
                showCreateButton={false}
              />
            ) : filteredFavorites.length === 0 ? (
              <MyTripsEmptyState
                title="לא נמצאו טיולים"
                description="נסי לשנות את מסנני החיפוש."
                showCreateButton={false}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredFavorites.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    showFavorite
                    isFavorite
                    favoriteLoading={busyTripId === trip.id}
                    onFavoriteToggle={() => handleRemoveFavorite(trip.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
