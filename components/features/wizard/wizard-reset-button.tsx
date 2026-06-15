"use client";

import { RotateCcw } from "lucide-react";

interface WizardResetButtonProps {
  onReset: () => void;
}

export function WizardResetButton({ onReset }: WizardResetButtonProps) {
  return (
    <div className="mx-auto flex max-w-5xl justify-end px-4 pb-2 pt-4">
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/30 hover:text-foreground"
      >
        <RotateCcw className="h-4 w-4" />
        ניקוי הגדרות
      </button>
    </div>
  );
}
