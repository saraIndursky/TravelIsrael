const ALLOWED_HOST = "upload.wikimedia.org";
const ALLOWED_PATH_PREFIX = "/wikipedia/commons/";

// Wikimedia throttles anonymous server-side hotlinking (HTTP 429), so we fetch with an
// identifying User-Agent and let the CDN cache the result for a year.
const MAX_BYTES = 12 * 1024 * 1024;
const USER_AGENT = "TravelIsraelStudentProject/1.0 (https://travel-israel.vercel.app)";

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get("u");
  if (!source) {
    return new Response("Missing image URL", { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(source);
  } catch {
    return new Response("Invalid image URL", { status: 400 });
  }

  if (target.protocol !== "https:" || target.hostname !== ALLOWED_HOST || !target.pathname.startsWith(ALLOWED_PATH_PREFIX)) {
    return new Response("Image host not allowed", { status: 400 });
  }

  // A redirect could lead off the allowed host, so redirects are not followed.
  let upstream: Response;
  try {
    upstream = await fetch(target, { headers: { "User-Agent": USER_AGENT }, redirect: "error" });
  } catch {
    return new Response("Image unavailable", { status: 502 });
  }
  const contentType = upstream.headers.get("content-type") ?? "";
  const length = Number(upstream.headers.get("content-length") ?? 0);
  if (!upstream.ok || !contentType.startsWith("image/") || length > MAX_BYTES) {
    return new Response("Image unavailable", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
