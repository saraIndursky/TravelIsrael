import { toSafeExternalUrl } from "@/lib/utils/safe-url";
import { wazeNavigationUrl } from "@/lib/utils/navigation-links";
import { AlertCircle, CheckCircle2, Globe, Navigation, Phone } from "lucide-react";
import type { Place } from "@/types";
import {
  formatPlaceOpeningHours,
  getNavigationUrl,
  getPlaceFeatures,
  getPlaceTips,
} from "@/lib/utils/place-detail-content";

interface PlaceDetailSidebarProps {
  place: Place;
}

const TIP_ICONS: Record<string, string> = {
  warning: "⚠️",
  time: "🕒",
  food: "🍽️",
  budget: "💰",
  parking: "🅿️",
  season: "☀️",
};

export function PlaceDetailSidebar({ place }: PlaceDetailSidebarProps) {
  const safeWebsite = toSafeExternalUrl(place.website);
  const features = getPlaceFeatures(place);
  const tips = getPlaceTips(place);
  const navUrl = getNavigationUrl(place);
  const wazeUrl = wazeNavigationUrl({ lat: place.lat, lng: place.lng });

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-[#e5e7eb] bg-[#f9fafb] p-6">
        <h3 className="mb-6 text-xl font-medium text-[#111827]">יצירת קשר</h3>
        <div className="space-y-4">
          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="flex items-center gap-3 text-[#4b5563] transition-colors hover:text-[#111827]"
            >
              <Phone className="h-5 w-5 shrink-0" />
              <span>{place.phone}</span>
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
          {!place.phone && !place.website && (
            <p className="text-sm text-[#6b7280]">אין פרטי קשר זמינים</p>
          )}
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#111827] py-3 font-medium text-white transition-colors hover:bg-[#1f2937] print:hidden"
          >
            <Navigation className="h-4 w-4" />
            נווט למקום
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
          <h4 className="mb-3 font-medium text-[#111827]">שעות פתיחה</h4>
          <div className="flex justify-between text-sm text-[#4b5563]">
            <span>כל השבוע</span>
            <span className="font-medium">{formatPlaceOpeningHours(place)}</span>
          </div>
          <div className="mt-2 text-sm text-[#6b7280]">{place.address}</div>
        </div>
      </div>

      <div className="rounded-sm border border-[#86efac] bg-[#f0fdf4] p-6">
        <h3 className="mb-4 text-xl font-medium text-[#111827]">מה במקום</h3>
        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-2 text-sm text-[#047857]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-sm border border-[#fde68a] bg-[#fffbeb] p-6">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-medium text-[#111827]">
          <AlertCircle className="h-5 w-5 text-[#f59e0b]" />
          טיפים
        </h3>
        <div className="space-y-3">
          {tips.map((tip) => (
            <div key={tip.text} className="flex items-start gap-2">
              <span className="text-lg">{TIP_ICONS[tip.type]}</span>
              <div className="text-sm leading-relaxed text-[#78350f]">{tip.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
