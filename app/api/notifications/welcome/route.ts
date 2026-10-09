import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/templates";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ ok: false, message: "לא מחובר" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  const sent = await sendWelcomeEmail({
    to: user.email,
    name: profile?.name?.trim() || "מטייל/ת",
  });

  return NextResponse.json({ ok: sent });
}
