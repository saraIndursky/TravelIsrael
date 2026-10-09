import { Compass } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PageLoadingSpinnerProps {
  /** For screen readers only — not shown visually */
  ariaLabel?: string;
  className?: string;
  size?: "default" | "sm";
}

export function PageLoadingSpinner({
  ariaLabel = "טוען",
  className,
  size = "default",
}: PageLoadingSpinnerProps) {
  const box = size === "sm" ? "h-10 w-10" : "h-20 w-20";
  const icon = size === "sm" ? "h-5 w-5" : "h-9 w-9";
  const ring = size === "sm" ? "inset-0.5" : "inset-1";

  return (
    <div
      className={cn("flex items-center justify-center px-4 py-12", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <div className={cn("relative flex items-center justify-center", box)}>
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" aria-hidden />
        <span
          className={cn(
            "absolute animate-spin rounded-full border-2 border-primary/15 border-t-primary",
            ring
          )}
          aria-hidden
        />
        <Compass className={cn("relative text-primary motion-safe:animate-pulse", icon)} aria-hidden />
      </div>
    </div>
  );
}

/** Full-page client fetch loading (detail pages, profile) */
export function ClientPageLoading({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen bg-[#f9fafb] pt-20", className)}>
      <PageLoadingSpinner className="min-h-[50vh] py-0" />
    </div>
  );
}

/** Centered spinner for admin lists and modals */
export function CenteredPageLoading({ className }: { className?: string }) {
  return (
    <div className={cn("py-20", className)}>
      <PageLoadingSpinner className="py-0" />
    </div>
  );
}

export function DefaultPageLoading() {
  return (
    <div className="min-h-[60vh] bg-background">
      <PageLoadingSpinner />
      <div className="ti-container space-y-4 pb-16 opacity-40">
        <Skeleton className="mx-auto h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function ListPageLoading() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <PageLoadingSpinner className="min-h-[35vh]" />
      <div className="ti-container space-y-6 pb-16 opacity-50">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full max-w-xl rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DetailPageLoading() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Skeleton className="h-[45vh] min-h-[280px] w-full rounded-none motion-safe:animate-pulse" />
      <PageLoadingSpinner className="py-10" />
      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-16 opacity-50 md:px-6">
        <Skeleton className="h-8 w-2/3 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function WizardPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Skeleton className="h-56 w-full rounded-none md:h-72" />
      <div className="border-b border-border bg-white/90 px-4 py-6">
        <div className="mx-auto flex max-w-3xl gap-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-2 flex-1 rounded-full" />
          ))}
        </div>
      </div>
      <PageLoadingSpinner className="py-8" />
      <div className="mx-auto max-w-3xl space-y-4 px-4 pb-16 opacity-50">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function AdminPageLoading() {
  return (
    <div className="min-h-[60vh]">
      <PageLoadingSpinner className="py-8" />
      <div className="space-y-6 px-4 pb-8 opacity-50 md:px-8">
        <Skeleton className="h-10 w-56 rounded-lg" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function ProfilePageLoading() {
  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-[#f5f6f8] to-[#eef0f4]">
      <PageLoadingSpinner className="py-10" />
      <div className="container mx-auto max-w-3xl space-y-6 px-4 pb-16 opacity-50">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
