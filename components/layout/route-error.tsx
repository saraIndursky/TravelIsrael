"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export default function RouteError({
  reset,
  title = "משהו השתבש",
  description = "אירעה שגיאה בלתי צפויה. אפשר לנסות שוב או לחזור לדף הבית.",
}: RouteErrorProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden />
        </div>
        <h1 className="mb-3 text-2xl font-light text-foreground md:text-3xl">{title}</h1>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button className="rounded-xl" onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            נסה שוב
          </Button>
          <Link href="/">
            <Button variant="outline" className="rounded-xl">
              <Home className="h-4 w-4" />
              דף הבית
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
