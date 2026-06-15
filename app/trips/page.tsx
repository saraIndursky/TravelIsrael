import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TripsClient } from "@/components/features/trips/trips-client";

export default function TripsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8"><Skeleton className="h-96 w-full" /></div>}>
      <TripsClient />
    </Suspense>
  );
}
