"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [index, setIndex] = useState(0);
  const imgs = images;

  if (imgs.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-video flex-col items-center justify-center gap-2 rounded-lg bg-muted text-muted-foreground",
          className,
        )}
      >
        <ImageOff className="h-8 w-8" aria-hidden />
        <p className="text-sm">אין תמונות זמינות</p>
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-lg bg-muted", className)}>
      <Image src={imgs[index]} alt={`${alt} - ${index + 1}`} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
      {imgs.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80"
            onClick={() => setIndex((i) => (i + 1) % imgs.length)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80"
            onClick={() => setIndex((i) => (i - 1 + imgs.length) % imgs.length)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {imgs.map((_, i) => (
              <button
                key={i}
                className={cn("h-2 w-2 rounded-full", i === index ? "bg-primary" : "bg-background/60")}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
