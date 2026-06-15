"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";

interface PlaceDetailGalleryProps {
  images: string[];
}

export function PlaceDetailGallery({ images }: PlaceDetailGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const openAt = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return (
    <section>
      <h2 className="mb-6 text-3xl font-light text-[#111827]">גלריה</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {images.map((img, index) => (
          <button
            key={`${img}-${index}`}
            type="button"
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-sm"
            onClick={() => openAt(index)}
          >
            <Image
              src={img}
              alt={`תמונה ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
              <Camera className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={close}
          role="presentation"
        >
          <div className="relative w-full max-w-4xl px-4">
            <div
              className="relative h-[80vh] w-full"
              onClick={(e) => e.stopPropagation()}
              role="presentation"
            >
              <Image
                src={images[currentIndex]}
                alt=""
                fill
                className="object-contain"
                sizes="100vw"
              />

              <button
                type="button"
                onClick={close}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-xl text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
                aria-label="סגור"
              >
                ✕
              </button>

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

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1 text-sm text-white">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
