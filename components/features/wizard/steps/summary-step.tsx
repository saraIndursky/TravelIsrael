"use client";

import {
  Accessibility,
  Clock,
  Compass,
  Droplets,
  Footprints,
  Map,
  MapPin,
  Tags,
  TrendingUp,
} from "lucide-react";
import type { WizardPreferences } from "@/lib/utils/match-score";
import { ACCESSIBILITY_OPTIONS, getDifficultyDisplayLabel } from "../wizard-constants";

interface SummaryStepProps {
  prefs: WizardPreferences;
}

function ShekelIcon({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      ₪
    </span>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">{icon}</div>
      <div>
        <div className="mb-1 text-sm text-muted-foreground">{label}</div>
        <div className="font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function SummaryStep({ prefs }: SummaryStepProps) {
  const accessibilityLabel =
    ACCESSIBILITY_OPTIONS.find((o) => o.value === prefs.accessibility)?.label ?? "";

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-light text-foreground">סיכום התכנון</h2>
        <p className="mt-2 text-muted-foreground">בדקו את הבחירות שלכם</p>
      </div>

      <div className="space-y-6 rounded-sm border border-border bg-muted/20 p-8">
        {(prefs.region || prefs.regionGroup) && (
          <SummaryRow
            icon={<MapPin className="h-5 w-5" />}
            label="אזור"
            value={prefs.region ?? prefs.regionGroup ?? ""}
          />
        )}
        {prefs.difficulty !== undefined && (
          <SummaryRow
            icon={<TrendingUp className="h-5 w-5" />}
            label="רמת קושי"
            value={getDifficultyDisplayLabel(prefs.difficultyLabel, prefs.difficulty)}
          />
        )}
        {prefs.accessibility !== undefined && (
          <SummaryRow
            icon={<Accessibility className="h-5 w-5" />}
            label="רמת נגישות"
            value={accessibilityLabel}
          />
        )}
        {prefs.tripType && (
          <SummaryRow icon={<Footprints className="h-5 w-5" />} label="סוג טיול" value={prefs.tripType} />
        )}
        {prefs.tags && prefs.tags.length > 0 && (
          <SummaryRow icon={<Tags className="h-5 w-5" />} label="תגיות" value={prefs.tags.join(", ")} />
        )}
        {prefs.wetTrip && (
          <SummaryRow icon={<Droplets className="h-5 w-5" />} label="סוג חוויה" value="טיול רטוב" />
        )}
        {prefs.maxBudget !== undefined && prefs.maxBudget > 0 && (
          <SummaryRow
            icon={<ShekelIcon className="text-lg font-semibold leading-none" />}
            label="תקציב מקסימלי"
            value={`עד ${prefs.maxBudget} ₪`}
          />
        )}
        {prefs.durationHours !== undefined && prefs.durationHours > 0 && (
          <SummaryRow icon={<Clock className="h-5 w-5" />} label="משך זמן" value={`${prefs.durationHours} שעות`} />
        )}
      </div>

      <div className="mt-8 rounded-sm border border-emerald-300 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <Compass className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <div className="mb-1 font-medium text-emerald-700">מוכנים לצאת לדרך!</div>
            <div className="text-sm text-emerald-700/80">
              לחצו על &quot;מציאת טיול&quot; וקבלו המלצה מותאמת אישית
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-sm border border-emerald-300 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <Map className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <div className="mb-1 font-medium text-emerald-700">רוצים חוויה מותאמת אישית?</div>
            <div className="text-sm text-emerald-700/80">
              לחצו על &quot;תכנון טיול אישי&quot; ותכננו את הטיול לפי ההעדפות שלכם
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
