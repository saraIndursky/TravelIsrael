"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import type { Comment, Trail, Trip } from "@/types";
import { getTrailById } from "@/lib/data/trails";
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
import { getStore } from "@/lib/data/store";
import { useAuthStore } from "@/hooks/use-stores";
import { toast } from "@/components/ui/use-toast";
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
import { TrailDetailActions } from "@/components/features/trails/detail/trail-detail-actions";
import { TrailDetailRelatedTrips } from "@/components/features/trails/detail/trail-detail-related-trips";
import type { ReportType } from "@/types";

function computeAvgRating(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

export default function TrailDetailClient({ id }: { id: string }) {
  const { role } = useAuthStore();
  const [trail, setTrail] = useState<Trail | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratingsCount, setRatingsCount] = useState(0);
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
      const t = await getTrailById(id);
      if (!t) {
        setLoading(false);
        return;
      }
      setTrail(t);
      setTrips(await getTripsContainingEntity("trail", id));
      const ratings = await getRatings("trail", id);
      setRatingsCount(ratings.length);
      setAvgRating(computeAvgRating(ratings.map((r) => r.score)));
      const existingRating = await getUserRating("trail", id);
      setUserRating(existingRating?.score ?? 0);
      setComments(await getComments("trail", id));
      setHasUserReview(!!(await getUserComment("trail", id)));
      setLoading(false);
    }
    load();
  }, [id]);

  const tagsDisplay = useMemo(() => trail?.tags.join(" · ") ?? "", [trail?.tags]);

  if (loading) {
    return <div className="min-h-screen animate-pulse bg-[#f9fafb] pt-20">טוען...</div>;
  }
  if (!trail) notFound();

  const handleToggleSaved = () => {
    if (!canInteract) {
      toast({ title: "יש להתחבר כדי לשמור מסלול" });
      return;
    }
    setIsSaved((v) => !v);
    toast({ title: isSaved ? "המסלול הוסר מהשמורים" : "המסלול נשמר" });
  };

  const handleRate = async (score: number) => {
    if (!canInteract) {
      toast({ title: "יש להתחבר כדי לדרג" });
      return;
    }
    const rating = await upsertRating("trail", id, score);
    if (rating) {
      setUserRating(score);
      const ratings = await getRatings("trail", id);
      setRatingsCount(ratings.length);
      setAvgRating(computeAvgRating(ratings.map((r) => r.score)));
      toast({ title: "הדירוג נשמר" });
    }
  };

  const handleReport = async (reportType: ReportType, reason: string) => {
    const report = await createReport("trail", id, reportType, reason);
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
      <TrailDetailHighlights trail={trail} />

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 md:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
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
            <TripDetailReport onSubmit={handleReport} canReport={canInteract} />
            <TrailDetailWaypoints trail={trail} />
            <TrailDetailMapSection trail={trail} />
            <TrailDetailGallery trail={trail} />
            <TrailDetailNature trail={trail} />
          </div>
          <TrailDetailSidebar trail={trail} />
        </div>
      </div>

      <TrailDetailRelatedTrips trips={trips} />

      <div className="py-8">
        <TripDetailRating
          avgRating={avgRating}
          userRating={userRating}
          onRate={handleRate}
          canRate={canInteract}
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
              const comment = await addComment("trail", id, commentText);
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

      <TrailDetailActions />
    </div>
  );
}
