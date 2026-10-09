import "server-only";

import { Resend } from "resend";
import { getResendApiKey, getResendFromEmail, isEmailConfigured } from "@/lib/email/env";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!isEmailConfigured()) return null;
  if (!client) {
    client = new Resend(getResendApiKey()!);
  }
  return client;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const resend = getClient();
  if (!resend) return false;

  const { error } = await sendWithResend(resend, input);
  return !error;
}

async function sendWithResend(
  resend: Resend,
  input: { to: string; subject: string; html: string }
) {
  return resend.emails.send({
    from: getResendFromEmail(),
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}
