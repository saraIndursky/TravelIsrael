/**
 * Place types are an open list: a fixed base set plus any type that appears on an approved
 * place. A user who can't find a fitting type picks "אחר" and writes a new one; it becomes
 * available to everyone once an admin approves that place.
 */

export const OTHER_PLACE_TYPE = "אחר";
export const MAX_PLACE_TYPE_LENGTH = 30;

export const BASE_PLACE_TYPES = [
  "מוזיאון",
  "חוף",
  "אתר מורשת",
  "גן לאומי",
  "שוק",
  "עיר עתיקה",
  "מערה",
  "מרכז קניות",
  "מצודה",
  "פארק",
  "אתר דתי",
] as const;

/** Trims, collapses whitespace and limits the length of a user supplied type. */
export function normalizePlaceType(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_PLACE_TYPE_LENGTH);
}

/** Base types first, then types found on approved places (alphabetical), never "אחר". */
export function buildPlaceTypeOptions(approvedTypes: readonly string[]): string[] {
  const base = new Set<string>(BASE_PLACE_TYPES);
  const extras = new Set<string>();
  for (const type of approvedTypes) {
    const value = normalizePlaceType(type);
    if (value && value !== OTHER_PLACE_TYPE && !base.has(value)) extras.add(value);
  }
  return [...BASE_PLACE_TYPES, ...Array.from(extras).sort((a, b) => a.localeCompare(b, "he"))];
}

/**
 * Reuses the canonical spelling of an existing type when the user typed one that already
 * exists (ignoring case), so "Cave" and "cave" don't become two different types.
 */
export function resolvePlaceType(raw: string, options: readonly string[]): string {
  const value = normalizePlaceType(raw);
  if (!value) return "";
  const match = options.find((option) => option.toLowerCase() === value.toLowerCase());
  return match ?? value;
}

/** True when a place's type is neither a base type nor used by any approved place. */
export function isNewPlaceType(type: string, approvedTypes: readonly string[]): boolean {
  const value = normalizePlaceType(type);
  if (!value || value === OTHER_PLACE_TYPE) return false;
  return !buildPlaceTypeOptions(approvedTypes).includes(value);
}
