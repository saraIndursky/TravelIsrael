"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { WIZARD_TAG_GROUPS } from "../wizard-constants";
import { WizardStepHeading } from "../wizard-step-heading";

interface TagsStepProps {
  tags: string[];
  onToggle: (tag: string) => void;
  onClearAll: () => void;
}

export function TagsStep({ tags, onToggle, onClearAll }: TagsStepProps) {
  return (
    <div>
      <WizardStepHeading
        title="מה חשוב לכם בטיול?"
        subtitle="בחרו מאפיינים שמתאימים לכם — ניתן לסמן כמה שרוצים. שלב זה אופציונלי"
      />

      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-primary/20 bg-indigo-50/60 px-4 py-3">
          <p className="text-sm text-foreground">
            נבחרו <span className="font-semibold">{tags.length}</span> תגיות
          </p>
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            נקה בחירה בשלב זה
          </button>
        </div>
      )}

      <div className="space-y-6">
        {WIZARD_TAG_GROUPS.map((group) => (
          <section key={group.label} className="rounded-sm border-2 border-border bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">{group.label}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.tags.map((tag) => {
                const selected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onToggle(tag)}
                    aria-pressed={selected}
                    className={cn(
                      "flex min-h-[52px] items-center justify-center gap-2 rounded-sm border-2 px-3 py-3 text-center text-sm font-medium transition-all",
                      selected
                        ? "border-primary bg-indigo-50 text-foreground shadow-sm"
                        : "border-border bg-muted/10 text-foreground hover:border-muted-foreground/40 hover:bg-muted/30"
                    )}
                  >
                    {selected && <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
