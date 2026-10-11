"use client";

import { useEffect, useId, useState } from "react";
import { Label } from "@/components/ui/label";
import { MAX_TYPE_LENGTH, OTHER_TYPE, type TypeHelpers } from "@/lib/utils/custom-types";

const inputClass =
  "w-full rounded-sm border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#111827] focus:border-[#111827] focus:outline-none";

interface CustomTypeFieldProps {
  label: string;
  helpers: TypeHelpers;
  /** Types used by approved content; they extend the base list for everyone. */
  loadApprovedTypes: () => Promise<string[]>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  newTypePlaceholder: string;
  newTypeHint: string;
}

/**
 * A type picker with an "אחר" escape hatch. Choosing "אחר" reveals a text field for a brand new
 * type; the new type is stored on the content itself and only joins the shared list once an
 * admin approves that content.
 */
export function CustomTypeField({
  label,
  helpers,
  loadApprovedTypes,
  value,
  onChange,
  error,
  newTypePlaceholder,
  newTypeHint,
}: CustomTypeFieldProps) {
  const selectId = useId();
  const draftId = useId();
  const [options, setOptions] = useState<string[]>(() => helpers.buildOptions([]));
  const [draft, setDraft] = useState(() => {
    const isKnown = helpers.base.includes(value);
    return value && value !== OTHER_TYPE && !isKnown ? value : "";
  });

  useEffect(() => {
    let cancelled = false;
    loadApprovedTypes()
      .then((types) => {
        if (!cancelled) setOptions(helpers.buildOptions(types));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A type that is not in the list (e.g. a new one waiting for approval) shows as "אחר" + text.
  const choice = !value ? "" : options.includes(value) ? value : OTHER_TYPE;

  function handleChoice(next: string) {
    onChange(next === OTHER_TYPE ? helpers.resolve(draft, options) || OTHER_TYPE : next);
  }

  function handleDraft(text: string) {
    setDraft(text);
    onChange(helpers.resolve(text, options) || OTHER_TYPE);
  }

  return (
    <div>
      <Label htmlFor={selectId}>{label}</Label>
      <select id={selectId} className={inputClass} value={choice} onChange={(e) => handleChoice(e.target.value)}>
        <option value="">בחר סוג</option>
        {options.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
        <option value={OTHER_TYPE}>{OTHER_TYPE}</option>
      </select>
      {choice === OTHER_TYPE && (
        <div className="mt-3">
          <Label htmlFor={draftId}>סוג חדש (לא חובה)</Label>
          <input
            id={draftId}
            type="text"
            className={inputClass}
            value={draft}
            maxLength={MAX_TYPE_LENGTH}
            onChange={(e) => handleDraft(e.target.value)}
            placeholder={newTypePlaceholder}
          />
          <p className="mt-1 text-xs text-[#6b7280]">{newTypeHint}</p>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
