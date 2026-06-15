"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Trail } from "@/types";
import { getTrailGalleryImages } from "@/lib/utils/trail-detail-content";

interface TrailDetailGalleryProps {
  trail: Trail;
}

export function TrailDetailGallery({ trail }: TrailDetailGalleryProps) {
  const images = getTrailGalleryImages(trail);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const visibleImages = images.slice(0, 8);
  const extraCount = Math.max(0, images.length - 8);

  return (
    <section>
      <h2 className="mb-4 text-3xl font-light text-[#111827]">תמונות מהמסלול</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {visibleImages.map((img, i) => (
          <button
            key={`${img}-${i}`}
            type="button"
            className="relative cursor-pointer overflow-hidden rounded-sm"
            onClick={() => {
              setCurrentIndex(i);
              setIsOpen(true);
            }}
          >
            <Image
              src={img}
              alt=""
              width={400}
              height={160}
              className="h-40 w-full object-cover transition-transform hover:scale-105"
            />
            {i === 7 && extraCount > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-medium text-white">
                +{extraCount} תמונות נוספות
              </div>
            )}
          </button>
        ))}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div className="relative w-full max-w-4xl px-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-[80vh] w-full">
              <Image
                src={images[currentIndex]}
                alt=""
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
              aria-label="תמונה הבאה"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
              }
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
              aria-label="תמונה קודמת"
            >
              <ChevronRight size={28} />
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-xl text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
              aria-label="סגור"
            >
              ✕
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1 text-sm text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
