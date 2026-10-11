/**
 * Turns a user-entered website into a link that is safe to put in `href`: only http(s) addresses
 * are allowed (a bare "example.com" gets https://), anything else - `javascript:`, `data:`, ... -
 * returns null so no link is rendered.
 */
export function toSafeExternalUrl(raw: string | null | undefined): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
