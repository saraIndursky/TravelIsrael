/** Prefix for automated E2E test entities — hidden from admin by default. */
export const E2E_CONTENT_PREFIX = "E2E ";

export function isE2eTestContentName(name: string): boolean {
  return name.trimStart().startsWith(E2E_CONTENT_PREFIX);
}

/** E2E rows stay hidden unless the admin explicitly searches for the prefix. */
export function adminListShowsE2eContent(searchTerm: string): boolean {
  return isE2eTestContentName(searchTerm);
}
