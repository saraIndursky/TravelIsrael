import type { User, UserRole } from "@/types";
import { DEMO_USER_ID, seedUsers } from "@/data/seed";
import { generateId, getStore, updateStore } from "./store";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const store = getStore();
  if (store.currentRole === "guest") return null;
  return store.users.find((u) => u.id === store.currentUserId) ?? seedUsers[0];
}

export async function getCurrentRole(): Promise<UserRole> {
  return getStore().currentRole;
}

export async function setDemoRole(role: UserRole): Promise<User | null> {
  updateStore((store) => {
    if (role === "guest") {
      return { ...store, currentRole: "guest", currentUserId: "" };
    }
    const userId = role === "admin" ? "admin-1" : DEMO_USER_ID;
    return { ...store, currentRole: role, currentUserId: userId };
  });
  return getCurrentUser();
}

export async function loginDemo(input: LoginInput): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const store = getStore();
  const user = store.users.find((u) => u.email.toLowerCase() === email);

  if (!user || !input.password.trim()) {
    throw new Error("אימייל או סיסמה שגויים");
  }

  updateStore((s) => ({
    ...s,
    currentRole: user.role,
    currentUserId: user.id,
  }));

  return user;
}

export async function registerDemo(input: RegisterInput): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const store = getStore();

  if (store.users.some((u) => u.email.toLowerCase() === email)) {
    throw new Error("כתובת האימייל כבר רשומה במערכת");
  }

  const newUser: User = {
    id: generateId("user"),
    name: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
    email,
    role: "user",
    created_at: new Date().toISOString(),
  };

  updateStore((s) => ({
    ...s,
    users: [...s.users, newUser],
    currentRole: "user",
    currentUserId: newUser.id,
  }));

  return newUser;
}

export async function getUsers(): Promise<User[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];
  return getStore().users;
}

export async function updateUserRole(userId: string, role: UserRole): Promise<User | null> {
  const currentRole = await getCurrentRole();
  if (currentRole !== "admin") return null;
  updateStore((store) => ({
    ...store,
    users: store.users.map((u) => (u.id === userId ? { ...u, role } : u)),
  }));
  return getStore().users.find((u) => u.id === userId) ?? null;
}

export function canViewStatus(
  status: string,
  createdBy: string,
  role: UserRole,
  userId: string | null
): boolean {
  if (role === "admin") return true;
  if (status === "approved") return true;
  if (role === "user" && userId && createdBy === userId) return true;
  return false;
}

export interface ProfileUpdateInput {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
}

export interface UserStatistics {
  joinDate: string;
  tripsCreated: number;
  tripsViews: number;
}

export async function updateProfile(input: ProfileUpdateInput): Promise<User> {
  const current = await getCurrentUser();
  if (!current) {
    throw new Error("יש להתחבר כדי לעדכן פרופיל");
  }

  const email = input.email.trim().toLowerCase();
  const store = getStore();
  const emailTaken = store.users.some(
    (u) => u.id !== current.id && u.email.toLowerCase() === email
  );
  if (emailTaken) {
    throw new Error("כתובת האימייל כבר בשימוש");
  }

  const name = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
  updateStore((s) => ({
    ...s,
    users: s.users.map((u) => (u.id === current.id ? { ...u, name, email } : u)),
  }));

  const updated = getStore().users.find((u) => u.id === current.id);
  if (!updated) {
    throw new Error("עדכון הפרטים נכשל");
  }
  return updated;
}

export async function changePassword(input: PasswordChangeInput): Promise<void> {
  const current = await getCurrentUser();
  if (!current) {
    throw new Error("יש להתחבר");
  }
  if (!input.currentPassword.trim()) {
    throw new Error("סיסמה נוכחית שגויה");
  }
  if (input.newPassword.length < 6) {
    throw new Error("הסיסמה חייבת להכיל לפחות 6 תווים");
  }
}

export async function getUserStatistics(): Promise<UserStatistics> {
  const current = await getCurrentUser();
  if (!current) {
    throw new Error("יש להתחבר");
  }

  const store = getStore();
  const userTrips = store.trips.filter((t) => t.created_by === current.id);

  return {
    joinDate: current.created_at ?? new Date().toISOString(),
    tripsCreated: userTrips.length,
    tripsViews: userTrips.reduce((sum, trip) => sum + (trip.views_count ?? 0), 0),
  };
}
