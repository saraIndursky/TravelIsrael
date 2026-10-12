"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { Check, WIZARD_STEPS } from "./wizard-constants";

interface WizardProgressProps {
  step: number;
}

export function WizardProgress({ step }: WizardProgressProps) {
  return (
    <nav aria-label="התקדמות בתכנון" className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((s, index) => {
          const Icon = s.icon;
          const isCompleted = index < step;
          const isActive = index === step;

          return (
            <Fragment key={s.key}>
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-all md:h-10 md:w-10",
                    (isCompleted || isActive) && "bg-primary text-primary-foreground",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 hidden whitespace-nowrap text-xs font-medium md:block",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {index < WIZARD_STEPS.length - 1 && (
                <div className="mx-1 h-0.5 flex-1 bg-border md:mx-2">
                  <div className={cn("h-full transition-all", isCompleted ? "bg-primary" : "bg-transparent")} />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs font-medium text-foreground md:hidden">{WIZARD_STEPS[step]?.label}</p>
    </nav>
  );
}
