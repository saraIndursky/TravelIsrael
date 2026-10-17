"use client";

import type { Difficulty } from "@/types";
import { useDifficultyLevels } from "@/hooks/use-levels";
import { WizardSelectionButton } from "../wizard-selection-button";
import { WizardStepHeading } from "../wizard-step-heading";

interface DifficultyStepProps {
  difficulty?: Difficulty;
  onSelect: (label: string, value: Difficulty) => void;
}

export function DifficultyStep({ difficulty, onSelect }: DifficultyStepProps) {
  const levels = useDifficultyLevels();

  return (
    <div>
      <WizardStepHeading title="מה רמת הקושי המתאימה?" subtitle="בחרו את רמת האתגר הרצויה" />
      <div className="space-y-4">
        {levels.map((level) => (
          <WizardSelectionButton
            key={level.code}
            selected={difficulty === level.code}
            description={level.description}
            onClick={() => onSelect(level.name, level.code)}
          >
            {level.name}
          </WizardSelectionButton>
        ))}
      </div>
    </div>
  );
}
