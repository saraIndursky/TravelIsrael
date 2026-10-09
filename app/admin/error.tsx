"use client";

import RouteError from "@/components/layout/route-error";

export default function AdminError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteError
      {...props}
      title="שגיאה בפאנל הניהול"
      description="לא הצלחנו לטעון את פאנל הניהול. נסו שוב."
    />
  );
}
