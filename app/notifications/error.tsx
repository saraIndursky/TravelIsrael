"use client";

import RouteError from "@/components/layout/route-error";

export default function NotificationsError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      {...props}
      title="שגיאה בהתראות"
      description="לא הצלחנו לטעון את ההתראות. נסו שוב."
    />
  );
}
