import { redirect } from "next/navigation";

/** Legacy URL — "my trips" moved to /profile/content */
export default function ProfileTripsPage() {
  redirect("/profile/content");
}
