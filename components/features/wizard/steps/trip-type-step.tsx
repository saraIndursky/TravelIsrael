"use client";

import { TRIP_TYPE_OPTIONS } from "../wizard-constants";
import { WizardSelectionButton } from "../wizard-selection-button";
import { WizardStepHeading } from "../wizard-step-heading";

interface TripTypeStepProps {
  tripType?: string;
  onSelect: (value: string) => void;
}

export function TripTypeStep({ tripType, onSelect }: TripTypeStepProps) {
  return (
    <div>
      <WizardStepHeading title="סוג הטיול" />
      <div className="space-y-4">
        {TRIP_TYPE_OPTIONS.map((opt) => (
          <WizardSelectionButton key={opt} selected={tripType === opt} onClick={() => onSelect(opt)}>
            {opt}
          </WizardSelectionButton>
        ))}
      </div>
    </div>
  );
}
