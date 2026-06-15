"use client";

import type { Comment, User } from "@/types";

interface TripDetailReviewsProps {
  comments: Comment[];
  users: User[];
  onAddReview?: () => void;
  canAddReview?: boolean;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("he-IL");
}

export function TripDetailReviews({
  comments,
  users,
  onAddReview,
  canAddReview = true,
}: TripDetailReviewsProps) {
  return (
    <section className="mx-auto mb-8 max-w-7xl px-4 md:px-6">
      <h2 className="mb-6 text-3xl font-light text-[#111827]">ביקורות</h2>
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((review) => {
            const user = users.find((u) => u.id === review.user_id);
            const initials = user?.name?.charAt(0) ?? "?";

            return (
              <div
                key={review.id}
                className="rounded-sm border border-[#e5e7eb] bg-[#f9fafb] p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111827] text-lg font-bold text-white">
                      {initials}
                    </div>
                    <div>
                      <span className="font-bold text-[#111827]">{user?.name ?? "משתמש"}</span>
                      <div className="mt-1 text-sm text-[#6b7280]">{formatDate(review.created_at)}</div>
                    </div>
                  </div>
                </div>
                <p className="leading-relaxed text-[#4b5563]">{review.content}</p>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-[#6b7280]">
            אין ביקורות עדיין. היה הראשון להוסיף ביקורת!
          </div>
        )}
      </div>
      {canAddReview ? (
        <button
          type="button"
          onClick={onAddReview}
          className="mt-6 w-full rounded-sm border-2 border-[#e5e7eb] bg-[#f9fafb] py-3 font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6]"
        >
          הוסף ביקורת
        </button>
      ) : (
        <p className="mt-6 text-center text-sm text-[#6b7280]">כבר הוספת ביקורת לטיול זה</p>
      )}
    </section>
  );
}
