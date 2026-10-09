"use client";

import RouteError from "@/components/layout/route-error";

export default function PlacesError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteError
      {...props}
      title="שגיאה בטעינת המקומות"
      description="לא הצלחנו לטעון את רשימת המקומות. נסו שוב."
    />
  );
}
