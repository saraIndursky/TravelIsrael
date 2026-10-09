"use client";

import { AdminRegionsListPage } from "@/components/features/admin/admin-regions-list-page";
import { useAuthStore } from "@/hooks/use-stores";

export default function AdminRegionsPage() {
  const { role } = useAuthStore();

  if (role !== "admin") return null;

  return <AdminRegionsListPage />;
}
