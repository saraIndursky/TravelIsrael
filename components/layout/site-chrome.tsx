"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { BackButton } from "@/components/layout/back-button";
import { Footer } from "@/components/layout/footer";

const AUTH_PATHS = ["/login", "/register"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {!isAdminPage && <BackButton />}
      <main className="flex-1">{children}</main>
      {!isAdminPage && <Footer />}
    </>
  );
}
