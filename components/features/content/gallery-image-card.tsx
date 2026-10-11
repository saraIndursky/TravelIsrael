"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";

interface GalleryImageCardProps {
  src: string;
  alt?: string;
  aspect?: "square" | "wide";
  canDelete?: boolean;
  overlayLabel?: string;
  onOpen: () => void;
  onDeleteRequest?: () => void;
}

export function GalleryImageCard({
  src,
  alt = "",
  aspect = "wide",
  canDelete,
  overlayLabel,
  onOpen,
  onDeleteRequest,
}: GalleryImageCardProps) {
  const isLocal = src.startsWith("data:") || src.startsWith("blob:");
  const isSquare = aspect === "square";

  return (
    <div className="group relative overflow-hidden rounded-sm">
      <button
        type="button"
        aria-label={alt ? `הגדל תמונה: ${alt}` : "הגדל תמונה"}
        className={`relative w-full cursor-pointer ${isSquare ? "aspect-square" : "h-40"}`}
        onClick={onOpen}
      >
        {isSquare ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 33vw"
            unoptimized={isLocal}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={400}
            height={160}
            className="h-40 w-full object-cover transition-transform hover:scale-105"
            unoptimized={isLocal}
          />
        )}
        {overlayLabel && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-medium text-white">
            {overlayLabel}
          </div>
        )}
      </button>
      {canDelete && onDeleteRequest && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest();
          }}
          className="absolute start-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-100 shadow-sm transition hover:bg-red-600 md:opacity-0 md:group-hover:opacity-100"
          aria-label="מחק תמונה"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
