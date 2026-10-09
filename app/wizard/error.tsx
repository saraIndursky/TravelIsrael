"use client";

import RouteError from "@/components/layout/route-error";

export default function WizardError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteError
      {...props}
      title="שגיאה באשף"
      description="משהו השתבש באשף ההתאמה. נסו שוב או רעננו את הדף."
    />
  );
}
