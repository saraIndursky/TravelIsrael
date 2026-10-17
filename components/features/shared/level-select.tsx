"use client";

import type { SelectHTMLAttributes } from "react";
import { Label } from "@/components/ui/label";

export interface LevelOption {
  value: string;
  label: string;
  description: string;
}

interface LevelSelectProps {
  id: string;
  label: string;
  options: readonly LevelOption[];
  /** The currently selected value, used to show its explanation under the field. */
  value: string | number | undefined;
  /** Props from react-hook-form's `register(...)`. */
  selectProps: SelectHTMLAttributes<HTMLSelectElement>;
  className?: string;
  error?: string;
  /** Title of the expandable list that explains every level. */
  helpTitle?: string;
}

/**
 * A dropdown for an ordered scale (accessibility, difficulty). Under it the explanation of the
 * chosen level is shown, and a collapsible list explains how all the levels differ.
 */
export function LevelSelect({
  id,
  label,
  options,
  value,
  selectProps,
  className,
  error,
  helpTitle = "מה ההבדל בין הרמות?",
}: LevelSelectProps) {
  const selected = options.find((option) => option.value === String(value));

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select id={id} className={className} {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {selected?.description && (
        <p className="mt-2 rounded-lg bg-[#f3f4f6] px-3 py-2 text-sm leading-relaxed text-[#374151]">
          <span className="font-medium text-[#111827]">{selected.label.replace(/^\d+ — /, "")}: </span>
          {selected.description}
        </p>
      )}
      <details className="mt-2 text-sm text-[#4b5563]">
        <summary className="cursor-pointer select-none font-medium text-[#111827] underline-offset-2 hover:underline">
          {helpTitle}
        </summary>
        <ul className="mt-2 space-y-1.5">
          {options.map((option) => (
            <li key={option.value}>
              <span className="font-medium text-[#111827]">{option.label}:</span> {option.description}
            </li>
          ))}
        </ul>
      </details>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
