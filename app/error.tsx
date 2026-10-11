"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-20">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden />
        </div>
        <p className="mb-2 text-sm font-semibold text-destructive">שגיאה</p>
        <h1 className="mb-3 text-3xl font-light text-foreground">משהו השתבש</h1>
        <p className="mb-10 text-sm leading-relaxed text-muted-foreground md:text-base">
          אירעה שגיאה בלתי צפויה. אפשר לנסות שוב או לחזור לדף הבית.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button className="min-w-[160px] rounded-xl" onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            נסו שוב
          </Button>
          <Link href="/">
            <Button variant="outline" className="min-w-[160px] rounded-xl">
              <Home className="h-4 w-4" />
              דף הבית
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
