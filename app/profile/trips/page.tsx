import { redirect } from "next/navigation";

/** Legacy URL — תוכן הטיולים שלי עבר ל-/profile/content */
export default function ProfileTripsPage() {
  redirect("/profile/content");
}
