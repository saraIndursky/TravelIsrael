"use client";

import { AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentRemovedBannerProps {
  removalReason?: string;
  isOwner: boolean;
  onResubmit?: () => void;
  resubmitting?: boolean;
  favoriterNote?: boolean;
}

export function ContentRemovedBanner({
  removalReason,
  isOwner,
  onResubmit,
  resubmitting,
  favoriterNote,
}: ContentRemovedBannerProps) {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
          <div className="space-y-1 text-sm text-amber-950">
            <p className="font-semibold">תוכן זה הוסר מהאתר</p>
            <p className="text-amber-900/90">
              {isOwner
                ? "התוכן לא מוצג לציבור. ניתן לשלוח אותו שוב לאישור."
                : favoriterNote
                  ? "שמרת את התוכן במועדפים לפני ההסרה — אפשר לצפות בו כל עוד הוא שמור. ביטול שמירה יחסום גישה."
                  : "התוכן לא זמין לציבור."}
            </p>
            {removalReason ? (
              <p className="rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-foreground">
                <span className="font-medium">סיבת ההסרה: </span>
                {removalReason}
              </p>
            ) : (
              <p className="text-amber-800/80">לא צוינה סיבה להסרה.</p>
            )}
          </div>
        </div>
        {isOwner && onResubmit && (
          <Button
            type="button"
            className="shrink-0 rounded-xl"
            onClick={onResubmit}
            disabled={resubmitting}
          >
            <Send className="h-4 w-4" aria-hidden />
            {resubmitting ? "שולח..." : "שליחה שוב לאישור"}
          </Button>
        )}
      </div>
    </div>
  );
}
