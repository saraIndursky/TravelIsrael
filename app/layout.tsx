import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/site-chrome";
import { Toaster } from "@/components/ui/toaster";
import { AuthSyncProvider } from "@/components/providers/auth-sync";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TravelIsrael — תכנון טיולים בישראל",
  description: "פלטפורמה לתכנון, גילוי ושיתוף טיולים בישראל",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${rubik.className} min-h-screen flex flex-col`}>
        <AuthSyncProvider>
          <SiteChrome>{children}</SiteChrome>
          <Toaster />
        </AuthSyncProvider>
      </body>
    </html>
  );
}
