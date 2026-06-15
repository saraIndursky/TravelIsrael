import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  className?: string;
  size?: "sm" | "md";
}

export function RatingStars({ rating, className, size = "sm" }: RatingStarsProps) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={cn("flex items-center gap-0.5", className)} dir="rtl">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(0, Math.min(1, rating - (star - 1))) * 100;

        return (
          <div key={star} className={cn("relative", iconSize)}>
            <Star className={cn("absolute text-gray-300", iconSize)} />
            <div
              className="absolute top-0 right-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star className={cn("fill-amber-400 text-amber-400", iconSize)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
