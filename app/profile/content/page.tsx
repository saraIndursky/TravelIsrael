import type { Metadata } from "next";
import { ProfileContentClient } from "@/components/features/profile/profile-content-client";

export const metadata: Metadata = {
  title: "התוכן שלי — TravelIsrael",
  description: "טיולים, מקומות ומסלולים שיצרת ומועדפים",
};

export default function ProfileContentPage() {
  return <ProfileContentClient />;
}
