import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PlacesClient } from "@/components/features/places/places-client";

export const metadata = {
  title: "מקומות — TravelIsrael",
  description: "גלה מקומות לביקור בישראל",
};

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
