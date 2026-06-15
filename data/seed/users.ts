import type { User } from "@/types";

export const seedUsers: User[] = [
  {
    id: "user-1",
    name: "שרה כהן",
    email: "sara@example.com",
    role: "user",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  {
    id: "user-2",
    name: "דוד לוי",
    email: "david@example.com",
    role: "user",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    id: "admin-1",
    name: "מנהל מערכת",
    email: "admin@travelisrael.co.il",
    role: "admin",
  },
];

export const DEMO_USER_ID = "user-1";
export const DEMO_ADMIN_ID = "admin-1";
