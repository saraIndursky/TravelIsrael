import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PlacesClient } from "@/components/features/places/places-client";
import { LIST_PAGE_METADATA } from "@/lib/seo/metadata";

export const metadata: Metadata = LIST_PAGE_METADATA.places;

export default function PlacesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <PlacesClient />
    </Suspense>
  );
}
