"use client";

import { Label } from "@/components/ui/label";
import { COMMON_TAGS } from "@/types/enums";

interface CommonTagsFieldProps {
  selected: string[];
  onChange: (tags: string[]) => void;
  error?: string;
}

export function CommonTagsField({ selected, onChange, error }: CommonTagsFieldProps) {
  return (
    <div>
      <Label>תגיות</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {COMMON_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() =>
              onChange(
                selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]
              )
            }
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              selected.includes(tag)
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-[#e5e7eb] text-[#6b7280] hover:border-[#d1d5db]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
