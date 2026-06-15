import { AlertCircle } from "lucide-react";
import type { Trail } from "@/types";
import { getTrailEquipment, getTrailTips } from "@/lib/utils/trail-detail-content";

interface TrailDetailSidebarProps {
  trail: Trail;
}

const TIP_ICONS: Record<string, string> = {
  warning: "⚠️",
  time: "🕒",
  season: "☀️",
  parking: "🅿️",
};

export function TrailDetailSidebar({ trail }: TrailDetailSidebarProps) {
  const equipment = getTrailEquipment(trail);
  const tips = getTrailTips(trail);

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-[#e5e7eb] bg-[#f9fafb] p-6">
        <h3 className="mb-6 text-xl font-medium text-[#111827]">מה צריך להביא</h3>
        <div className="space-y-3">
          {equipment.map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-sm text-[#4b5563]">
              <span className="text-xl">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-sm border border-[#fde68a] bg-[#fffbeb] p-6">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-medium text-[#111827]">
          <AlertCircle className="h-5 w-5 text-[#f59e0b]" />
          המלצות וטיפים
        </h3>
        <div className="space-y-4">
          {tips.map((tip) => (
            <div key={tip.text} className="flex items-start gap-3">
              <span className="text-lg">{TIP_ICONS[tip.type]}</span>
              <div className="text-sm leading-relaxed text-[#78350f]">{tip.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
