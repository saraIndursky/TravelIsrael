"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function StarRating({ value, onChange, max = 5, size = "md", className }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const active = hover || value;

  return (
    <div className={cn("flex items-center gap-0.5", className)} dir="rtl">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={cn(
            interactive && "cursor-pointer transition-transform hover:scale-110",
            !interactive && "cursor-default"
          )}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >
          <Star
            className={cn(
              iconSize,
              active >= star ? "fill-amber-400 text-amber-400" : "text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
