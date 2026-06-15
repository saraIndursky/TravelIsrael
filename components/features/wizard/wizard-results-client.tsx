"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WizardResultActions } from "@/components/features/wizard/wizard-result-actions";
import { WizardResultHero } from "@/components/features/wizard/wizard-result-hero";
import { WizardResultMatchPanel } from "@/components/features/wizard/wizard-result-match-panel";
import { WizardResultNav } from "@/components/features/wizard/wizard-result-nav";
import { TripDetailDescription } from "@/components/features/trips/detail/trip-detail-description";
import { TripDetailGallery } from "@/components/features/trips/detail/trip-detail-gallery";
import { TripDetailHighlights } from "@/components/features/trips/detail/trip-detail-highlights";
import { TripDetailItinerary } from "@/components/features/trips/detail/trip-detail-itinerary";
import { TripDetailMap } from "@/components/features/trips/detail/trip-detail-map";
import { TripDetailRating } from "@/components/features/trips/detail/trip-detail-rating";
import { TripDetailReport } from "@/components/features/trips/detail/trip-detail-report";
import { TripDetailReviews } from "@/components/features/trips/detail/trip-detail-reviews";
import { TripDetailStats } from "@/components/features/trips/detail/trip-detail-stats";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore, useWizardStore } from "@/hooks/use-stores";
import {
  addComment,
  getComments,
  getRatings,
  getUserComment,
  getUserRating,
  upsertRating,
} from "@/lib/data/social";
import { isFavorite, toggleFavorite } from "@/lib/data/favorites";
import { createReport } from "@/lib/data/reports";
import { getStore } from "@/lib/data/store";
import { addTripGalleryImage, getTripById, getTrips, incrementTripViews } from "@/lib/data/trips";
import { buildTripMapMarkers } from "@/lib/utils/trip-map";
import { computeTripSchedule } from "@/lib/utils/trip-schedule";
import { rankTripsByMatch } from "@/lib/utils/match-score";
import type { MatchResult } from "@/lib/utils/match-score";
import type { Comment, ReportType, TripWithStations } from "@/types";

const RESULTS_BATCH_SIZE = 5;

export function WizardResultsClient() {
  const prefs = useWizardStore();
  const { role } = useAuthStore();
  const canInteract = role !== "guest";

  const [allResults, setAllResults] = useState<MatchResult[]>([]);
  const [batchOffset, setBatchOffset] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trip, setTrip] = useState<TripWithStations | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [hasUserReview, setHasUserReview] = useState(false);
  const [loadingResults, setLoadingResults] = useState(true);
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  const store = getStore();

  const visibleResults = useMemo(
    () => allResults.slice(batchOffset, batchOffset + RESULTS_BATCH_SIZE),
    [allResults, batchOffset]
  );
  const hasMoreResults = batchOffset + RESULTS_BATCH_SIZE < allResults.length;
  const currentResult = visibleResults[currentIndex];

  useEffect(() => {
    let cancelled = false;
    setLoadingResults(true);

    getTrips({ status: "approved" }, "numberOfViews", "desc", 0, 100).then(({ trips }) => {
      if (cancelled) return;
      const ranked = rankTripsByMatch(trips, prefs);
      setAllResults(ranked);
      setBatchOffset(0);
      setCurrentIndex(0);
      setLoadingResults(false);
    });

    return () => {
      cancelled = true;
    };
  }, [prefs]);

  useEffect(() => {
    if (!currentResult) {
      setTrip(null);
      return;
    }

    let cancelled = false;
    const tripId = currentResult.trip.id;

    async function loadTrip() {
      setLoadingTrip(true);
      const fullTrip = await getTripById(tripId);
      if (cancelled) return;

      if (!fullTrip) {
        setTrip(null);
        setLoadingTrip(false);
        return;
      }

      setTrip(fullTrip);
      await incrementTripViews(tripId);
      setComments(await getComments("trip", tripId));
      setRatingsCount((await getRatings("trip", tripId)).length);
      setUserRating((await getUserRating("trip", tripId))?.score ?? 0);
      setFavorite(await isFavorite(tripId));
      setHasUserReview(!!(await getUserComment("trip", tripId)));
      setShowCommentForm(false);
      setCommentText("");
      setLoadingTrip(false);
    }

    loadTrip();

    return () => {
      cancelled = true;
    };
  }, [currentResult]);

  const totalTravelKm = useMemo(() => {
    if (!trip) return 0;
    return computeTripSchedule(trip.stations, store.places, store.trails).totalTravelKm;
  }, [trip, store.places, store.trails]);

  const mapMarkers = useMemo(() => {
    if (!trip) return [];
    return buildTripMapMarkers(trip.stations, store.places, store.trails);
  }, [trip, store.places, store.trails]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      return;
    }
    if (batchOffset > 0) {
      const prevOffset = Math.max(0, batchOffset - RESULTS_BATCH_SIZE);
      const prevBatch = allResults.slice(prevOffset, prevOffset + RESULTS_BATCH_SIZE);
      setBatchOffset(prevOffset);
      setCurrentIndex(prevBatch.length - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < visibleResults.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    if (hasMoreResults) {
      setBatchOffset((o) => o + RESULTS_BATCH_SIZE);
      setCurrentIndex(0);
    }
  };

  const handleToggleFavorite = async () => {
    if (!trip) return;
    if (!canInteract) {
      toast({ title: "יש להתחבר כדי לשמור טיול" });
      return;
    }
    setSavingFavorite(true);
    const next = await toggleFavorite(trip.id);
    setFavorite(next);
    const updated = await getTripById(trip.id);
    if (updated) setTrip(updated);
    toast({ title: next ? "הטיול נשמר למועדפים" : "הטיול הוסר מהמועדפים" });
    setSavingFavorite(false);
  };

  const handleRate = async (score: number) => {
    if (!trip) return;
    if (!canInteract) {
      toast({ title: "יש להתחבר כדי לדרג" });
      return;
    }
    const rating = await upsertRating("trip", trip.id, score);
    if (rating) {
      setUserRating(score);
      setRatingsCount((await getRatings("trip", trip.id)).length);
      const updated = await getTripById(trip.id);
      if (updated) setTrip(updated);
      toast({ title: "הדירוג נשמר" });
    }
  };

  const handleReport = async (reportType: ReportType, reason: string) => {
    if (!trip) return;
    const report = await createReport("trip", trip.id, reportType, reason);
    if (report) {
      toast({ title: "הדיווח נשלח — תודה!" });
    } else {
      toast({ title: "יש להתחבר כדי לדווח", variant: "destructive" });
    }
  };

  const handleAddGalleryImage = async (url: string) => {
    if (!trip) return;
    const updated = await addTripGalleryImage(trip.id, url);
    if (updated) {
      setTrip(updated);
      toast({ title: "התמונה נוספה לגלריה" });
    } else {
      toast({ title: "יש להתחבר כדי להוסיף תמונה", variant: "destructive" });
    }
  };

  const handleAddReview = () => {
    if (!canInteract) {
      toast({ title: "יש להתחבר כדי להוסיף ביקורת" });
      return;
    }
    if (hasUserReview) {
      toast({ title: "כבר הוספת ביקורת לטיול זה" });
      return;
    }
    setShowCommentForm(true);
  };

  if (loadingResults) {
    return (
      <div className="min-h-screen animate-pulse bg-[#f9fafb] pt-20 text-center text-[#6b7280]">
        מחשב התאמות...
      </div>
    );
  }

  if (allResults.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-4" dir="rtl">
        <p className="text-lg text-[#6b7280]">לא נמצאו טיולים מתאימים להעדפות שלך</p>
        <Link
          href="/wizard"
          className="rounded-sm bg-[#111827] px-6 py-3 text-sm font-medium text-white hover:bg-[#1f2937]"
        >
          חזרה לוויזארד
        </Link>
      </div>
    );
  }

  if (loadingTrip || !trip || !currentResult) {
    return (
      <div className="min-h-screen animate-pulse bg-[#f9fafb] pt-20 text-center text-[#6b7280]">
        טוען פרטי טיול...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <WizardResultHero
        trip={trip}
        matchScore={currentResult.score}
        isFavorite={favorite}
        onToggleFavorite={handleToggleFavorite}
      />

      <WizardResultNav
        currentIndex={currentIndex}
        batchSize={visibleResults.length}
        hasMore={hasMoreResults}
        canGoPrev={currentIndex > 0 || batchOffset > 0}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <TripDetailHighlights trip={trip} totalTravelKm={totalTravelKm} layout="stacked" />

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-3 lg:pt-4">
          <div className="space-y-6 lg:col-span-2">
            <TripDetailDescription description={trip.full_description} variant="compact" />
            <div className="hidden lg:block">
              <TripDetailMap markers={mapMarkers} variant="embedded" />
            </div>
          </div>
          <div className="hidden space-y-6 lg:sticky lg:top-24 lg:block lg:self-start">
            <WizardResultMatchPanel score={currentResult.score} explanation={currentResult.explanation} />
            <WizardResultActions
              tripId={trip.id}
              isFavorite={favorite}
              onSave={handleToggleFavorite}
              saving={savingFavorite}
            />
            <Link
              href={`/trips/${trip.id}`}
              className="block text-center text-sm font-medium text-[#111827] underline-offset-4 hover:underline"
            >
              צפייה בעמוד הטיול המלא
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <TripDetailReport onSubmit={handleReport} canReport={canInteract} />

          <TripDetailItinerary
            stations={trip.stations}
            places={store.places}
            trails={store.trails}
            mapMarkers={mapMarkers}
            mapPlacement="mobile-only"
          />

          <TripDetailGallery
            trip={trip}
            stations={trip.stations}
            places={store.places}
            trails={store.trails}
            canAddImage={canInteract}
            onAddImage={handleAddGalleryImage}
          />
        </div>

        <div className="mt-8 lg:hidden">
          <WizardResultMatchPanel score={currentResult.score} explanation={currentResult.explanation} />
        </div>

        <div className="mt-8 space-y-8">
          <TripDetailStats trip={trip} reviewsCount={comments.length} ratingsCount={ratingsCount} />

          <TripDetailRating
            avgRating={trip.avg_rating}
            userRating={userRating}
            onRate={handleRate}
            canRate={canInteract}
          />

          <TripDetailReviews
            comments={comments}
            users={store.users}
            onAddReview={handleAddReview}
            canAddReview={canInteract && !hasUserReview}
          />

          {showCommentForm && canInteract && !hasUserReview && (
            <form
              className="rounded-sm border border-[#e5e7eb] bg-[#f9fafb] p-6"
              onSubmit={async (e) => {
                e.preventDefault();
                const comment = await addComment("trip", trip.id, commentText);
                if (comment) {
                  setComments([...comments, comment]);
                  setCommentText("");
                  setShowCommentForm(false);
                  setHasUserReview(true);
                  toast({ title: "הביקורת נוספה" });
                } else {
                  toast({ title: "כבר הוספת ביקורת לטיול זה", variant: "destructive" });
                }
              }}
            >
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="כתבי את הביקורת שלך..."
                className="mb-4 min-h-[120px] w-full rounded-sm border border-[#d1d5db] bg-white p-4 text-sm focus:border-[#111827] focus:outline-none"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCommentForm(false)}
                  className="rounded-sm border border-[#e5e7eb] px-6 py-2.5 text-sm hover:bg-[#f3f4f6]"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="rounded-sm bg-[#111827] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"
                >
                  שלח ביקורת
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 pb-8 lg:hidden">
          <WizardResultActions
            tripId={trip.id}
            isFavorite={favorite}
            onSave={handleToggleFavorite}
            saving={savingFavorite}
          />
          <Link
            href={`/trips/${trip.id}`}
            className="mt-4 block text-center text-sm font-medium text-[#111827] underline-offset-4 hover:underline"
          >
            צפייה בעמוד הטיול המלא
          </Link>
        </div>
      </div>
    </div>
  );
}
