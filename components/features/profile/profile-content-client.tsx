"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight } from "lucide-react";
import type { EntityType, Place, Status, Trail, Trip } from "@/types";
import { UnderlineTabNav } from "@/components/features/profile/underline-tab-nav";
import { TripCard } from "@/components/features/trips/trip-card";
import { PlaceCard } from "@/components/features/places/place-card";
import { TrailCard } from "@/components/features/trails/trail-card";
import { CREATED_STATUS_TABS, MyTripCard } from "@/components/features/profile/my-trip-card";
import { MyPlaceCard, PLACE_TRAIL_STATUS_TABS } from "@/components/features/profile/my-place-card";
import { MyTrailCard } from "@/components/features/profile/my-trail-card";
import { MyTripsEmptyState } from "@/components/features/profile/my-trips-empty-state";
import { toast } from "@/components/ui/use-toast";
import { tripEditPath } from "@/lib/utils/content-path";
import { ClientPageLoading } from "@/components/layout/page-loading";
import { useAuthStore } from "@/hooks/use-stores";
import {
  getFavoritePlaces,
  getFavoriteTrails,
  getFavoriteTrips,
  toggleFavoriteEntity,
} from "@/lib/data/favorites";
import { deletePlace, getPlaces, resubmitPlaceForApproval } from "@/lib/data/places";
import { deleteTrail, getTrails, resubmitTrailForApproval } from "@/lib/data/trails";
import {
  deleteTrip,
  duplicateTrip,
  getTrips,
  submitTripForApproval,
} from "@/lib/data/trips";

type MainTab = "created" | "favorites";
type EntityTab = "trips" | "places" | "trails";

const ENTITY_TABS: { value: EntityTab; label: string }[] = [
  { value: "trips", label: "טיולים" },
  { value: "places", label: "מקומות" },
  { value: "trails", label: "מסלולים" },
];

function entityTabToType(tab: EntityTab): EntityType {
  if (tab === "trips") return "trip";
  if (tab === "places") return "place";
  return "trail";
}

export function ProfileContentClient() {
  const router = useRouter();
  const { role, userId } = useAuthStore();
  const [mainTab, setMainTab] = useState<MainTab>("created");
  const [entityTab, setEntityTab] = useState<EntityTab>("trips");
  const [statusTab, setStatusTab] = useState<Status>("draft");
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [myPlaces, setMyPlaces] = useState<Place[]>([]);
  const [myTrails, setMyTrails] = useState<Trail[]>([]);
  const [favTrips, setFavTrips] = useState<Trip[]>([]);
  const [favPlaces, setFavPlaces] = useState<Place[]>([]);
  const [favTrails, setFavTrails] = useState<Trail[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (role === "guest") {
      setLoading(false);
      return;
    }
    const [{ trips }, places, trails, ft, fp, fr] = await Promise.all([
      getTrips({ createdBy: userId }),
      getPlaces({ createdBy: userId }),
      getTrails({ createdBy: userId }),
      getFavoriteTrips(),
      getFavoritePlaces(),
      getFavoriteTrails(),
    ]);
    setMyTrips(trips);
    setMyPlaces(places);
    setMyTrails(trails);
    setFavTrips(ft);
    setFavPlaces(fp);
    setFavTrails(fr);
    setLoading(false);
  }, [role, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createdTotal = myTrips.length + myPlaces.length + myTrails.length;
  const favoritesTotal = favTrips.length + favPlaces.length + favTrails.length;

  const tripCounts = useMemo(
    () => ({
      draft: myTrips.filter((t) => t.status === "draft").length,
      pending: myTrips.filter((t) => t.status === "pending").length,
      approved: myTrips.filter((t) => t.status === "approved").length,
      rejected: myTrips.filter((t) => t.status === "rejected").length,
      removed: myTrips.filter((t) => t.status === "removed").length,
    }),
    [myTrips]
  );

  const placeCounts = useMemo(
    () => ({
      pending: myPlaces.filter((p) => p.status === "pending").length,
      approved: myPlaces.filter((p) => p.status === "approved").length,
      rejected: myPlaces.filter((p) => p.status === "rejected").length,
      removed: myPlaces.filter((p) => p.status === "removed").length,
    }),
    [myPlaces]
  );

  const trailCounts = useMemo(
    () => ({
      pending: myTrails.filter((t) => t.status === "pending").length,
      approved: myTrails.filter((t) => t.status === "approved").length,
      rejected: myTrails.filter((t) => t.status === "rejected").length,
      removed: myTrails.filter((t) => t.status === "removed").length,
    }),
    [myTrails]
  );

  const filteredTrips = myTrips.filter((t) => t.status === statusTab);
  const filteredPlaces = myPlaces.filter((p) => p.status === statusTab);
  const filteredTrails = myTrails.filter((t) => t.status === statusTab);

  function handleEntityChange(tab: EntityTab) {
    setEntityTab(tab);
    setStatusTab(tab === "trips" ? "draft" : "pending");
  }

  async function handleSubmitTrip(tripId: string) {
    setBusyId(tripId);
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
      setBusyId(null);
    }
  }

  async function handleSubmitPlace(placeId: string) {
    setBusyId(placeId);
    try {
      const result = await resubmitPlaceForApproval(placeId);
      if (!result) {
        toast({ title: "שליחה לאישור נכשלה", variant: "destructive" });
        return;
      }
      toast({ title: "המקום נשלח לאישור" });
      await loadData();
      setStatusTab("pending");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSubmitTrail(trailId: string) {
    setBusyId(trailId);
    try {
      const result = await resubmitTrailForApproval(trailId);
      if (!result) {
        toast({ title: "שליחה לאישור נכשלה", variant: "destructive" });
        return;
      }
      toast({ title: "המסלול נשלח לאישור" });
      await loadData();
      setStatusTab("pending");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteTrip(tripId: string) {
    setBusyId(tripId);
    try {
      const ok = await deleteTrip(tripId);
      if (!ok) {
        toast({ title: "מחיקת הטיול נכשלה", variant: "destructive" });
        return;
      }
      toast({ title: "הטיול נמחק" });
      await loadData();
    } catch (error) {
      toast({
        title: "מחיקת הטיול נכשלה",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDuplicateTrip(tripId: string) {
    setBusyId(tripId);
    try {
      const copy = await duplicateTrip(tripId);
      if (!copy) {
        toast({ title: "שכפול הטיול נכשל", variant: "destructive" });
        return;
      }
      toast({ title: "הטיול שוכפל כטיוטה" });
      router.push(tripEditPath(copy));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeletePlace(placeId: string) {
    setBusyId(placeId);
    try {
      const ok = await deletePlace(placeId);
      if (!ok) {
        toast({ title: "מחיקת המקום נכשלה", variant: "destructive" });
        return;
      }
      toast({ title: "המקום נמחק" });
      await loadData();
    } catch (error) {
      toast({
        title: "מחיקת המקום נכשלה",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteTrail(trailId: string) {
    setBusyId(trailId);
    try {
      const ok = await deleteTrail(trailId);
      if (!ok) {
        toast({ title: "מחיקת המסלול נכשלה", variant: "destructive" });
        return;
      }
      toast({ title: "המסלול נמחק" });
      await loadData();
    } catch (error) {
      toast({
        title: "מחיקת המסלול נכשלה",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemoveFavorite(entityTab: EntityTab, entityId: string) {
    setBusyId(entityId);
    try {
      await toggleFavoriteEntity(entityTabToType(entityTab), entityId);
      toast({ title: "הוסר מהמועדפים" });
      await loadData();
    } finally {
      setBusyId(null);
    }
  }

  const createCta = (() => {
    switch (entityTab) {
      case "trips":
        return { href: "/trips/create", label: "צור טיול חדש" };
      case "places":
        return { href: "/places/create", label: "הוסף מקום" };
      case "trails":
        return { href: "/trails/create", label: "הוסף מסלול" };
    }
  })();

  if (role === "guest") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-[#f5f6f8] to-[#eef0f4] px-4">
        <div className="max-w-md rounded border border-gray-100 bg-white p-10 text-center shadow-sm">
          <h1 className="mb-2 text-2xl font-light text-gray-900">התוכן שלי</h1>
          <p className="mb-6 text-sm text-gray-400">יש להתחבר כדי לראות תוכן ומועדפים</p>
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
    return <ClientPageLoading className="bg-white" />;
  }

  const statusTabs =
    entityTab === "trips"
      ? CREATED_STATUS_TABS.map(({ value, label }) => ({
          value,
          label,
          count: tripCounts[value],
        }))
      : PLACE_TRAIL_STATUS_TABS.map(({ value, label }) => ({
          value,
          label,
          count: entityTab === "places" ? placeCounts[value] : trailCounts[value],
        }));

  const entityCount =
    entityTab === "trips"
      ? myTrips.length
      : entityTab === "places"
        ? myPlaces.length
        : myTrails.length;

  return (
    <div dir="rtl" className="min-h-screen bg-white text-right">
      <header className="border-b border-border bg-white">
        <div className="ti-container py-8 md:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link
                href="/profile"
                className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
              >
                חזרה לאזור האישי
                <ArrowRight className="h-4 w-4" />
              </Link>
              <h1 className="ti-section-title text-foreground">התוכן שלי</h1>
              <p className="ti-section-subtitle mt-2 text-muted-foreground/80">
                טיולים, מקומות ומסלולים שיצרת ומועדפים.
              </p>
            </div>
            {mainTab === "created" && (
              <Link href={createCta.href} className="ti-btn-primary shrink-0 self-end sm:self-auto">
                <Plus className="h-4 w-4" />
                {createCta.label}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-white">
        <div className="ti-container pt-4 pb-0">
          <UnderlineTabNav
            className="border-0"
            tabs={[
              { value: "created", label: "יצרתי", count: createdTotal },
              { value: "favorites", label: "אהבתי", count: favoritesTotal },
            ]}
            value={mainTab}
            onChange={(v) => setMainTab(v as MainTab)}
          />
        </div>
      </div>

      <div className="border-b border-border bg-white">
        <div className="ti-container pt-3 pb-0">
          <UnderlineTabNav
            className="border-0"
            tabs={ENTITY_TABS.map(({ value, label }) => ({
              value,
              label,
              count:
                value === "trips"
                  ? myTrips.length
                  : value === "places"
                    ? myPlaces.length
                    : myTrails.length,
            }))}
            value={entityTab}
            onChange={(v) => handleEntityChange(v as EntityTab)}
          />
        </div>
      </div>

      {mainTab === "created" && (
        <div className="border-b border-border bg-white">
          <div className="ti-container pt-3 pb-0">
            <UnderlineTabNav
              className="border-0"
              tabs={statusTabs}
              value={statusTab}
              onChange={(v) => setStatusTab(v as Status)}
            />
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-[#f5f6f8] to-[#eef0f4]">
        <div className="ti-container py-8 md:py-10">
          {mainTab === "created" ? (
            entityCount === 0 ? (
              <MyTripsEmptyState
                title="עדיין לא יצרת תוכן בקטגוריה זו"
                description="התחילי ליצור ולשתף עם הקהילה."
              />
            ) : entityTab === "trips" ? (
              filteredTrips.length === 0 ? (
                <MyTripsEmptyState
                  title={`אין טיולים בקטגוריית "${CREATED_STATUS_TABS.find((t) => t.value === statusTab)?.label}"`}
                />
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredTrips.map((trip) => (
                    <MyTripCard
                      key={trip.id}
                      trip={trip}
                      busy={busyId === trip.id}
                      onSubmit={() => handleSubmitTrip(trip.id)}
                      onDelete={() => handleDeleteTrip(trip.id)}
                      onDuplicate={() => handleDuplicateTrip(trip.id)}
                    />
                  ))}
                </div>
              )
            ) : entityTab === "places" ? (
              filteredPlaces.length === 0 ? (
                <MyTripsEmptyState title="אין מקומות בקטגוריה זו" />
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPlaces.map((place) => (
                    <MyPlaceCard
                      key={place.id}
                      place={place}
                      busy={busyId === place.id}
                      onDelete={() => handleDeletePlace(place.id)}
                      onResubmit={() => handleSubmitPlace(place.id)}
                    />
                  ))}
                </div>
              )
            ) : filteredTrails.length === 0 ? (
              <MyTripsEmptyState title="אין מסלולים בקטגוריה זו" />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTrails.map((trail) => (
                  <MyTrailCard
                    key={trail.id}
                    trail={trail}
                    busy={busyId === trail.id}
                    onDelete={() => handleDeleteTrail(trail.id)}
                    onResubmit={() => handleSubmitTrail(trail.id)}
                  />
                ))}
              </div>
            )
          ) : entityTab === "trips" ? (
            favTrips.length === 0 ? (
              <MyTripsEmptyState
                title="עדיין לא שמרת טיולים למועדפים"
                showCreateButton={false}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    showFavorite
                    isFavorite
                    favoriteLoading={busyId === trip.id}
                    onFavoriteToggle={() => handleRemoveFavorite("trips", trip.id)}
                  />
                ))}
              </div>
            )
          ) : entityTab === "places" ? (
            favPlaces.length === 0 ? (
              <MyTripsEmptyState title="עדיין לא שמרת מקומות למועדפים" showCreateButton={false} />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    showFavorite
                    isFavorite
                    favoriteLoading={busyId === place.id}
                    onFavoriteToggle={() => handleRemoveFavorite("places", place.id)}
                  />
                ))}
              </div>
            )
          ) : favTrails.length === 0 ? (
            <MyTripsEmptyState title="עדיין לא שמרת מסלולים למועדפים" showCreateButton={false} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favTrails.map((trail) => (
                <TrailCard
                  key={trail.id}
                  trail={trail}
                  showFavorite
                  isFavorite
                  favoriteLoading={busyId === trail.id}
                  onFavoriteToggle={() => handleRemoveFavorite("trails", trail.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
