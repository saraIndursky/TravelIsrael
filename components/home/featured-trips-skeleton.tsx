import { Skeleton } from "@/components/ui/skeleton";

export function HomeFeaturedTripsSkeleton() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="ti-container">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-44" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded border border-[#e5e7eb] bg-white"
            >
              <Skeleton className="h-[300px] w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
