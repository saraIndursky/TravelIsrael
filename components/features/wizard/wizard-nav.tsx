"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFooterVisible } from "@/hooks/use-footer-visible";

interface WizardNavProps {
  step: number;
  isSummary: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export function WizardNav({ step, isSummary, onPrev, onNext, onFinish }: WizardNavProps) {
  const isFirst = step === 0;
  const footerVisible = useFooterVisible();
  const isPinned = !footerVisible;

  return (
    <>
      {isPinned && <div className="h-20 shrink-0" aria-hidden="true" />}

      <nav
        aria-label="ניווט בתכנון"
        className={cn(
          "z-40 border-t border-border bg-white/95 py-5 backdrop-blur-md transition-shadow",
          isPinned
            ? "fixed inset-x-0 bottom-0 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
            : "relative mt-10 pt-8"
        )}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className={cn(
              "inline-flex items-center gap-2 rounded-sm px-6 py-3 text-sm font-medium transition-colors",
              isFirst ? "cursor-not-allowed text-muted-foreground/60" : "text-foreground hover:bg-muted"
            )}
          >
            <ArrowRight className="h-4 w-4" />
            הקודם
          </button>

          {!isSummary ? (
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              הבא
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex flex-wrap justify-end gap-3">
              <Link
                href="/trips/create"
                className="inline-flex items-center gap-2 rounded-sm border border-emerald-600 px-6 py-3 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                תכנן טיול אישי
                <Map className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={onFinish}
                className="inline-flex items-center gap-2 rounded-sm bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                מצא לי טיול
                <Compass className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
