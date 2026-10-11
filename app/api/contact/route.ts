import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { isRateLimited } from "@/lib/server/rate-limit";
import { contactSchema } from "@/lib/validations/contact";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br />");
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "הפרטים שהוזנו אינם תקינים";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }

  const { name, email, subject, message, website } = parsed.data;

  // Honeypot filled: pretend it worked so bots don't learn anything.
  if (website && website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (isRateLimited(`contact:${clientKey(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      { ok: false, message: "נשלחו הרבה פניות בזמן קצר. נסו שוב בעוד כמה דקות." },
      { status: 429 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    subject,
    message,
    user_id: user?.id ?? null,
  });

  if (error) {
    return NextResponse.json({ ok: false, message: "לא הצלחנו לשמור את ההודעה. נסו שוב מאוחר יותר." }, { status: 500 });
  }

  // Optional e-mail notification; the message is already stored, so a failure here is harmless.
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL?.trim();
  if (recipient) {
    void sendEmail({
      to: recipient,
      replyTo: email,
      subject: `פנייה חדשה מהאתר: ${subject}`,
      html: `<div dir="rtl" style="font-family:Arial,sans-serif">
        <h2>פנייה חדשה מטופס יצירת הקשר</h2>
        <p><strong>שם:</strong> ${escapeHtml(name)}</p>
        <p><strong>אימייל:</strong> ${escapeHtml(email)}</p>
        <p><strong>נושא:</strong> ${escapeHtml(subject)}</p>
        <p><strong>הודעה:</strong><br />${escapeHtml(message)}</p>
      </div>`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
