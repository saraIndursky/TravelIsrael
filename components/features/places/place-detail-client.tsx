"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import type { Comment, Place, Trip } from "@/types";
import { getPlaceById } from "@/lib/data/places";
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
import { getStore } from "@/lib/data/store";
import { useAuthStore } from "@/hooks/use-stores";
import { toast } from "@/components/ui/use-toast";
import { getPlaceGalleryImages } from "@/lib/utils/place-detail-content";
import { PlaceDetailHero } from "@/components/features/places/detail/place-detail-hero";
import { PlaceDetailHighlights } from "@/components/features/places/detail/place-detail-highlights";
import { PlaceDetailGallery } from "@/components/features/places/detail/place-detail-gallery";
import { PlaceDetailSidebar } from "@/components/features/places/detail/place-detail-sidebar";
import { PlaceDetailMapSection } from "@/components/features/places/detail/place-detail-map-section";
import { PlaceDetailActions } from "@/components/features/places/detail/place-detail-actions";
import { CreateAssistantPanel } from "@/components/features/assistant/create-assistant-panel";
import { PlaceDetailRelatedTrips } from "@/components/features/places/detail/place-detail-related-trips";
import { TripDetailDescription } from "@/components/features/trips/detail/trip-detail-description";
import { TripDetailReport } from "@/components/features/trips/detail/trip-detail-report";
import { TripDetailRating } from "@/components/features/trips/detail/trip-detail-rating";
import { TripDetailReviews } from "@/components/features/trips/detail/trip-detail-reviews";
import type { ReportType } from "@/types";

function computeAvgRating(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

export default function PlaceDetailClient({ id }: { id: string }) {
  const { role, userId } = useAuthStore();
  const [place, setPlace] = useState<Place | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasUserReview, setHasUserReview] = useState(false);

  const canInteract = role !== "guest";
  const store = getStore();

  useEffect(() => {
    async function load() {
      const p = await getPlaceById(id);
      if (!p) {
        setLoading(false);
        return;
      }
      setPlace(p);
      setTrips(await getTripsContainingEntity("place", id));
      const ratings = await getRatings("place", id);
      setAvgRating(computeAvgRating(ratings.map((r) => r.score)));
      const existingRating = await getUserRating("place", id);
      setUserRating(existingRating?.score ?? 0);
      setComments(await getComments("place", id));
      setHasUserReview(!!(await getUserComment("place", id)));
      setIsSaved(await isFavoriteEntity("place", id));
      setLoading(false);
    }
    load();
  }, [id]);

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
    return <div className="min-h-screen animate-pulse bg-[#f9fafb] pt-20">טוען...</div>;
  }
  if (!place) notFound();

  const handleToggleSaved = async () => {
    if (!canInteract) {
      toast({ title: "יש להתחבר כדי לשמור מקום" });
      return;
    }
    const next = await toggleFavoriteEntity("place", id);
    setIsSaved(next);
    toast({ title: next ? "המקום נשמר למועדפים" : "המקום הוסר מהמועדפים" });
  };

  const handleRate = async (score: number) => {
    if (!canInteract) {
      toast({ title: "יש להתחבר כדי לדרג" });
      return;
    }
    const rating = await upsertRating("place", id, score);
    if (rating) {
      setUserRating(score);
      const ratings = await getRatings("place", id);
      setAvgRating(computeAvgRating(ratings.map((r) => r.score)));
      toast({ title: "הדירוג נשמר" });
    }
  };

  const handleReport = async (reportType: ReportType, reason: string) => {
    const report = await createReport("place", id, reportType, reason);
    if (report) {
      toast({ title: "הדיווח נשלח — תודה!" });
    } else {
      toast({ title: "יש להתחבר כדי לדווח", variant: "destructive" });
    }
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
            <TripDetailReport onSubmit={handleReport} canReport={canInteract} />
            <PlaceDetailMapSection place={place} />
            <PlaceDetailGallery images={galleryImages} />
          </div>
          <PlaceDetailSidebar place={place} />
        </div>
      </div>

      <PlaceDetailRelatedTrips trips={trips} />

      <div className="py-8">
        <TripDetailRating
          avgRating={avgRating}
          userRating={userRating}
          onRate={handleRate}
          canRate={canInteract}
          title="דרג את המקום"
        />
      </div>

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
              const comment = await addComment("place", id, commentText);
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

      <PlaceDetailActions place={place} />

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
