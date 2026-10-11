/**
 * Shared logic for "open" type lists (place types, trail types): a fixed base set plus any type
 * that appears on approved content. A user who can't find a fitting type picks "אחר" and writes
 * a new one; it becomes available to everyone once an admin approves the content that uses it.
 */

export const OTHER_TYPE = "אחר";
export const MAX_TYPE_LENGTH = 30;

export interface TypeHelpers {
  base: readonly string[];
  /** Trims, collapses whitespace and limits the length of a user supplied type. */
  normalize: (raw: string) => string;
  /** Base types first, then types found on approved content (alphabetical), never "אחר". */
  buildOptions: (approvedTypes: readonly string[]) => string[];
  /** Reuses the canonical spelling of an existing type (ignoring case); "" for blank input. */
  resolve: (raw: string, options: readonly string[]) => string;
  /** True when a type is neither a base type nor used by any approved content. */
  isNew: (type: string, approvedTypes: readonly string[]) => boolean;
}

export function normalizeType(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_TYPE_LENGTH);
}

export function createTypeHelpers(base: readonly string[]): TypeHelpers {
  const baseSet = new Set<string>(base);

  const buildOptions = (approvedTypes: readonly string[]): string[] => {
    const extras = new Set<string>();
    for (const type of approvedTypes) {
      const value = normalizeType(type);
      if (value && value !== OTHER_TYPE && !baseSet.has(value)) extras.add(value);
    }
    return [...base, ...Array.from(extras).sort((a, b) => a.localeCompare(b, "he"))];
  };

  return {
    base,
    normalize: normalizeType,
    buildOptions,
    resolve: (raw, options) => {
      const value = normalizeType(raw);
      if (!value) return "";
      return options.find((option) => option.toLowerCase() === value.toLowerCase()) ?? value;
    },
    isNew: (type, approvedTypes) => {
      const value = normalizeType(type);
      if (!value || value === OTHER_TYPE) return false;
      return !buildOptions(approvedTypes).includes(value);
    },
  };
}
