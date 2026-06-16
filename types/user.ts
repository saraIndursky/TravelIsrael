import type { UserRole } from "./enums";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
}
