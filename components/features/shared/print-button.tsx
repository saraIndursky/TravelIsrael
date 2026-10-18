"use client";

import { Printer } from "lucide-react";

/** Opens the browser's print dialog, from which the page can also be saved as a PDF. */
export function PrintButton({ label = "הדפסה / שמירה כ-PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-[2px] border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6] print:hidden"
    >
      <Printer className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
