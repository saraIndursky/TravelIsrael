"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import type { Comment, EntityImage, ReportType, Trail, Trip, User } from "@/types";
import { getTrailById, resubmitTrailForApproval } from "@/lib/data/trails";
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
import { trailPath } from "@/lib/utils/content-path";
import { toast } from "@/components/ui/use-toast";
import { ClientPageLoading } from "@/components/layout/page-loading";
import { ContentRemovedBanner } from "@/components/features/content/content-removed-banner";
import { TripDetailDescription } from "@/components/features/trips/detail/trip-detail-description";
import { TripDetailReport } from "@/components/features/trips/detail/trip-detail-report";
import { TripDetailRating } from "@/components/features/trips/detail/trip-detail-rating";
import { TripDetailReviews } from "@/components/features/trips/detail/trip-detail-reviews";
import { TrailDetailHero } from "@/components/features/trails/detail/trail-detail-hero";
import { TrailDetailHighlights } from "@/components/features/trails/detail/trail-detail-highlights";
import { TrailDetailWaypoints } from "@/components/features/trails/detail/trail-detail-waypoints";
import { TrailDetailMapSection } from "@/components/features/trails/detail/trail-detail-map-section";
import { TrailDetailGallery } from "@/components/features/trails/detail/trail-detail-gallery";
import { TrailDetailSidebar } from "@/components/features/trails/detail/trail-detail-sidebar";
import { TrailDetailNature } from "@/components/features/trails/detail/trail-detail-nature";
import { PrintButton } from "@/components/features/shared/print-button";
import { TrailDetailActions } from "@/components/features/trails/detail/trail-detail-actions";
import { CreateAssistantPanel } from "@/components/features/assistant/create-assistant-panel";
import { TrailDetailRelatedTrips } from "@/components/features/trails/detail/trail-detail-related-trips";
import { getTrailGalleryImages } from "@/lib/utils/trail-detail-content";
import { addEntityGalleryImage, deleteEntityImage, getEntityImages } from "@/lib/data/images";
import type { GalleryImagePayload } from "@/components/features/content/add-gallery-image-dialog";

function computeAvgRating(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

export default function TrailDetailClient({ id }: { id: string }) {
  const { role, userId } = useAuthStore();
  const [trail, setTrail] = useState<Trail | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentUsers, setCommentUsers] = useState<User[]>([]);
  const [ratingsCount, setRatingsCount] = useState(0);
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
  useCanonicalContentPath(id, trail ? trailPath(trail) : null);

  useEffect(() => {
    async function load() {
      const t = await getTrailById(id);
      if (!t) {
        setLoading(false);
        return;
      }
      setTrail(t);
      setTrips(await getTripsContainingEntity("trail", t.id));
      const ratings = await getRatings("trail", t.id);
      setRatingsCount(ratings.length);
      setAvgRating(computeAvgRating(ratings.map((r) => r.score)));
      const existingRating = await getUserRating("trail", t.id);
      setUserRating(existingRating?.score ?? 0);
      const loadedComments = await getComments("trail", t.id);
      setComments(loadedComments);
      setCommentUsers(await getProfilesByIds(loadedComments.map((comment) => comment.user_id)));
      setHasUserReview(!!(await getUserComment("trail", t.id)));
      setIsSaved(await isFavoriteEntity("trail", t.id));
      setCommunityImages(await getEntityImages("trail", t.id));
      setLoading(false);
    }
    load();
  }, [id]);

  const tagsDisplay = useMemo(() => trail?.tags.join(" · ") ?? "", [trail?.tags]);

  const galleryImages = useMemo(
    () => (trail ? getTrailGalleryImages(trail) : []),
    [trail]
  );

  const showOwnerAssistant =
    trail &&
    role !== "guest" &&
    trail.created_by === userId &&
    (trail.status === "pending" || trail.status === "rejected");

  if (loading) {
    return <ClientPageLoading />;
  }
  if (!trail) notFound();
  const entityId = trail.id;

  const handleToggleSaved = async () => {
    if (!canInteract) {
      toast({ title: "יש להתחבר כדי לשמור מסלול" });
      return;
    }
    const next = await toggleFavoriteEntity("trail", entityId);
    setIsSaved(next);
    const refreshed = await getTrailById(entityId);
    if (!refreshed) {
      toast({ title: "המסלול הוסר מהמועדפים — אין גישה לתוכן שהוסר" });
      notFound();
      return;
    }
    setTrail(refreshed);
    toast({ title: next ? "המסלול נשמר למועדפים" : "המסלול הוסר מהמועדפים" });
  };

  const handleResubmit = async () => {
    setResubmitting(true);
    const result = await resubmitTrailForApproval(entityId);
    setResubmitting(false);
    if (!result) {
      toast({ title: "שליחה לאישור נכשלה", variant: "destructive" });
      return;
    }
    const refreshed = await getTrailById(entityId);
    if (refreshed) setTrail(refreshed);
    toast({ title: "המסלול נשלח לאישור" });
  };

  const handleRate = async (score: number) => {
    if (!canInteract) {
      toast({ title: "יש להתחבר כדי לדרג" });
      return;
    }
    const rating = await upsertRating("trail", entityId, score);
    if (rating) {
      setUserRating(score);
      const ratings = await getRatings("trail", entityId);
      setRatingsCount(ratings.length);
      setAvgRating(computeAvgRating(ratings.map((r) => r.score)));
      toast({ title: "הדירוג נשמר" });
    }
  };

  const handleReport = async (reportType: ReportType, reason: string) => {
    const report = await createReport("trail", entityId, reportType, reason);
    if (report) {
      toast({ title: "הדיווח נשלח — תודה!" });
    } else {
      toast({ title: "יש להתחבר כדי לדווח", variant: "destructive" });
    }
  };

  const handleAddGalleryImage = async (payload: GalleryImagePayload) => {
    const added = await addEntityGalleryImage("trail", entityId, payload);
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
      toast({ title: "כבר הוספת ביקורת למסלול זה" });
      return;
    }
    setShowCommentForm(true);
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <TrailDetailHero
        trail={trail}
        avgRating={avgRating}
        reviewsCount={comments.length}
        isSaved={isSaved}
        onToggleSaved={handleToggleSaved}
      />
      {trail.status === "removed" && (
        <ContentRemovedBanner
          removalReason={trail.removal_reason}
          isOwner={Boolean(userId && trail.created_by === userId)}
          favoriterNote={Boolean(userId && trail.created_by !== userId && isSaved)}
          onResubmit={userId && trail.created_by === userId ? handleResubmit : undefined}
          resubmitting={resubmitting}
        />
      )}
      <TrailDetailHighlights trail={trail} />

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 md:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            <div className="flex justify-end print:hidden">
              <PrintButton />
            </div>
            <TripDetailDescription
              description={trail.full_description}
              title="על המסלול"
              variant="compact"
              truncateAt={200}
            />
            {tagsDisplay && (
              <p className="text-sm text-[#6b7280]">
                תגיות: <span className="text-[#111827]">{tagsDisplay}</span>
              </p>
            )}
            <div className="print:hidden">
              <TripDetailReport onSubmit={handleReport} canReport={canInteract} />
            </div>
            <TrailDetailWaypoints trail={trail} />
            <TrailDetailMapSection trail={trail} />
            <div className="print:hidden">
              <TrailDetailGallery
                images={galleryImages}
                communityImages={communityImages}
                currentUserId={userId}
                canAddImage={canInteract}
                onAddImage={handleAddGalleryImage}
                onDeleteImage={handleDeleteGalleryImage}
              />
            </div>
            <TrailDetailNature trail={trail} />
          </div>
          <TrailDetailSidebar trail={trail} />
        </div>
      </div>

      <div className="print:hidden">
        <TrailDetailRelatedTrips trips={trips} />
      </div>

      <div className="py-8 print:hidden">
        <TripDetailRating
          avgRating={avgRating}
          userRating={userRating}
          onRate={handleRate}
          canRate={canInteract}
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
              const comment = await addComment("trail", entityId, commentText);
              if (comment) {
                setComments([...comments, comment]);
                setCommentText("");
                setShowCommentForm(false);
                setHasUserReview(true);
                toast({ title: "הביקורת נוספה" });
              } else {
                toast({ title: "כבר הוספת ביקורת למסלול זה", variant: "destructive" });
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
        <TrailDetailActions trail={trail} />
      </div>

      {showOwnerAssistant && (
        <CreateAssistantPanel
          entity="trail"
          context="detail"
          copyOnly
          getSnapshot={() => ({ ...trail } as Record<string, unknown>)}
        />
      )}
    </div>
  );
}
