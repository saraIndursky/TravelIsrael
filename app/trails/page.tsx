import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrailsClient } from "@/components/features/trails/trails-client";
import { LIST_PAGE_METADATA } from "@/lib/seo/metadata";

export const metadata: Metadata = LIST_PAGE_METADATA.trails;

export default function TrailsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <TrailsClient />
    </Suspense>
  );
}
