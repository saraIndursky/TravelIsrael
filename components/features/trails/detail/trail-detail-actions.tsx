"use client";

import Link from "next/link";
import { Navigation, Pencil, Plus } from "lucide-react";
import type { Trail } from "@/types";
import { canEditTrail } from "@/lib/data/trails";
import { trailEditPath } from "@/lib/utils/content-path";
import { getTrailNavigationUrl } from "@/lib/utils/trail-detail-content";
import { useAuthStore } from "@/hooks/use-stores";

interface TrailDetailActionsProps {
  trail: Trail;
}

export function TrailDetailActions({ trail }: TrailDetailActionsProps) {
  const { role, userId } = useAuthStore();
  const showEdit = canEditTrail(trail, role, userId || null);
  const navUrl = getTrailNavigationUrl(trail);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 md:px-6">
      <div className="rounded-[2px] border border-[#e5e7eb] bg-white p-4">
        <div className="flex flex-col gap-2">
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-[#111827] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1f2937]"
          >
            <Navigation className="h-4 w-4" />
            התחל ניווט
          </a>
          <Link
            href="/trips/create"
            className="flex w-full items-center justify-center gap-2 rounded-[2px] border-2 border-[#111827] bg-white py-3.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
          >
            <Plus className="h-4 w-4" />
            הוסף לטיול
          </Link>
          {showEdit && (
            <Link
              href={trailEditPath(trail)}
              className="flex w-full items-center justify-center gap-2 rounded-[2px] border border-[#d1d5db] bg-white py-3.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]"
            >
              <Pencil className="h-4 w-4" />
              עריכת המסלול
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
