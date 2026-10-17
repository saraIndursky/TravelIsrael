"use client";

import { useAccessibilityLevels } from "@/hooks/use-levels";
import { WizardSelectionButton } from "../wizard-selection-button";
import { WizardStepHeading } from "../wizard-step-heading";

interface AccessibilityStepProps {
  accessibility?: number;
  onSelect: (value: number) => void;
}

export function AccessibilityStep({ accessibility, onSelect }: AccessibilityStepProps) {
  const levels = useAccessibilityLevels();

  return (
    <div>
      <WizardStepHeading
        title="מהי רמת נגישות המתאימה?"
        subtitle="בחרו את רמת הנגישות הרצויה. טיולים ברמה שבחרתם ומעלה יתאימו יותר"
      />
      <div className="space-y-4">
        {levels.map((level) => (
          <WizardSelectionButton
            key={level.level}
            selected={accessibility === level.level}
            description={level.description}
            onClick={() => onSelect(level.level)}
          >
            {level.name}
          </WizardSelectionButton>
        ))}
      </div>
    </div>
  );
}
