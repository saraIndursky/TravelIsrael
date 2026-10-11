"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/components/ui/use-toast";
import { deleteComment, updateComment } from "@/lib/data/social";
import type { Comment, User } from "@/types";

interface TripDetailReviewsProps {
  comments: Comment[];
  users: User[];
  onAddReview?: () => void;
  canAddReview?: boolean;
  /** Enables edit and delete on the signed-in user's own review. */
  currentUserId?: string | null;
  onReviewUpdated?: (comment: Comment) => void;
  onReviewDeleted?: (commentId: string) => void;
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
  currentUserId,
  onReviewUpdated,
  onReviewDeleted,
}: TripDetailReviewsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const updated = await updateComment(id, draft);
      onReviewUpdated?.(updated);
      setEditingId(null);
      toast({ title: "הביקורת עודכנה" });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "עדכון הביקורת נכשל",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setSaving(true);
    try {
      await deleteComment(deletingId);
      onReviewDeleted?.(deletingId);
      setDeletingId(null);
      toast({ title: "הביקורת נמחקה" });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "מחיקת הביקורת נכשלה",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

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
                  {currentUserId && review.user_id === currentUserId && editingId !== review.id && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="עריכת הביקורת"
                        aria-label="עריכת הביקורת"
                        onClick={() => {
                          setEditingId(review.id);
                          setDraft(review.content);
                        }}
                        className="rounded-full p-2 text-[#4b5563] hover:bg-[#e5e7eb]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="מחיקת הביקורת"
                        aria-label="מחיקת הביקורת"
                        onClick={() => setDeletingId(review.id)}
                        className="rounded-full p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                {editingId === review.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      maxLength={2000}
                      rows={4}
                      aria-label="עריכת הביקורת"
                      className="ti-input w-full"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={saving || !draft.trim()}
                        onClick={() => saveEdit(review.id)}
                        className="rounded-sm bg-[#111827] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        {saving ? "שומר..." : "שמירה"}
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => setEditingId(null)}
                        className="rounded-sm border border-[#e5e7eb] px-5 py-2 text-sm font-medium text-[#111827]"
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="leading-relaxed text-[#4b5563]">{review.content}</p>
                )}
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
          הוספת ביקורת
        </button>
      ) : (
        <p className="mt-6 text-center text-sm text-[#6b7280]">כבר הוספת ביקורת לטיול זה</p>
      )}
      <ConfirmDeleteDialog
        open={Boolean(deletingId)}
        description="הביקורת תימחק לצמיתות. אפשר יהיה לכתוב ביקורת חדשה."
        confirming={saving}
        onConfirm={confirmDelete}
        onClose={() => setDeletingId(null)}
      />
    </section>
  );
}
