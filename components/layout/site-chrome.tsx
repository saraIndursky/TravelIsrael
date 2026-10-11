"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { BackButton } from "@/components/layout/back-button";
import { Footer } from "@/components/layout/footer";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:right-4 focus:top-4"
      >
        דלג לתוכן הראשי
      </a>
      <Header />
      {!isAdminPage && <BackButton />}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </>
  );
}
