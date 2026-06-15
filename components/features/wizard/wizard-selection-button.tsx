"use client";

import { cn } from "@/lib/utils";

interface WizardSelectionButtonProps {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function WizardSelectionButton({
  selected,
  onClick,
  children,
  className,
}: WizardSelectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-sm border-2 p-6 text-right transition-all",
        selected
          ? "scale-[1.01] border-primary bg-indigo-50 shadow-sm"
          : "border-border hover:border-muted-foreground/40",
        className
      )}
    >
      <span className="font-medium">{children}</span>
    </button>
  );
}
