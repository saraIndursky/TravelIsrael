"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImagePlus, Link2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Place, Trail, Trip, TripStation } from "@/types";

interface TripDetailGalleryProps {
  trip: Trip;
  stations: TripStation[];
  places: Place[];
  trails: Trail[];
  canAddImage?: boolean;
  onAddImage?: (url: string) => Promise<void>;
}

function collectStationImages(
  stations: TripStation[],
  places: Place[],
  trails: Trail[]
): string[] {
  const images: string[] = [];

  stations.forEach((station) => {
    if (station.place_id) {
      const place = places.find((p) => p.id === station.place_id);
      if (place?.image_url) images.push(place.image_url);
    }
    if (station.trail_id) {
      const trail = trails.find((t) => t.id === station.trail_id);
      if (trail?.image_url) images.push(trail.image_url);
    }
  });

  return images;
}

function collectImages(
  trip: Trip,
  stations: TripStation[],
  places: Place[],
  trails: Trail[]
): string[] {
  const gallery = trip.gallery_images ?? [];
  const stationImages = collectStationImages(stations, places, trails);
  const combined = gallery.length > 0 ? gallery : [trip.main_image, ...stationImages];
  return Array.from(new Set(combined.filter(Boolean)));
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function TripDetailGallery({
  trip,
  stations,
  places,
  trails,
  canAddImage,
  onAddImage,
}: TripDetailGalleryProps) {
  const [images, setImages] = useState(() => collectImages(trip, stations, places, trails));
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [adding, setAdding] = useState(false);

  const visibleImages = images.slice(0, 8);
  const extraCount = Math.max(0, images.length - 8);

  const resetAddForm = useCallback(() => {
    setImageUrl("");
    setPreviewUrl("");
    setDragOver(false);
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await readFileAsDataUrl(file);
    setPreviewUrl(dataUrl);
    setImageUrl(dataUrl);
  }, []);

  const handleSubmitImage = async () => {
    const url = imageUrl.trim();
    if (!onAddImage || !url) return;
    setAdding(true);
    await onAddImage(url);
    setImages((prev) => Array.from(new Set([...prev, url])));
    resetAddForm();
    setAddOpen(false);
    setAdding(false);
  };

  if (images.length === 0 && !canAddImage) return null;

  return (
    <div className="mx-auto mb-12 max-w-7xl px-4 md:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-light text-[#111827]">תמונות מהטיול</h2>
        {canAddImage && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-sm border border-[#e5e7eb] px-4 py-2 text-sm text-[#111827] transition-colors hover:bg-[#f9fafb]"
          >
            <ImagePlus className="h-4 w-4" />
            הוסף תמונה לגלריה
          </button>
        )}
      </div>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) resetAddForm();
        }}
      >
        <DialogContent className="bg-white text-[#111827] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הוספת תמונה לגלריה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm text-[#6b7280]">
                <Link2 className="h-4 w-4" />
                קישור לתמונה
              </p>
              <input
                type="url"
                value={imageUrl.startsWith("data:") ? "" : imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                placeholder="הדביקי קישור לתמונה (URL)"
                className="w-full rounded-sm border border-[#d1d5db] bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
              />
            </div>

            <div className="text-center text-xs text-[#9ca3af]">או</div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) await handleFile(file);
              }}
              className={`flex flex-col items-center justify-center rounded-sm border-2 border-dashed px-4 py-8 transition-colors ${
                dragOver ? "border-[#111827] bg-[#f9fafb]" : "border-[#d1d5db] bg-[#fafafa]"
              }`}
            >
              <Upload className="mb-2 h-8 w-8 text-[#9ca3af]" />
              <p className="mb-1 text-sm text-[#4b5563]">גררי תמונה לכאן</p>
              <p className="mb-3 text-xs text-[#9ca3af]">או</p>
              <label className="cursor-pointer rounded-sm border border-[#111827] px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]">
                בחרי קובץ
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await handleFile(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {previewUrl && (
              <div className="relative mx-auto h-32 w-full max-w-xs overflow-hidden rounded-sm border border-[#e5e7eb]">
                <Image src={previewUrl} alt="תצוגה מקדימה" fill className="object-cover" unoptimized />
              </div>
            )}

            <button
              type="button"
              disabled={adding || !imageUrl.trim()}
              onClick={handleSubmitImage}
              className="w-full rounded-sm bg-[#111827] py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-60"
            >
              {adding ? "שומר..." : "שמור"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {images.length > 0 && (
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
                unoptimized={img.startsWith("data:")}
              />
              {i === 7 && extraCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-medium text-white">
                  +{extraCount} תמונות נוספות
                </div>
              )}
            </button>
          ))}
        </div>
      )}

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
                unoptimized={images[currentIndex]?.startsWith("data:")}
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
    </div>
  );
}
