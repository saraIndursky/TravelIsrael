import {
  LayoutDashboard,
  Map,
  MapPin,
  Route,
  Flag,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "לוח בקרה", icon: LayoutDashboard, description: "סקירה כללית" },
  { href: "/admin/trips", label: "טיולים", icon: Map, description: "אישור ועריכת טיולים" },
  { href: "/admin/places", label: "מקומות", icon: MapPin, description: "ניהול מקומות" },
  { href: "/admin/trails", label: "מסלולים", icon: Route, description: "ניהול מסלולים" },
  { href: "/admin/reports", label: "דיווחים", icon: Flag, description: "טיפול בדיווחים" },
  { href: "/admin/users", label: "משתמשים", icon: Users, description: "תפקידי משתמשים" },
];
