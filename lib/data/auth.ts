import type { User, UserRole } from "@/types";
import { DEMO_USER_ID, seedUsers } from "@/data/seed";
import { getStore, updateStore } from "./store";

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
      return { ...store, currentRole: "guest" };
    }
    const userId = role === "admin" ? "admin-1" : DEMO_USER_ID;
    return { ...store, currentRole: role, currentUserId: userId };
  });
  return getCurrentUser();
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
