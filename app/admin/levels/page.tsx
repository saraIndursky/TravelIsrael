"use client";

import { AdminLevelsPage } from "@/components/features/admin/admin-levels-page";
import { useAuthStore } from "@/hooks/use-stores";

export default function AdminLevelsRoute() {
  const { role } = useAuthStore();

  if (role !== "admin") return null;

  return <AdminLevelsPage />;
}
