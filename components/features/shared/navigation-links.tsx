import { Navigation } from "lucide-react";
import type { LatLng } from "@/lib/utils/geo";
import { googleMapsNavigationUrl, wazeNavigationUrl } from "@/lib/utils/navigation-links";
import { cn } from "@/lib/utils";

interface NavigationLinksProps {
  point: LatLng;
  /** What is being navigated to, used for the accessible names, e.g. "הכותל". */
  name: string;
  className?: string;
}

const linkClass =
  "inline-flex items-center gap-1.5 text-sm text-[#111827] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]";

/** "Navigate in Waze / Google Maps" links for a point. Hidden when printing. */
export function NavigationLinks({ point, name, className }: NavigationLinksProps) {
  const waze = wazeNavigationUrl(point);
  const google = googleMapsNavigationUrl(point);
  if (!waze && !google) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 print:hidden", className)}>
      {waze && (
        <a href={waze} target="_blank" rel="noopener noreferrer" className={linkClass} aria-label={`ניווט אל ${name} ב-Waze`}>
          <Navigation className="h-4 w-4" aria-hidden />
          ניווט ב-Waze
        </a>
      )}
      {google && (
        <a
          href={google}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          aria-label={`ניווט אל ${name} ב-Google Maps`}
        >
          <Navigation className="h-4 w-4" aria-hidden />
          ניווט ב-Google Maps
        </a>
      )}
    </div>
  );
}
