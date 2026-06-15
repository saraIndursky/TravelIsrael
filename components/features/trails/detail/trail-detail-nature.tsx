import { BookOpen } from "lucide-react";
import type { Trail } from "@/types";
import { getTrailNature } from "@/lib/utils/trail-detail-content";

interface TrailDetailNatureProps {
  trail: Trail;
}

export function TrailDetailNature({ trail }: TrailDetailNatureProps) {
  const nature = getTrailNature(trail);

  return (
    <section>
      <h2 className="mb-6 text-3xl font-light text-[#111827]">טבע ולמידה</h2>

      <div className="space-y-6">
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-[#111827]">
            🐾 בעלי חיים במסלול
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {nature.animals.map((animal) => (
              <div
                key={animal.name}
                className="cursor-pointer rounded-sm border border-[#e5e7eb] p-4 transition-all hover:border-[#d1d5db]"
              >
                <div className="mb-2 font-medium text-[#111827]">{animal.name}</div>
                <div className="text-sm text-[#6b7280]">{animal.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-[#111827]">
            🌿 צמחים מעניינים
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {nature.plants.map((plant) => (
              <div
                key={plant.name}
                className="cursor-pointer rounded-sm border border-[#e5e7eb] p-4 transition-all hover:border-[#d1d5db]"
              >
                <div className="mb-2 font-medium text-[#111827]">{plant.name}</div>
                <div className="text-sm text-[#6b7280]">{plant.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-[#111827]">
            ℹ️ עובדות מעניינות
          </h3>
          <div className="space-y-2">
            {nature.facts.map((fact) => (
              <div
                key={fact}
                className="flex items-start gap-3 rounded-sm border border-[#bbf7d0] bg-[#f0fdf4] p-3"
              >
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" />
                <div className="text-sm text-[#047857]">{fact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
