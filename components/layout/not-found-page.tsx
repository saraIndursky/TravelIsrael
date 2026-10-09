import Link from "next/link";
import { Compass, Home, Map, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotFoundPageProps {
  title?: string;
  description?: string;
  code?: string;
  className?: string;
}

export function NotFoundPage({
  title = "הדף לא נמצא",
  description = "ייתכן שהקישור שגוי, שהדף הוסר, או שאין לך הרשאה לצפות בתוכן הזה.",
  code = "404",
  className,
}: NotFoundPageProps) {
  return (
    <div
      className={cn(
        "flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-20",
        className
      )}
    >
      <div className="mx-auto max-w-lg text-center">
        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full bg-primary/5 motion-safe:animate-pulse"
            aria-hidden
          />
          <span
            className="absolute inset-3 rounded-full border border-dashed border-primary/20 motion-safe:animate-spin"
            style={{ animationDuration: "12s" }}
            aria-hidden
          />
          <Compass className="relative h-14 w-14 text-primary/80" aria-hidden />
        </div>

        <p className="mb-2 text-sm font-semibold tracking-wide text-primary">{code}</p>
        <h1 className="mb-3 text-3xl font-light tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="mb-10 text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="ti-btn-primary inline-flex min-w-[160px]">
            <Home className="h-4 w-4" />
            דף הבית
          </Link>
          <Link
            href="/trips"
            className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <Map className="h-4 w-4" />
            גילוי טיולים
          </Link>
          <Link
            href="/wizard"
            className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <Search className="h-4 w-4" />
            אשף התאמה
          </Link>
        </div>
      </div>
    </div>
  );
}
