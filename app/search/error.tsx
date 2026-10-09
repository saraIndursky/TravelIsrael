"use client";

import RouteError from "@/components/layout/route-error";

export default function SearchError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteError
      {...props}
      title="שגיאה בחיפוש"
      description="לא הצלחנו לטעון את תוצאות החיפוש. נסו שוב."
    />
  );
}
