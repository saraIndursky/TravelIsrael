import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const oauthErrorDescription = searchParams.get("error_description");
  let next = searchParams.get("next") ?? "/";

  if (!next.startsWith("/")) {
    next = "/";
  }

  if (oauthError) {
    const message = encodeURIComponent(oauthErrorDescription ?? oauthError);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?message=${message}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error?message=${encodeURIComponent("missing_code")}`);
  }

  const redirectUrl = `${origin}${next}`;
  let response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const message = encodeURIComponent(error.message);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?message=${message}`);
  }

  return response;
}
