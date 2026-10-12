import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { SPEC_HTML } from "@/lib/generated/spec-html";

/**
 * The spec document, hosted on the site but not public: the address contains a secret token
 * (SPEC_TOKEN) and the page asks for a password (SPEC_PASSWORD). Both live only in the host's
 * environment variables, never in the repository. Without them the route answers 404.
 */

export const dynamic = "force-dynamic";

const COOKIE = "spec_access";
const NO_INDEX = { "X-Robots-Tag": "noindex, nofollow, noarchive", "Cache-Control": "private, no-store" };

function config() {
  const token = process.env.SPEC_TOKEN?.trim();
  const password = process.env.SPEC_PASSWORD?.trim();
  return token && password ? { token, password } : null;
}

function accessValue(password: string, token: string): string {
  return createHash("sha256").update(`${password}:${token}`).digest("hex");
}

function same(a: string, b: string): boolean {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

function notFound() {
  return new NextResponse("Not found", { status: 404, headers: NO_INDEX });
}

function passwordPage(error: boolean) {
  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>מסמך אפיון — TravelIsrael</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1f33;font-family:"Segoe UI",Arial,sans-serif;color:#0f172a}
form{background:#fff;border-radius:22px;padding:34px 32px;width:min(380px,90vw);box-shadow:0 30px 80px rgba(0,0,0,.4)}
h1{font-size:24px;margin:0 0 6px}p{margin:0 0 20px;color:#475569;font-size:16px}
label{display:block;font-weight:600;margin-bottom:6px;font-size:15px}
input{width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #cbd5e1;border-radius:12px;font-size:17px;direction:ltr}
button{margin-top:16px;width:100%;padding:13px;border:0;border-radius:12px;background:#0f766e;color:#fff;font-size:17px;font-weight:700;cursor:pointer}
button:hover{background:#115e59}.err{color:#be123c;margin:12px 0 0;font-size:15px}
</style></head><body>
<form method="post"><h1>מסמך אפיון</h1><p>המסמך מוגן. הזינו את הסיסמה שנמסרה בהגשה.</p>
<label for="p">סיסמה</label><input id="p" name="password" type="password" autocomplete="off" autofocus required>
${error ? '<p class="err" role="alert">הסיסמה שגויה</p>' : ""}
<button type="submit">כניסה</button></form></body></html>`;
  return new NextResponse(html, { status: error ? 401 : 200, headers: { ...NO_INDEX, "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const cfg = config();
  if (!cfg || !same(params.token, cfg.token)) return notFound();

  const cookie = request.cookies.get(COOKIE)?.value ?? "";
  if (!same(cookie, accessValue(cfg.password, cfg.token))) return passwordPage(false);

  // the pin is served from the site itself, like the logo, so filters that block unknown images let it through
  const html = SPEC_HTML.replaceAll("../public/brand/pin.png", "/brand/pin.png").replaceAll("../app/icon.png", "/icon.png").replace(
    "<head>",
    '<head>\n<meta name="robots" content="noindex, nofollow">'
  );
  return new NextResponse(html, { headers: { ...NO_INDEX, "Content-Type": "text/html; charset=utf-8" } });
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const cfg = config();
  if (!cfg || !same(params.token, cfg.token)) return notFound();

  const form = await request.formData().catch(() => null);
  const given = String(form?.get("password") ?? "");
  if (!same(given, cfg.password)) {
    await new Promise((resolve) => setTimeout(resolve, 800)); // slows down guessing
    return passwordPage(true);
  }

  const response = NextResponse.redirect(new URL(request.url), 303);
  response.cookies.set(COOKIE, accessValue(cfg.password, cfg.token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/spec/${params.token}`,
    maxAge: 60 * 60 * 12,
  });
  Object.entries(NO_INDEX).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}
