"use client";

import { useId } from "react";
import { ChevronDown, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

function parseTime(value: string): { hours: string; minutes: string } {
  const [h = "09", m = "00"] = value.split(":");
  return {
    hours: h.padStart(2, "0").slice(0, 2),
    minutes: m.padStart(2, "0").slice(0, 2),
  };
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

interface TimeSegmentProps {
  id: string;
  ariaLabel: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function TimeSegment({ id, ariaLabel, value, options, onChange }: TimeSegmentProps) {
  return (
    <div className="relative">
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 w-[4.25rem] cursor-pointer appearance-none rounded-lg",
          "bg-[#f3f4f6] px-3 pr-7 text-center text-lg font-semibold tabular-nums tracking-wide text-[#111827]",
          "transition-colors hover:bg-[#e5e7eb]",
          "focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/15",
          "sm:w-[4.75rem]"
        )}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b7280]"
        aria-hidden
      />
    </div>
  );
}

export function TimeInput({ value, onChange, className, label }: TimeInputProps) {
  const baseId = useId();
  const { hours, minutes } = parseTime(value);
  const update = (h: string, m: string) => onChange(`${h}:${m}`);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label htmlFor={`${baseId}-hours`}>{label}</Label>}

      <div
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-xl border border-input bg-background px-3",
          "shadow-sm transition-shadow",
          "focus-within:border-[#111827]/30 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        )}
      >
        <Clock className="h-4 w-4 shrink-0 text-[#6b7280]" aria-hidden />

        <div dir="ltr" className="flex flex-1 items-center justify-end gap-2 sm:gap-2.5">
          <TimeSegment
            id={`${baseId}-hours`}
            ariaLabel="שעות"
            value={hours}
            options={HOURS}
            onChange={(h) => update(h, minutes)}
          />

          <span
            className="select-none pb-px text-xl font-light leading-none text-[#6b7280]"
            aria-hidden
          >
            :
          </span>

          <TimeSegment
            id={`${baseId}-minutes`}
            ariaLabel="דקות"
            value={minutes}
            options={MINUTES}
            onChange={(m) => update(hours, m)}
          />
        </div>
      </div>
    </div>
  );
}
