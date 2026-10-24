"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import type { Comment, EntityImage, Place, ReportType, Trip, User } from "@/types";
import { getPlaceById, resubmitPlaceForApproval } from "@/lib/data/places";
import { getTripsContainingEntity } from "@/lib/data/trips";
import {
  addComment,
  getComments,
  getRatings,
  getUserComment,
  getUserRating,
  upsertRating,
} from "@/lib/data/social";
import { createReport } from "@/lib/data/reports";
import { isFavoriteEntity, toggleFavoriteEntity } from "@/lib/data/favorites";
import { getProfilesByIds } from "@/lib/data/auth";
import { useAuthStore } from "@/hooks/use-stores";
import { useCanonicalContentPath } from "@/hooks/use-canonical-content-path";
import { useSessionReady } from "@/hooks/use-session-ready";
import { placePath } from "@/lib/utils/content-path";
import { toast } from "@/components/ui/use-toast";
import { ClientPageLoading } from "@/components/layout/page-loading";
import { ContentRemovedBanner } from "@/components/features/content/content-removed-banner";
import { getPlaceGalleryImages } from "@/lib/utils/place-detail-content";
import { addEntityGalleryImage, deleteEntityImage, getEntityImages } from "@/lib/data/images";
import type { GalleryImagePayload } from "@/components/features/content/add-gallery-image-dialog";
import { PlaceDetailHero } from "@/components/features/places/detail/place-detail-hero";
import { PlaceDetailHighlights } from "@/components/features/places/detail/place-detail-highlights";
import { PlaceDetailGallery } from "@/components/features/places/detail/place-detail-gallery";
import { PlaceDetailSidebar } from "@/components/features/places/detail/place-detail-sidebar";
import { PlaceDetailMapSection } from "@/components/features/places/detail/place-detail-map-section";
import { PrintButton } from "@/components/features/shared/print-button";
import { PlaceDetailActions } from "@/components/features/places/detail/place-detail-actions";
import { CreateAssistantPanel } from "@/components/features/assistant/create-assistant-panel";
import { PlaceDetailRelatedTrips } from "@/components/features/places/detail/place-detail-related-trips";
import { TripDetailDescription } from "@/components/features/trips/detail/trip-detail-description";
import { TripDetailReport } from "@/components/features/trips/detail/trip-detail-report";
import { TripDetailRating } from "@/components/features/trips/detail/trip-detail-rating";
import { TripDetailReviews } from "@/components/features/trips/detail/trip-detail-reviews";

function computeAvgRating(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

export default function PlaceDetailClient({ id }: { id: string }) {
  const { role, userId } = useAuthStore();
  const [place, setPlace] = useState<Place | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentUsers, setCommentUsers] = useState<User[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasUserReview, setHasUserReview] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [communityImages, setCommunityImages] = useState<EntityImage[]>([]);

  const canInteract = role !== "guest";
  const { ready: sessionReady } = useSessionReady();
  useCanonicalContentPath(id, place ? placePath(place) : null);

  useEffect(() => {
    if (!sessionReady) return;
    let cancelled = false;

    async function load() {
      const p = await getPlaceById(id);
      if (cancelled) return;
      if (!p) {
        setLoading(false);
        return;
      }
      setPlace(p);
      setLoading(false);

      const [relatedTrips, ratings, existingRating, loadedComments, userComment, saved, images] =
        await Promise.all([
          getTripsContainingEntity("place", p.id),
          getRatings("place", p.id),
          getUserRating("place", p.id),
          getComments("place", p.id),
          getUserComment("place", p.id),
          isFavoriteEntity("place", p.id),
          getEntityImages("place", p.id),
        ]);
      if (cancelled) return;

      setTrips(relatedTrips);
      setAvgRating(computeAvgRating(ratings.map((r) => r.score)));
      setUserRating(existingRating?.score ?? 0);
      setComments(loadedComments);
      setHasUserReview(Boolean(userComment));
      setIsSaved(saved);
      setCommunityImages(images);
      const authors = await getProfilesByIds(loadedComments.map((comment) => comment.user_id));
      if (!cancelled) setCommentUsers(authors);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, sessionReady]);

  const galleryImages = useMemo(
    () => (place ? getPlaceGalleryImages(place) : []),
    [place]
  );

  const tagsDisplay = useMemo(() => place?.tags.join(" · ") ?? "", [place?.tags]);

  const showOwnerAssistant =
    place &&
    role !== "guest" &&
    place.created_by === userId &&
    (place.status === "pending" || place.status === "rejected");

  if (loading) {
    return <ClientPageLoading />;
  }
  if (!place) notFound();
  const entityId = place.id;

  const handleToggleSaved = async () => {
    if (!canInteract) {
      toast({ title: "יש להתחבר כדי לשמור מקום" });
      return;
    }
    const next = await toggleFavoriteEntity("place", entityId);
    setIsSaved(next);
    const refreshed = await getPlaceById(entityId);
    if (!refreshed) {
      toast({ title: "המקום הוסר מהמועדפים — אין גישה לתוכן שהוסר" });
      notFound();
      return;
    }
    setPlace(refreshed);
    toast({ title: next ? "המקום נשמר למועדפים" : "המקום הוסר מהמועדפים" });
  };

  const handleResubmit = async () => {
    setResubmitting(true);
    const result = await resubmitPlaceForApproval(entityId);
    setResubmitting(false);
    if (!result) {
      toast({ title: "שליחה לאישור נכשלה", variant: "destructive" });
      return;
    }
    const refreshed = await getPlaceById(entityId);
    if (refreshed) setPlace(refreshed);
    toast({ title: "המקום נשלח לאישור" });
  };

  const handleRate = async (score: number) => {
    if (!canInteract) {
      toast({ title: "יש להתחבר כדי לדרג" });
      return;
    }
    const rating = await upsertRating("place", entityId, score);
    if (rating) {
      setUserRating(score);
      const ratings = await getRatings("place", entityId);
      setAvgRating(computeAvgRating(ratings.map((r) => r.score)));
      toast({ title: "הדירוג נשמר" });
    }
  };

  const handleReport = async (reportType: ReportType, reason: string) => {
    const report = await createReport("place", entityId, reportType, reason);
    if (report) {
      toast({ title: "הדיווח נשלח — תודה!" });
    } else {
      toast({ title: "יש להתחבר כדי לדווח", variant: "destructive" });
    }
  };

  const handleAddGalleryImage = async (payload: GalleryImagePayload) => {
    const added = await addEntityGalleryImage("place", entityId, payload);
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

  const handleAddReview = () => {
    if (!canInteract) {
      toast({ title: "יש להתחבר כדי להוסיף ביקורת" });
      return;
    }
    if (hasUserReview) {
      toast({ title: "כבר הוספת ביקורת למקום זה" });
      return;
    }
    setShowCommentForm(true);
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <PlaceDetailHero
        place={place}
        avgRating={avgRating}
        reviewsCount={comments.length}
        isSaved={isSaved}
        onToggleSaved={handleToggleSaved}
      />
      {place.status === "removed" && (
        <ContentRemovedBanner
          removalReason={place.removal_reason}
          isOwner={Boolean(userId && place.created_by === userId)}
          favoriterNote={Boolean(userId && place.created_by !== userId && isSaved)}
          onResubmit={userId && place.created_by === userId ? handleResubmit : undefined}
          resubmitting={resubmitting}
        />
      )}
      <PlaceDetailHighlights place={place} avgRating={avgRating} />

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 md:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            <TripDetailDescription
              description={place.full_description}
              title="על המקום"
              variant="compact"
              truncateAt={300}
            />
            {tagsDisplay && (
              <p className="text-sm text-[#6b7280]">
                תגיות: <span className="text-[#111827]">{tagsDisplay}</span>
              </p>
            )}
            <div className="print:hidden">
              <TripDetailReport onSubmit={handleReport} canReport={canInteract} />
            </div>
            <PlaceDetailMapSection place={place} headerAction={<PrintButton />} />
            <div className="print:hidden">
              <PlaceDetailGallery
                images={galleryImages}
                communityImages={communityImages}
                currentUserId={userId}
                canAddImage={canInteract}
                onAddImage={handleAddGalleryImage}
                onDeleteImage={handleDeleteGalleryImage}
              />
            </div>
          </div>
          <PlaceDetailSidebar place={place} />
        </div>
      </div>

      <div className="print:hidden">
        <PlaceDetailRelatedTrips trips={trips} />
      </div>

      <div className="py-8 print:hidden">
        <TripDetailRating
          avgRating={avgRating}
          userRating={userRating}
          onRate={handleRate}
          canRate={canInteract}
          title="דירוג המקום"
        />
      </div>

      <div className="print:hidden">
      <TripDetailReviews
        comments={comments}
        currentUserId={userId}
        onReviewUpdated={(updated) => setComments(comments.map((item) => (item.id === updated.id ? updated : item)))}
        onReviewDeleted={(id) => {
          setComments(comments.filter((item) => item.id !== id));
          setHasUserReview(false);
        }}
        users={commentUsers}
        onAddReview={handleAddReview}
        canAddReview={canInteract && !hasUserReview}
      />
      </div>

      {showCommentForm && canInteract && !hasUserReview && (
        <div className="mx-auto mb-12 max-w-7xl px-4 md:px-6 print:hidden">
          <form
            className="rounded-sm border border-[#e5e7eb] bg-[#f9fafb] p-6"
            onSubmit={async (e) => {
              e.preventDefault();
              const comment = await addComment("place", entityId, commentText);
              if (comment) {
                setComments([...comments, comment]);
                setCommentText("");
                setShowCommentForm(false);
                setHasUserReview(true);
                toast({ title: "הביקורת נוספה" });
              } else {
                toast({ title: "כבר הוספת ביקורת למקום זה", variant: "destructive" });
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

      <div className="print:hidden">
        <PlaceDetailActions place={place} />
      </div>

      {showOwnerAssistant && (
        <CreateAssistantPanel
          entity="place"
          context="detail"
          copyOnly
          getSnapshot={() => ({ ...place } as Record<string, unknown>)}
        />
      )}
    </div>
  );
}
