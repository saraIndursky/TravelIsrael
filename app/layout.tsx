import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { BackButton } from "@/components/layout/back-button";
import { Footer } from "@/components/layout/footer";
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
      <body className={`${rubik.className} min-h-screen flex flex-col`}>        <AuthSyncProvider>
          <Header />
          <BackButton />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </AuthSyncProvider>
      </body>
    </html>
  );
}
