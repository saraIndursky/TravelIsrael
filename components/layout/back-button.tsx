"use client";

import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useGoBack } from "@/hooks/use-go-back";

const TRIP_DETAIL_PAGE = /^\/trips\/[^/]+$/;
const TRAIL_DETAIL_PAGE = /^\/trails\/[^/]+$/;
const PLACE_DETAIL_PAGE = /^\/places\/[^/]+$/;
const HERO_BACK_PAGES = ["/wizard/results"];

export function BackButton() {
  const pathname = usePathname();
  const goBack = useGoBack();

  const isTripDetailPage =
    TRIP_DETAIL_PAGE.test(pathname) && pathname !== "/trips/create";
  const isTrailDetailPage = TRAIL_DETAIL_PAGE.test(pathname);
  const isPlaceDetailPage = PLACE_DETAIL_PAGE.test(pathname);

  if (
    pathname === "/" ||
    isTripDetailPage ||
    isTrailDetailPage ||
    isPlaceDetailPage ||
    HERO_BACK_PAGES.includes(pathname)
  ) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="fixed top-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#e5e7eb] bg-white/95 shadow-sm backdrop-blur-sm transition-all hover:bg-white md:right-6"
      aria-label="חזור אחורה"
      title="חזרה לעמוד הקודם"
    >
      <ArrowRight className="h-5 w-5 text-[#111827]" />
    </button>
  );
}
