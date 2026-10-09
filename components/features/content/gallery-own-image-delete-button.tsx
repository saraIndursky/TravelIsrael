"use client";

import { Trash2 } from "lucide-react";

interface GalleryOwnImageDeleteButtonProps {
  onClick: () => void;
}

export function GalleryOwnImageDeleteButton({ onClick }: GalleryOwnImageDeleteButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute start-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-100 shadow-sm transition hover:bg-red-600 md:opacity-0 md:group-hover:opacity-100"
      aria-label="מחק תמונה"
    >
      <Trash2 className="h-4 w-4" aria-hidden />
    </button>
  );
}
