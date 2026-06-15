"use client";

import Link from "next/link";
import { Bookmark, Edit3, RefreshCw } from "lucide-react";

interface WizardResultActionsProps {
  tripId: string;
  isFavorite: boolean;
  onSave: () => void;
  saving?: boolean;
}

export function WizardResultActions({
  tripId,
  isFavorite,
  onSave,
  saving,
}: WizardResultActionsProps) {
  return (
    <div className="space-y-3 rounded-sm border border-[#e5e7eb] bg-white p-6">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#111827] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#1f2937] disabled:opacity-60"
      >
        <Bookmark className="h-4 w-4" />
        {isFavorite ? "שמור במועדפים ✓" : "שמור אצלי"}
      </button>

      <Link
        href={`/trips/${tripId}/edit`}
        className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-[#111827] py-3.5 text-sm font-bold text-[#111827] transition-colors hover:bg-[#f9fafb]"
      >
        <Edit3 className="h-4 w-4" />
        ערוך מסלול בעצמי
      </Link>

      <Link
        href="/wizard"
        className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-[#d1d5db] py-3.5 text-sm font-bold text-[#6b7280] transition-colors hover:bg-[#f9fafb]"
      >
        <RefreshCw className="h-4 w-4" />
        שנה העדפות
      </Link>
    </div>
  );
}
