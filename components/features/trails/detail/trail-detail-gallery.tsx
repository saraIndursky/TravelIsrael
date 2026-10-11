"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";
import type { EntityImage } from "@/types";
import {
  AddGalleryImageDialog,
  type GalleryImagePayload,
} from "@/components/features/content/add-gallery-image-dialog";
import { GalleryImageCard } from "@/components/features/content/gallery-image-card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { mergeGalleryDisplayItems } from "@/lib/utils/gallery-display";

interface TrailDetailGalleryProps {
  images: string[];
  communityImages?: EntityImage[];
  currentUserId?: string;
  canAddImage?: boolean;
  onAddImage?: (payload: GalleryImagePayload) => Promise<void>;
  onDeleteImage?: (imageId: string) => Promise<void>;
}

export function TrailDetailGallery({
  images,
  communityImages = [],
  currentUserId = "",
  canAddImage,
  onAddImage,
  onDeleteImage,
}: TrailDetailGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const items = useMemo(
    () => mergeGalleryDisplayItems(images, communityImages, currentUserId),
    [images, communityImages, currentUserId]
  );
  const visibleItems = items.slice(0, 8);
  const extraCount = Math.max(0, items.length - 8);

  const handleAdd = async (payload: GalleryImagePayload) => {
    if (!onAddImage) return;
    await onAddImage(payload);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId || !onDeleteImage) return;
    setDeleting(true);
    try {
      await onDeleteImage(pendingDeleteId);
      setPendingDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  if (items.length === 0 && !canAddImage) return null;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-light text-[#111827]">תמונות מהמסלול</h2>
        {canAddImage && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-sm border border-[#e5e7eb] px-4 py-2 text-sm text-[#111827] transition-colors hover:bg-[#f9fafb]"
          >
            <ImagePlus className="h-4 w-4" />
            הוספת תמונה לגלריה
          </button>
        )}
      </div>

      {onAddImage && (
        <AddGalleryImageDialog open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} />
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {visibleItems.map((item, i) => (
            <GalleryImageCard
              key={`${item.imageId ?? item.url}-${i}`}
              src={item.url}
              canDelete={item.canDelete}
              overlayLabel={i === 7 && extraCount > 0 ? `+${extraCount} תמונות נוספות` : undefined}
              onOpen={() => {
                setCurrentIndex(i);
                setIsOpen(true);
              }}
              onDeleteRequest={item.imageId ? () => setPendingDeleteId(item.imageId ?? null) : undefined}
            />
          ))}
        </div>
      )}

      <ConfirmDeleteDialog
        open={Boolean(pendingDeleteId)}
        description="למחוק את התמונה מהגלריה? פעולה זו לא ניתנת לביטול."
        confirming={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => !deleting && setPendingDeleteId(null)}
      />

      {isOpen && items[currentIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div className="relative w-full max-w-4xl px-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-[80vh] w-full">
              <Image
                src={items[currentIndex].url}
                alt=""
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
              aria-label="תמונה הבאה"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1))
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
              {currentIndex + 1} / {items.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
