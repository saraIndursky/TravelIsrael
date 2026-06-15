"use client";

import Link from "next/link";
import { Compass, Navigation } from "lucide-react";

export function TrailDetailActions() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 md:px-6">
      <div className="rounded-[2px] border border-[#e5e7eb] bg-white p-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/wizard"
            className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-[#111827] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
          >
            <Compass className="h-4 w-4" />
            צור מסלול מותאם אישית
          </Link>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-[2px] border-2 border-[#111827] bg-white py-3.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
          >
            <Navigation className="h-4 w-4" />
            התחל ניווט
          </button>
        </div>
      </div>
    </section>
  );
}
