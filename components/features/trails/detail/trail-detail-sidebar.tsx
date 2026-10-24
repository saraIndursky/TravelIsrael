import { AlertCircle, CalendarClock, Clock, Globe, Navigation, Phone } from "lucide-react";
import type { Trail } from "@/types";
import { getTrailEquipment, getTrailNavigationUrl, getTrailTips } from "@/lib/utils/trail-detail-content";
import { wazeNavigationUrl } from "@/lib/utils/navigation-links";
import { toSafeExternalUrl } from "@/lib/utils/safe-url";

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
  const safeWebsite = toSafeExternalUrl(trail.website);
  const navUrl = getTrailNavigationUrl(trail);
  const wazeUrl = wazeNavigationUrl({ lat: trail.start_lat, lng: trail.start_lng });
  const hasContact = Boolean(trail.phone || safeWebsite || trail.contact_note);

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-[#e5e7eb] bg-[#f9fafb] p-6">
        <h3 className="mb-6 text-xl font-medium text-[#111827]">יצירת קשר</h3>
        <div className="space-y-4">
          {trail.contact_note && (
            <div className="flex items-start gap-3 rounded-sm border border-[#fde68a] bg-[#fffbeb] p-3 text-sm leading-relaxed text-[#78350f]">
              <CalendarClock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <span>{trail.contact_note}</span>
            </div>
          )}
          {trail.phone && (
            <a
              href={`tel:${trail.phone}`}
              className="flex items-center gap-3 text-[#4b5563] transition-colors hover:text-[#111827]"
            >
              <Phone className="h-5 w-5 shrink-0" />
              <span>{trail.phone}</span>
            </a>
          )}
          {safeWebsite && (
            <a
              href={safeWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[#4b5563] transition-colors hover:text-[#111827]"
            >
              <Globe className="h-5 w-5 shrink-0" />
              <span className="truncate text-sm">{safeWebsite.replace(/^https?:\/\//, "")}</span>
            </a>
          )}
          {!hasContact && <p className="text-sm text-[#6b7280]">אין פרטי קשר זמינים</p>}
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#111827] py-3 font-medium text-white transition-colors hover:bg-[#1f2937] print:hidden"
          >
            <Navigation className="h-4 w-4" />
            נווט לתחילת המסלול
          </a>
          {wazeUrl && (
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-[#111827] bg-white py-3 font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6] print:hidden"
            >
              <Navigation className="h-4 w-4" />
              נווט ב-Waze
            </a>
          )}
        </div>

        <div className="mt-6 border-t border-[#e5e7eb] pt-6">
          <h4 className="mb-3 flex items-center gap-2 font-medium text-[#111827]">
            <Clock className="h-4 w-4" />
            שעות פעילות
          </h4>
          <p className="text-sm text-[#4b5563]">{trail.operating_hours || "לא צוין"}</p>
        </div>
      </div>

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
