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

import { TripDetailActions } from "@/components/features/trips/detail/trip-detail-actions";

import {

  duplicateTrip,

  getTripById,

  incrementTripViews,

  submitTripForApproval,
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
import { addEntityGalleryImage, deleteEntityImage, getEntityImages } from "@/lib/data/images";
import type { GalleryImagePayload } from "@/components/features/content/add-gallery-image-dialog";
import { getProfilesByIds } from "@/lib/data/auth";
import { usePlacesTrailsCatalog } from "@/hooks/use-catalog";

import { computeTripSchedule } from "@/lib/utils/trip-schedule";

import { buildTripMapMarkers } from "@/lib/utils/trip-map";
import { shareTrip } from "@/lib/utils/share";
import { tripEditPath, tripPath } from "@/lib/utils/content-path";
import { useCanonicalContentPath } from "@/hooks/use-canonical-content-path";

import { useAuthStore } from "@/hooks/use-stores";

import { ClientPageLoading } from "@/components/layout/page-loading";
import { ContentRemovedBanner } from "@/components/features/content/content-removed-banner";
import { toast } from "@/components/ui/use-toast";

import type { Comment, EntityImage, ReportType, User } from "@/types";



export default function TripDetailClient({ id }: { id: string }) {

  const router = useRouter();

  const { role, userId } = useAuthStore();
  const { places, trails } = usePlacesTrailsCatalog();

  const [trip, setTrip] = useState<TripWithStations | null>(null);
  const [commentUsers, setCommentUsers] = useState<User[]>([]);

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
  const [communityImages, setCommunityImages] = useState<EntityImage[]>([]);



  const canInteract = role !== "guest";

  useCanonicalContentPath(id, trip ? tripPath(trip) : null);

  useEffect(() => {

    async function load() {

      const t = await getTripById(id);

      if (!t) {

        setLoading(false);

        return;

      }

      setTrip(t);

      await incrementTripViews(t.id);

      const loadedComments = await getComments("trip", t.id);
      setComments(loadedComments);
      setCommentUsers(await getProfilesByIds(loadedComments.map((comment) => comment.user_id)));

      setRatingsCount((await getRatings("trip", t.id)).length);

      const existingRating = await getUserRating("trip", t.id);

      setUserRating(existingRating?.score ?? 0);

      setFavorite(await isFavorite(t.id));
      setHasUserReview(!!(await getUserComment("trip", t.id)));
      setCommunityImages(await getEntityImages("trip", t.id));
      setLoading(false);

    }

    load();

  }, [id]);

  const totalTravelKm = useMemo(() => {

    if (!trip) return 0;

    return computeTripSchedule(trip.stations, places, trails).totalTravelKm;
  }, [trip, places, trails]);



  const mapMarkers = useMemo(() => {

    if (!trip) return [];

    return buildTripMapMarkers(trip.stations, places, trails);
  }, [trip, places, trails]);



  if (loading) {
    return <ClientPageLoading />;
  }

  if (!trip) notFound();

  const entityId = trip.id;

  const handleSubmitForApproval = async () => {
    setSubmitting(true);
    const result = await submitTripForApproval(entityId);
    setSubmitting(false);
    if (result) {
      const refreshed = await getTripById(entityId);
      if (refreshed) setTrip(refreshed);
      toast({ title: "הטיול נשליחה לאישור" });
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

    const next = await toggleFavorite(entityId);

    setFavorite(next);

    const updated = await getTripById(entityId);

    if (!updated) {
      setSavingFavorite(false);
      toast({ title: "הטיול הוסר מהמועדפים — אין גישה לתוכן שהוסר" });
      notFound();
      return;
    }

    setTrip(updated);

    toast({ title: next ? "הטיול נשמר למועדפים" : "הטיול הוסר מהמועדפים" });

    setSavingFavorite(false);

  };



  const handleDuplicate = async () => {

    if (!canInteract) {

      toast({ title: "יש להתחבר כדי לשכפל טיול" });

      return;

    }

    setDuplicating(true);

    const copy = await duplicateTrip(entityId);

    setDuplicating(false);

    if (copy) {

      toast({ title: "הטיול שוכפל — ניתן לערוך אותו" });

      router.push(tripEditPath(copy));

    } else {

      toast({ title: "שגיאה בשכפול הטיול", variant: "destructive" });

    }

  };



  const handleRate = async (score: number) => {

    if (!canInteract) {

      toast({ title: "יש להתחבר כדי לדרג" });

      return;

    }

    const rating = await upsertRating("trip", entityId, score);

    if (rating) {

      setUserRating(score);

      setRatingsCount((await getRatings("trip", entityId)).length);

      const updated = await getTripById(entityId);

      if (updated) setTrip(updated);

      toast({ title: "הדירוג נשמר" });

    }

  };



  const handleReport = async (reportType: ReportType, reason: string) => {
    const report = await createReport("trip", entityId, reportType, reason);

    if (report) {

      toast({ title: "הדיווח נשלח — תודה!" });

    } else {

      toast({ title: "יש להתחבר כדי לדווח", variant: "destructive" });

    }

  };



  const handleAddGalleryImage = async (payload: GalleryImagePayload) => {
    const added = await addEntityGalleryImage("trip", entityId, payload);
    if (added) {
      setCommunityImages((prev) => [...prev, added]);
      toast({ title: "התמונה נוספה לגלריה" });
    } else {
      throw new Error("יש להתחבר כדי להוסיף תמונה");
    }
  };

  const handleDeleteGalleryImage = async (imageId: string) => {
    const ok = await deleteEntityImage(imageId);
    if (!ok) {
      toast({ title: "מחיקת התמונה נכשלה", variant: "destructive" });
      throw new Error("מחיקת התמונה נכשלה");
    }
    setCommunityImages((prev) => prev.filter((image) => image.id !== imageId));
    toast({ title: "התמונה נמחקה" });
  };

  const handleShare = async () => {
    try {
      const result = await shareTrip(trip);
      toast({
        title: result === "shared" ? "הטיול שותף" : "הקישור הועתק ללוח",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      toast({
        title: error instanceof Error ? error.message : "שגיאה בשיתוף",
        variant: "destructive",
      });
    }
  };

  return (

    <div className="min-h-screen bg-white" dir="rtl">

      <TripDetailHero
        trip={trip}
        isFavorite={favorite}
        onToggleFavorite={handleToggleFavorite}
        canShare={trip.status === "approved"}
        onShare={handleShare}
      />

      {trip.status === "removed" && (
        <ContentRemovedBanner
          removalReason={trip.removal_reason}
          isOwner={Boolean(userId && trip.created_by === userId)}
          favoriterNote={Boolean(userId && trip.created_by !== userId && favorite)}
          onResubmit={userId && trip.created_by === userId ? handleSubmitForApproval : undefined}
          resubmitting={submitting}
        />
      )}

      <TripDetailHighlights trip={trip} totalTravelKm={totalTravelKm} />

      <TripDetailDescription description={trip.full_description} />

      <div className="mx-auto mb-8 max-w-7xl px-4 md:px-6">
        <TripDetailReport onSubmit={handleReport} canReport={canInteract} />
      </div>

      <TripDetailItinerary
        trip={trip}
        stations={trip.stations}
        places={places}
        trails={trails}
        mapMarkers={mapMarkers}
      />

      <TripDetailGallery

        trip={trip}

        stations={trip.stations}

        places={places}

        trails={trails}
        communityImages={communityImages}
        currentUserId={userId}
        canAddImage={canInteract}
        onAddImage={handleAddGalleryImage}
        onDeleteImage={handleDeleteGalleryImage}

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
        users={commentUsers}
        onAddReview={handleAddReview}
        canAddReview={canInteract && !hasUserReview}
      />

      {showCommentForm && canInteract && !hasUserReview && (

        <div className="mx-auto mb-12 max-w-7xl px-4 md:px-6">

          <form

            className="rounded-sm border border-[#e5e7eb] bg-[#f9fafb] p-6"

            onSubmit={async (e) => {

              e.preventDefault();

              const comment = await addComment("trip", entityId, commentText);
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

              placeholder="כתבו את הביקורת שלכם..."

              className="mb-4 min-h-[120px] w-full rounded-sm border border-[#d1d5db] bg-white p-4 text-sm focus:border-[#111827] focus:outline-none"

              required

            />

            <div className="flex gap-3">

              <button

                type="submit"

                className="rounded-sm bg-[#111827] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"

              >

                שליחת ביקורת

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
        trip={trip}
        isFavorite={favorite}
        onSave={handleToggleFavorite}
        onDuplicate={handleDuplicate}
        onSubmitForApproval={handleSubmitForApproval}
        saving={savingFavorite}
        duplicating={duplicating}
        submitting={submitting}
      />

    </div>

  );

}

