"use client";

interface SpecialPreferencesStepProps {
  wetTrip: boolean;
  maxBudget: number;
  durationHours: number;
  onWetTripChange: (value: boolean) => void;
  onMaxBudgetChange: (value: number) => void;
  onDurationChange: (value: number) => void;
}

export function SpecialPreferencesStep({
  wetTrip,
  maxBudget,
  durationHours,
  onWetTripChange,
  onMaxBudgetChange,
  onDurationChange,
}: SpecialPreferencesStepProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-light text-foreground">העדפות מיוחדות</h2>
        <p className="mt-2 text-muted-foreground">הגדירו דרישות נוספות לטיול (אופציונלי)</p>
      </div>

      <div className="space-y-6">
        <label className="flex cursor-pointer items-center gap-4 rounded-sm border-2 border-border p-6 transition-all hover:border-muted-foreground/40">
          <input
            type="checkbox"
            checked={wetTrip}
            onChange={(e) => onWetTripChange(e.target.checked)}
            className="h-5 w-5 accent-primary"
          />
          <span className="font-medium text-foreground">טיול רטוב</span>
        </label>

        <div className="rounded-sm border-2 border-border p-6">
          <span className="mb-4 block font-medium text-foreground">תקציב מקסימלי: {maxBudget} ₪</span>
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={maxBudget}
            onChange={(e) => onMaxBudgetChange(Number(e.target.value))}
            className="ti-range w-full"
          />
          <div className="mt-2 flex justify-between text-sm text-muted-foreground">
            <span>0</span>
            <span>1000</span>
          </div>
        </div>

        <div className="rounded-sm border-2 border-border p-6">
          <span className="mb-4 block font-medium text-foreground">משך זמן הטיול (בשעות)</span>
          <input
            type="number"
            min={0}
            max={72}
            value={durationHours || ""}
            onChange={(e) => onDurationChange(Number(e.target.value) || 0)}
            placeholder="הכניסו מספר שעות"
            className="w-full rounded-sm border-2 border-border p-3 outline-none transition-all focus:border-muted-foreground/40"
          />
        </div>
      </div>
    </div>
  );
}
