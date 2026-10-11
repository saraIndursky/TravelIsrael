"use client";

import Link from "next/link";
import { useAuthStore } from "@/hooks/use-stores";

export function HomeCta() {
  const { role } = useAuthStore();

  return (
    <section className="bg-muted/40 py-16 md:py-20">
      <div className="ti-container text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-light">מוכנים להתחיל?</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          צרו חשבון והתחילו לתכנן את הטיול הבא שלכם היום
        </p>
        {role === "guest" ? (
          <Link href="/register" className="ti-btn-primary inline-block px-8 py-3.5 text-base">
            הצטרפות עכשיו
          </Link>
        ) : (
          <Link href="/trips/create" className="ti-btn-primary inline-block px-8 py-3.5 text-base">
            יצירת טיול חדש
          </Link>
        )}
      </div>
    </section>
  );
}
