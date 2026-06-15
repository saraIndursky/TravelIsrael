"use client";



import { useEffect, useMemo, useState } from "react";

import { notFound, useRouter } from "next/navigation";

import type { TripWithStations } from "@/types";

import { TripDetailHero } from "@/components/features/trips/detail/trip-detail-hero";

import { TripDetailHighlights } from "@/components/features/trips/detail/trip-detail-highlights";

import { TripDetailDescription } from "@/components/features/trips/detail/trip-detail-description";

import { TripDetailItinerary } from "@/components/features/trips/detail/trip-detail-itinerary";

import { TripDetailGallery } from "@/components/features/trips/detail/trip-detail-gallery";

import { TripDetailReviews } from "@/components/features/trips/detail/trip-detail-reviews";

import { TripDetailStats } from "@/components/features/trips/detail/trip-detail-stats";

import { TripDetailRating } from "@/components/features/trips/detail/trip-detail-rating";

import { TripDetailReport } from "@/components/features/trips/detail/trip-detail-report";

import { TripDetailActions, type TripDetailActionsMode } from "@/components/features/trips/detail/trip-detail-actions";

import {

  addTripGalleryImage,

  duplicateTrip,

  getTripById,

  incrementTripViews,

  updateTrip,
} from "@/lib/data/trips";

import {

  addComment,

  getComments,

  getRatings,

  getUserComment,

  getUserRating,

  upsertRating,

} from "@/lib/data/social";

import { createReport } from "@/lib/data/reports";

import { isFavorite, toggleFavorite } from "@/lib/data/favorites";

import { getStore } from "@/lib/data/store";

import { computeTripSchedule } from "@/lib/utils/trip-schedule";

import { buildTripMapMarkers } from "@/lib/utils/trip-map";

import { useAuthStore } from "@/hooks/use-stores";

import { toast } from "@/components/ui/use-toast";

import type { Comment, ReportType } from "@/types";



export default function TripDetailClient({ id }: { id: string }) {

  const router = useRouter();

  const { role, userId } = useAuthStore();

  const [trip, setTrip] = useState<TripWithStations | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);

  const [ratingsCount, setRatingsCount] = useState(0);

  const [userRating, setUserRating] = useState(0);

  const [favorite, setFavorite] = useState(false);

  const [commentText, setCommentText] = useState("");

  const [showCommentForm, setShowCommentForm] = useState(false);

  const [loading, setLoading] = useState(true);

  const [savingFavorite, setSavingFavorite] = useState(false);

  const [duplicating, setDuplicating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasUserReview, setHasUserReview] = useState(false);



  const canInteract = role !== "guest";



  useEffect(() => {

    async function load() {

      const t = await getTripById(id);

      if (!t) {

        setLoading(false);

        return;

      }

      setTrip(t);

      await incrementTripViews(id);

      setComments(await getComments("trip", id));

      setRatingsCount((await getRatings("trip", id)).length);

      const existingRating = await getUserRating("trip", id);

      setUserRating(existingRating?.score ?? 0);

      setFavorite(await isFavorite(id));
      setHasUserReview(!!(await getUserComment("trip", id)));
      setLoading(false);

    }

    load();

  }, [id]);



  const store = getStore();



  const totalTravelKm = useMemo(() => {

    if (!trip) return 0;

    return computeTripSchedule(trip.stations, store.places, store.trails).totalTravelKm;

  }, [trip, store.places, store.trails]);



  const mapMarkers = useMemo(() => {

    if (!trip) return [];

    return buildTripMapMarkers(trip.stations, store.places, store.trails);

  }, [trip, store.places, store.trails]);



  if (loading) {

    return <div className="min-h-screen animate-pulse bg-[#f9fafb] pt-20">טוען...</div>;

  }

  if (!trip) notFound();

  const isOwner = trip.created_by === userId;
  const actionsMode: TripDetailActionsMode =
    isOwner && trip.status === "draft"
      ? "owner-draft"
      : isOwner && trip.status === "rejected"
        ? "owner-rejected"
        : "default";

  const handleEdit = () => router.push(`/trips/${id}/edit`);

  const handleSubmitForApproval = async () => {
    setSubmitting(true);
    const result = await updateTrip(id, { status: "pending" });
    setSubmitting(false);
    if (result) {
      setTrip(result);
      toast({ title: "הטיול נשלח לאישור" });
    } else {
      toast({ title: "שגיאה בשליחה לאישור", variant: "destructive" });
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



  const handleToggleFavorite = async () => {

    if (!canInteract) {

      toast({ title: "יש להתחבר כדי לשמור טיול" });

      return;

    }

    setSavingFavorite(true);

    const next = await toggleFavorite(id);

    setFavorite(next);

    const updated = await getTripById(id);

    if (updated) setTrip(updated);

    toast({ title: next ? "הטיול נשמר למועדפים" : "הטיול הוסר מהמועדפים" });

    setSavingFavorite(false);

  };



  const handleDuplicate = async () => {

    if (!canInteract) {

      toast({ title: "יש להתחבר כדי לשכפל טיול" });

      return;

    }

    setDuplicating(true);

    const copy = await duplicateTrip(id);

    setDuplicating(false);

    if (copy) {

      toast({ title: "הטיול שוכפל — ניתן לערוך אותו" });

      router.push(`/trips/${copy.id}/edit`);

    } else {

      toast({ title: "שגיאה בשכפול הטיול", variant: "destructive" });

    }

  };



  const handleRate = async (score: number) => {

    if (!canInteract) {

      toast({ title: "יש להתחבר כדי לדרג" });

      return;

    }

    const rating = await upsertRating("trip", id, score);

    if (rating) {

      setUserRating(score);

      setRatingsCount((await getRatings("trip", id)).length);

      const updated = await getTripById(id);

      if (updated) setTrip(updated);

      toast({ title: "הדירוג נשמר" });

    }

  };



  const handleReport = async (reportType: ReportType, reason: string) => {
    const report = await createReport("trip", id, reportType, reason);

    if (report) {

      toast({ title: "הדיווח נשלח — תודה!" });

    } else {

      toast({ title: "יש להתחבר כדי לדווח", variant: "destructive" });

    }

  };



  const handleAddGalleryImage = async (url: string) => {

    const updated = await addTripGalleryImage(id, url);

    if (updated) {

      setTrip(updated);

      toast({ title: "התמונה נוספה לגלריה" });

    } else {

      toast({ title: "יש להתחבר כדי להוסיף תמונה", variant: "destructive" });

    }

  };



  return (

    <div className="min-h-screen bg-white" dir="rtl">

      <TripDetailHero

        trip={trip}

        isFavorite={favorite}

        onToggleFavorite={handleToggleFavorite}

      />

      <TripDetailHighlights trip={trip} totalTravelKm={totalTravelKm} />

      <TripDetailDescription description={trip.full_description} />

      <div className="mx-auto mb-8 max-w-7xl px-4 md:px-6">
        <TripDetailReport onSubmit={handleReport} canReport={canInteract} />
      </div>

      <TripDetailItinerary

        stations={trip.stations}

        places={store.places}

        trails={store.trails}

        mapMarkers={mapMarkers}

      />

      <TripDetailGallery

        trip={trip}

        stations={trip.stations}

        places={store.places}

        trails={store.trails}

        canAddImage={canInteract}

        onAddImage={handleAddGalleryImage}

      />

      <div className="py-8">
        <TripDetailStats
          trip={trip}
          reviewsCount={comments.length}
          ratingsCount={ratingsCount}
        />
      </div>

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

        <div className="mx-auto mb-12 max-w-7xl px-4 md:px-6">

          <form

            className="rounded-sm border border-[#e5e7eb] bg-[#f9fafb] p-6"

            onSubmit={async (e) => {

              e.preventDefault();

              const comment = await addComment("trip", id, commentText);
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

                type="submit"

                className="rounded-sm bg-[#111827] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"

              >

                שלח ביקורת

              </button>

              <button

                type="button"

                onClick={() => setShowCommentForm(false)}

                className="rounded-sm border border-[#e5e7eb] px-6 py-2.5 text-sm hover:bg-[#f3f4f6]"

              >

                ביטול

              </button>

            </div>

          </form>

        </div>

      )}



      <TripDetailActions
        mode={actionsMode}
        isFavorite={favorite}
        onSave={handleToggleFavorite}
        onDuplicate={handleDuplicate}
        onEdit={handleEdit}
        onSubmitForApproval={handleSubmitForApproval}
        saving={savingFavorite}
        duplicating={duplicating}
        submitting={submitting}
      />

    </div>

  );

}

