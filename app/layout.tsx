import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/site-chrome";
import { Toaster } from "@/components/ui/toaster";
import { AuthSyncProvider } from "@/components/providers/auth-sync";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TravelIsrael — תכנון טיולים בישראל",
  description: "פלטפורמה לתכנון, גילוי ושיתוף טיולים בישראל",
  // proves to Google Search Console that this site is ours (the code is public by design)
  verification: { google: "u9DyR-ojuo3pwXPLWiCdN1_naJ3B7GhgoJxCjEwF7_Q" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${rubik.className} min-h-screen flex flex-col`}>
        <AuthSyncProvider>
          <SiteChrome>{children}</SiteChrome>
          <Toaster />
        </AuthSyncProvider>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
