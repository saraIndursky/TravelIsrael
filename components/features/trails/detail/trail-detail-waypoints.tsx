import type { Trail } from "@/types";
import { getTrailWaypoints } from "@/lib/utils/trail-detail-content";

interface TrailDetailWaypointsProps {
  trail: Trail;
}

export function TrailDetailWaypoints({ trail }: TrailDetailWaypointsProps) {
  const waypoints = getTrailWaypoints(trail);

  return (
    <section>
      <h2 className="mb-6 text-3xl font-light text-[#111827]">תחנות במסלול</h2>
      <div className="space-y-3">
        {waypoints.map((point, index) => (
          <div key={`${point.name}-${index}`} className="flex items-start gap-4 rounded-sm bg-[#f9fafb] p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111827] text-sm font-medium text-white">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <div className="font-medium text-[#111827]">{point.name}</div>
                <div className="text-sm text-[#6b7280]">{point.time}</div>
              </div>
              <div className="text-sm text-[#6b7280]">{point.description}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
