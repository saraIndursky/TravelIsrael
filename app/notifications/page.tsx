import type { Metadata } from "next";
import { Suspense } from "react";
import { NotificationsClient } from "@/components/features/notifications/notifications-client";
import { ListPageLoading } from "@/components/layout/list-page-loading";

export const metadata: Metadata = {
  title: "התראות — TravelIsrael",
  description: "עדכונים על אישור ודחייה של התוכן שלך",
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={<ListPageLoading />}>
      <NotificationsClient />
    </Suspense>
  );
}
