"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardResultNavProps {
  currentIndex: number;
  batchSize: number;
  hasMore: boolean;
  canGoPrev: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function WizardResultNav({
  currentIndex,
  batchSize,
  hasMore,
  canGoPrev,
  onPrev,
  onNext,
}: WizardResultNavProps) {
  if (batchSize <= 1 && !hasMore) return null;

  const isLastInBatch = currentIndex === batchSize - 1;
  const showLoadMore = isLastInBatch && hasMore;

  return (
    <div className="border-b border-[#e5e7eb] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <div className="flex items-center justify-between rounded-lg bg-[#f9fafb] p-4">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canGoPrev}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors",
              !canGoPrev ? "cursor-not-allowed text-[#6b7280]" : "text-[#111827] hover:bg-white"
            )}
          >
            <ChevronRight className="h-4 w-4" />
            הקודם
          </button>
          <span className="text-sm text-[#6b7280]">
            תוצאה {currentIndex + 1} מתוך {batchSize}
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={isLastInBatch && !hasMore}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors",
              isLastInBatch && !hasMore
                ? "cursor-not-allowed text-[#6b7280]"
                : showLoadMore
                  ? "font-medium text-[#111827] hover:bg-white"
                  : "text-[#111827] hover:bg-white"
            )}
          >
            {showLoadMore ? "הצגת עוד 5" : "הבא"}
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
