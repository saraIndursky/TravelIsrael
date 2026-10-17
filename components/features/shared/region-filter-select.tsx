"use client";

import { useRegionFilterOptions } from "@/hooks/use-region-filter-options";

interface RegionFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  allLabel?: string;
}

/**
 * Region dropdown for filters. Shows the region hierarchy (areas with their sub-regions indented
 * under them); choosing an area also matches everything inside it.
 */
export function RegionFilterSelect({
  value,
  onChange,
  className,
  allLabel = "כל האזורים",
}: RegionFilterSelectProps) {
  const options = useRegionFilterOptions();
  // A region from an older link that is no longer in the list stays visible instead of vanishing.
  const known = !value || options.some((option) => option.value === value);

  return (
    <select aria-label="אזור" value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="">{allLabel}</option>
      {!known && <option value={value}>{value}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
