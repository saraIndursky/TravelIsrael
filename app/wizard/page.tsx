"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFooterVisible } from "@/hooks/use-footer-visible";
import { cn } from "@/lib/utils";
import { useWizardStore } from "@/hooks/use-stores";
import { WizardHero } from "@/components/features/wizard/wizard-hero";
import { WizardProgress } from "@/components/features/wizard/wizard-progress";
import { WizardNav } from "@/components/features/wizard/wizard-nav";
import { WizardResetButton } from "@/components/features/wizard/wizard-reset-button";
import { RegionStep } from "@/components/features/wizard/steps/region-step";
import { DifficultyStep } from "@/components/features/wizard/steps/difficulty-step";
import { AccessibilityStep } from "@/components/features/wizard/steps/accessibility-step";
import { TripTypeStep } from "@/components/features/wizard/steps/trip-type-step";
import { TagsStep } from "@/components/features/wizard/steps/tags-step";
import { SpecialPreferencesStep } from "@/components/features/wizard/steps/special-preferences-step";
import { SummaryStep } from "@/components/features/wizard/steps/summary-step";
import { WIZARD_STEPS } from "@/components/features/wizard/wizard-constants";
import type { Difficulty, Region } from "@/types";

export default function WizardPage() {
  const router = useRouter();
  const store = useWizardStore();
  const { step, setStep, setPrefs, reset } = store;

  const next = () => setStep(Math.min(step + 1, WIZARD_STEPS.length - 1));
  const prev = () => setStep(Math.max(step - 1, 0));
  const finish = () => router.push("/wizard/results");
  const safeStep = Math.min(Math.max(step, 0), WIZARD_STEPS.length - 1);
  const isSummary = safeStep === WIZARD_STEPS.length - 1;
  const footerVisible = useFooterVisible();

  useEffect(() => {
    if (step !== safeStep) setStep(safeStep);
  }, [step, safeStep, setStep]);

  const toggleTag = (tag: string) => {
    const current = store.tags ?? [];
    setPrefs({
      tags: current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    });
  };

  const handleReset = () => reset();

  return (
    <>
      <WizardHero />

      <div className="sticky top-[72px] z-20 border-b border-border bg-white/90 backdrop-blur-md">
        <WizardResetButton onReset={handleReset} />
        <WizardProgress step={safeStep} />
      </div>

      <div className={cn("px-4 py-12", !footerVisible && "pb-28")}>
        <div className="mx-auto max-w-3xl">
          {safeStep === 0 && (
            <RegionStep
              region={store.region}
              regionGroup={store.regionGroup}
              onSelect={({ region, regionGroup }) => setPrefs({ region, regionGroup })}
            />
          )}
          {safeStep === 1 && (
            <DifficultyStep
              difficultyLabel={store.difficultyLabel}
              onSelect={(label, value) => setPrefs({ difficultyLabel: label, difficulty: value as Difficulty })}
            />
          )}
          {safeStep === 2 && (
            <AccessibilityStep
              accessibility={store.accessibility}
              onSelect={(value) => setPrefs({ accessibility: value })}
            />
          )}
          {safeStep === 3 && (
            <TripTypeStep tripType={store.tripType} onSelect={(value) => setPrefs({ tripType: value })} />
          )}
          {safeStep === 4 && (
            <TagsStep
              tags={store.tags ?? []}
              onToggle={toggleTag}
              onClearAll={() => setPrefs({ tags: [] })}
            />
          )}
          {safeStep === 5 && (
            <SpecialPreferencesStep
              wetTrip={store.wetTrip ?? false}
              maxBudget={store.maxBudget ?? 0}
              durationHours={store.durationHours ?? 0}
              onWetTripChange={(wetTrip) => setPrefs({ wetTrip })}
              onMaxBudgetChange={(maxBudget) => setPrefs({ maxBudget })}
              onDurationChange={(durationHours) => setPrefs({ durationHours })}
            />
          )}
          {safeStep === 6 && <SummaryStep prefs={store} />}

          <WizardNav
            step={safeStep}
            isSummary={isSummary}
            onPrev={prev}
            onNext={next}
            onFinish={finish}
          />
        </div>
      </div>
    </>
  );
}
