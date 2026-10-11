"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { getRegions } from "@/lib/data/regions";
import type { RegionRecord } from "@/types/region";
import {
  buildRegionPickerOptions,
  findSelectableRegion,
  regionOptionLabel,
} from "@/lib/utils/region-options";
import { MAX_TYPE_LENGTH, OTHER_TYPE, normalizeType } from "@/lib/utils/custom-types";

const inputClass =
  "w-full rounded-sm border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#111827] focus:border-[#111827] focus:outline-none";

interface RegionFieldProps {
  /** The region name (it doubles as the region code stored on the content). */
  value: string;
  onChange: (value: string) => void;
  /** Id of the parent region chosen for a brand new region. */
  parentId: string;
  onParentChange: (parentId: string) => void;
  error?: string;
}

/**
 * Hierarchical region picker (Israel → area → region). When no region fits, "אחר" lets the user
 * name a new region and choose the existing region that contains it; an admin reviews it later.
 */
export function RegionField({ value, onChange, parentId, onParentChange, error }: RegionFieldProps) {
  const [regions, setRegions] = useState<RegionRecord[]>([]);
  const [otherSelected, setOtherSelected] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    getRegions()
      .then((records) => {
        if (!cancelled) setRegions(records);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(() => buildRegionPickerOptions(regions), [regions]);
  const known = useMemo(
    () => (value ? findSelectableRegion(options, value) : undefined),
    [options, value]
  );

  // A saved region that isn't in the list (e.g. removed later) is shown as a new one.
  useEffect(() => {
    if (options.length > 0 && value && !known && !otherSelected) {
      setOtherSelected(true);
      setDraft(value);
    }
  }, [options.length, value, known, otherSelected]);

  const choice = otherSelected ? OTHER_TYPE : known?.code ?? "";

  function handleChoice(next: string) {
    if (next === OTHER_TYPE) {
      setOtherSelected(true);
      onChange(normalizeType(draft));
      return;
    }
    setOtherSelected(false);
    onChange(next);
  }

  function handleDraft(text: string) {
    setDraft(text);
    const existing = findSelectableRegion(options, text);
    if (existing?.code) {
      // The user typed a region that already exists: use it instead of proposing a duplicate.
      setOtherSelected(false);
      onChange(existing.code);
      return;
    }
    onChange(normalizeType(text));
  }

  return (
    <div>
      <Label>אזור</Label>
      <select className={inputClass} value={choice} onChange={(e) => handleChoice(e.target.value)}>
        <option value="">בחר אזור</option>
        {options.map((option) =>
          option.selectable && option.code ? (
            <option key={option.id} value={option.code}>
              {regionOptionLabel(option)}
            </option>
          ) : (
            <option key={option.id} value="" disabled>
              {regionOptionLabel(option)}
            </option>
          )
        )}
        <option value={OTHER_TYPE}>{OTHER_TYPE}</option>
      </select>

      {otherSelected && (
        <div className="mt-3 space-y-3 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-3">
          <div>
            <Label>שם האזור החדש</Label>
            <input
              type="text"
              className={inputClass}
              value={draft}
              maxLength={MAX_TYPE_LENGTH}
              onChange={(e) => handleDraft(e.target.value)}
              placeholder="למשל: תל אביב"
            />
          </div>
          <div>
            <Label>האזור שמכיל אותו</Label>
            <select
              className={inputClass}
              value={parentId}
              onChange={(e) => onParentChange(e.target.value)}
            >
              <option value="">בחר אזור אב</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {regionOptionLabel(option)}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-[#6b7280]">
            לא מצאת אזור מתאים? כתבי אותו ובחרי באיזה אזור הוא נמצא. אחרי שהמנהל יאשר את התוכן, האזור
            יתווסף לרשימה לכולם.
          </p>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
