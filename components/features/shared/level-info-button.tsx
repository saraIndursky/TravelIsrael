"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";

interface LevelInfoButtonProps {
  /** The level, e.g. "נגישות בינונית". */
  title: string;
  /** What the level means. */
  description: string;
  /** How the value of a trip is worked out, shown in smaller text under the description. */
  note?: string;
}

/**
 * A small "i" in the corner of an info card. It opens a short explanation of the level shown on
 * the card, without changing the layout around it (the panel floats under the card).
 */
export function LevelInfoButton({ title, description, note }: LevelInfoButtonProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`מה זה אומר: ${title}`}
        className="absolute left-2 top-2 inline-flex print:hidden h-6 w-6 items-center justify-center rounded-full text-[#9ca3af] transition-colors hover:bg-[#f3f4f6] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]"
      >
        <Info className="h-4 w-4" />
      </button>
      {open && (
        <div
          id={panelId}
          role="note"
          className="absolute inset-x-0 top-full z-30 mt-2 min-w-[14rem] rounded-lg border border-[#e5e7eb] bg-white p-3 text-right shadow-lg"
        >
          <p className="text-sm font-medium text-[#111827]">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#4b5563]">{description}</p>
          {note && <p className="mt-2 border-t border-[#f3f4f6] pt-2 text-xs leading-relaxed text-[#6b7280]">{note}</p>}
        </div>
      )}
    </div>
  );
}
