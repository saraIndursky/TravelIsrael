"use client";

import type { Difficulty } from "@/types";
import { DIFFICULTY_OPTIONS } from "../wizard-constants";
import { WizardSelectionButton } from "../wizard-selection-button";
import { WizardStepHeading } from "../wizard-step-heading";

interface DifficultyStepProps {
  difficultyLabel?: string;
  onSelect: (label: string, value: Difficulty) => void;
}

export function DifficultyStep({ difficultyLabel, onSelect }: DifficultyStepProps) {
  return (
    <div>
      <WizardStepHeading title="מה רמת הקושי המתאימה?" subtitle="בחרו את רמת האתגר הרצויה" />
      <div className="space-y-4">
        {DIFFICULTY_OPTIONS.map((opt) => (
          <WizardSelectionButton
            key={opt.label}
            selected={difficultyLabel === opt.label}
            onClick={() => onSelect(opt.label, opt.value)}
          >
            {opt.label}
          </WizardSelectionButton>
        ))}
      </div>
    </div>
  );
}
