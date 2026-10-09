"use client";

import RouteError from "@/components/layout/route-error";

export default function TrailsError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteError
      {...props}
      title="שגיאה בטעינת המסלולים"
      description="לא הצלחנו לטעון את רשימת המסלולים. נסו שוב."
    />
  );
}
