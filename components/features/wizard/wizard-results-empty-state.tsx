"use client";

import Link from "next/link";
import { Compass, SlidersHorizontal } from "lucide-react";
import { MIN_MATCH_SCORE } from "@/lib/utils/match-score";

interface WizardResultsEmptyStateProps {
  /** True when trips existed but all scored below MIN_MATCH_SCORE */
  filteredOut?: boolean;
}

export function WizardResultsEmptyState({ filteredOut = false }: WizardResultsEmptyStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-white px-4 py-16 text-center" dir="rtl">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3f4f6]">
        <Compass className="h-7 w-7 text-[#6b7280]" aria-hidden />
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-xl font-semibold text-[#111827]">לא נמצאו טיולים מתאימים</h1>
        <p className="text-sm leading-relaxed text-[#6b7280]">
          {filteredOut
            ? `אין טיולים עם התאמה של לפחות ${MIN_MATCH_SCORE}%. נסי להרחיב את האזור, להוריד דרישות נגישות, או לדלג על כמה שלבים באשף.`
            : "לא מצאנו טיולים מאושרים שמתאימים להעדפות שבחרת. אפשר לשנות את הבחירות ולנסות שוב."}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/wizard"
          className="inline-flex items-center gap-2 rounded-sm bg-[#111827] px-6 py-3 text-sm font-medium text-white hover:bg-[#1f2937]"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          שינוי העדפות
        </Link>
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 rounded-sm border border-[#e5e7eb] px-6 py-3 text-sm font-medium text-[#111827] hover:bg-[#f9fafb]"
        >
          לכל הטיולים
        </Link>
      </div>
    </div>
  );
}
