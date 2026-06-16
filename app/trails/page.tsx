import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrailsClient } from "@/components/features/trails/trails-client";

export const metadata = {
  title: "מסלולים — TravelIsrael",
  description: "גלה מסלולי הליכה וטיול בישראל",
};

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
