import type { Metadata } from "next";
import { ProfilePersonalArea } from "@/components/features/profile/profile-personal-area";

export const metadata: Metadata = {
  title: "האזור האישי — TravelIsrael",
  description: "צפייה ועדכון פרטים אישיים והגדרות חשבון",
};

export default function ProfilePage() {
  return <ProfilePersonalArea />;
}
