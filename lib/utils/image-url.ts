const WIKIMEDIA_PREFIX = "https://upload.wikimedia.org/wikipedia/commons/";
const PROXY_PATH = "/api/wiki-image?u=";

/**
 * Wikimedia throttles anonymous server-side hotlinking (HTTP 429), which is what the Next.js
 * image optimizer does. Those photos are served through our own cached proxy instead.
 */
export function toDisplayImageUrl(url: string): string {
  return url.startsWith(WIKIMEDIA_PREFIX) ? `${PROXY_PATH}${encodeURIComponent(url)}` : url;
}

/** Inverse of toDisplayImageUrl, so edits never persist the proxy path. */
export function toStoredImageUrl(url: string): string {
  if (!url.startsWith(PROXY_PATH)) return url;
  try {
    return decodeURIComponent(url.slice(PROXY_PATH.length));
  } catch {
    return url;
  }
}
