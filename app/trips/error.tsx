"use client";

import RouteError from "@/components/layout/route-error";

export default function TripsError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteError
      {...props}
      title="שגיאה בטעינת הטיולים"
      description="לא הצלחנו לטעון את רשימת הטיולים. נסו שוב."
    />
  );
}
