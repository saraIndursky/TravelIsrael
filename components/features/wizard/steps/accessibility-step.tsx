"use client";

import { ACCESSIBILITY_OPTIONS } from "../wizard-constants";
import { WizardSelectionButton } from "../wizard-selection-button";
import { WizardStepHeading } from "../wizard-step-heading";

interface AccessibilityStepProps {
  accessibility?: number;
  onSelect: (value: number) => void;
}

export function AccessibilityStep({ accessibility, onSelect }: AccessibilityStepProps) {
  return (
    <div>
      <WizardStepHeading title="מהי רמת נגישות המתאימה?" subtitle="בחרו את רמת הנגישות הרצויה" />
      <div className="space-y-4">
        {ACCESSIBILITY_OPTIONS.map((opt) => (
          <WizardSelectionButton
            key={opt.value}
            selected={accessibility === opt.value}
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
          </WizardSelectionButton>
        ))}
      </div>
    </div>
  );
}
