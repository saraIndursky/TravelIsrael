"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="ti-container py-24 text-center space-y-6">
      <h1 className="text-3xl font-light">משהו השתבש</h1>
      <p className="text-muted-foreground">אירעה שגיאה בלתי צפויה</p>
      <div className="flex justify-center gap-3">
        <Button className="rounded-xl" onClick={reset}>נסה שוב</Button>
        <Link href="/"><Button variant="outline" className="rounded-xl">דף הבית</Button></Link>
      </div>
    </div>
  );
}
