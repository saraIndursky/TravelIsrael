"use client";

import { cn } from "@/lib/utils";

interface WizardSelectionButtonProps {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** Explains the option, shown in smaller text under its name. */
  description?: string;
  className?: string;
}

export function WizardSelectionButton({
  selected,
  onClick,
  children,
  description,
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
      {description && (
        <span className="mt-1 block text-sm font-normal leading-relaxed text-muted-foreground">{description}</span>
      )}
    </button>
  );
}
