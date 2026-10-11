"use client";

import { Eye, Save } from "lucide-react";

interface CreateFormActionsProps {
  onPreview: () => void;
  submitting?: boolean;
  saveLabel?: string;
}

export function CreateFormActions({
  onPreview,
  submitting = false,
  saveLabel = "שמירה ושליחה לאישור",
}: CreateFormActionsProps) {
  return (
    <div className="sticky top-24 rounded-lg border border-[#e5e7eb] bg-white p-6">
      <h3 className="mb-4 text-lg font-bold text-[#111827]">פעולות</h3>
      <div className="space-y-3">
        <button
          type="button"
          onClick={onPreview}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d1d5db] bg-[#f3f4f6] py-3 font-bold text-[#111827] transition-colors hover:bg-[#e5e7eb]"
        >
          <Eye className="h-4 w-4" />
          תצוגה מקדימה
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#111827] py-3 font-bold text-white transition-colors hover:bg-[#1f2937] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {submitting ? "שומר..." : saveLabel}
        </button>
      </div>
    </div>
  );
}
