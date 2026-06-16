import type { User } from "@/types";

export const seedUsers: User[] = [
  {
    id: "user-1",
    name: "שרה כהן",
    email: "sara@example.com",
    role: "user",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    created_at: "2024-03-15T10:00:00.000Z",
  },
  {
    id: "user-2",
    name: "דוד לוי",
    email: "david@example.com",
    role: "user",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    created_at: "2024-06-01T08:00:00.000Z",
  },
  {
    id: "admin-1",
    name: "מנהל מערכת",
    email: "admin@travelisrael.co.il",
    role: "admin",
    created_at: "2023-01-10T12:00:00.000Z",
  },
];

export const DEMO_USER_ID = "user-1";
export const DEMO_ADMIN_ID = "admin-1";
