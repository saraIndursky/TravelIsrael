import {
  AlertCircle,
  BarChart3,
  Check,
  Edit3,
  Eye,
  RotateCcw,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Status } from "@/types";

export interface AdminActionItem {
  icon: LucideIcon;
  label: string;
  color: string;
  action: () => void;
}

export interface AdminMobileActions {
  primary: {
    label: string;
    icon: LucideIcon;
    action: () => void;
    className: string;
  } | null;
  secondary: { icon: LucideIcon; action: () => void; className: string }[];
}

interface ActionHandlers<T> {
  onView: (item: T) => void;
  onApprove: (item: T) => void;
  onReject: (item: T) => void;
  onUnpublish?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete: (item: T) => void;
  onRestore: (item: T) => void;
  onStats?: (item: T) => void;
  onViewReject: (item: T) => void;
  onViewRemoval?: (item: T) => void;
}

export function getAdminActionsByStatus<T extends { status: Status }>(
  item: T,
  handlers: ActionHandlers<T>
): AdminActionItem[] {
  const { onView, onApprove, onReject, onUnpublish, onEdit, onDelete, onRestore, onStats, onViewReject, onViewRemoval } =
    handlers;

  switch (item.status) {
    case "pending":
      return [
        { icon: Eye, action: () => onView(item), label: "צפייה", color: "text-blue-600 hover:bg-blue-100" },
        { icon: Check, action: () => onApprove(item), label: "אשר", color: "text-green-600 hover:bg-green-100" },
        { icon: X, action: () => onReject(item), label: "דחה", color: "text-red-600 hover:bg-red-100" },
      ];
    case "approved":
      return [
        ...(onStats
          ? [{ icon: BarChart3, action: () => onStats(item), label: "סטטיסטיקות", color: "text-purple-600 hover:bg-purple-100" }]
          : []),
        { icon: Eye, action: () => onView(item), label: "צפייה", color: "text-blue-600 hover:bg-blue-100" },
        ...(onEdit
          ? [{ icon: Edit3, action: () => onEdit(item), label: "ערוך", color: "text-indigo-600 hover:bg-indigo-100" }]
          : []),
        { icon: X, action: () => (onUnpublish ?? onReject)(item), label: "הסר מהאתר", color: "text-red-600 hover:bg-red-100" },
      ];
    case "removed":
      return [
        { icon: Eye, action: () => onView(item), label: "צפייה", color: "text-blue-600 hover:bg-blue-100" },
        { icon: RotateCcw, action: () => onRestore(item), label: "החזר לבדיקה", color: "text-green-600 hover:bg-green-100" },
        {
          icon: AlertCircle,
          action: () => (onViewRemoval ?? onViewReject)(item),
          label: "סיבת ההסרה",
          color: "text-red-600 hover:bg-red-100",
        },
      ];
    case "rejected":
      return [
        { icon: Eye, action: () => onView(item), label: "צפייה", color: "text-blue-600 hover:bg-blue-100" },
        { icon: RotateCcw, action: () => onRestore(item), label: "שחזר", color: "text-green-600 hover:bg-green-100" },
        { icon: AlertCircle, action: () => onViewReject(item), label: "עילת הדחייה", color: "text-red-600 hover:bg-red-100" },
        { icon: Trash2, action: () => onDelete(item), label: "מחק", color: "text-red-600 hover:bg-red-100" },
      ];
    default:
      return [
        { icon: Eye, action: () => onView(item), label: "צפייה", color: "text-blue-600 hover:bg-blue-100" },
        ...(onEdit
          ? [{ icon: Edit3, action: () => onEdit(item), label: "ערוך", color: "text-indigo-600 hover:bg-indigo-100" }]
          : []),
      ];
  }
}

export function getAdminMobileActions<T extends { status: Status }>(
  item: T,
  handlers: ActionHandlers<T>
): AdminMobileActions {
  const { onView, onApprove, onReject, onUnpublish, onEdit, onDelete, onRestore, onStats, onViewReject, onViewRemoval } =
    handlers;

  switch (item.status) {
    case "pending":
      return {
        primary: { label: "אשר", icon: Check, action: () => onApprove(item), className: "text-green-700 bg-green-100" },
        secondary: [
          { icon: X, action: () => onReject(item), className: "text-red-600 bg-red-100" },
          { icon: Eye, action: () => onView(item), className: "text-blue-600 bg-blue-100" },
        ],
      };
    case "approved":
      return {
        primary: onStats
          ? { label: "סטטיסטיקות", icon: BarChart3, action: () => onStats(item), className: "text-purple-700 bg-purple-100" }
          : { label: "צפייה", icon: Eye, action: () => onView(item), className: "text-blue-700 bg-blue-100" },
        secondary: [
          ...(onStats ? [{ icon: Eye, action: () => onView(item), className: "text-blue-600 bg-blue-100" }] : []),
          ...(onEdit ? [{ icon: Edit3, action: () => onEdit(item), className: "text-indigo-600 bg-indigo-100" }] : []),
          { icon: X, action: () => (onUnpublish ?? onReject)(item), className: "text-red-600 bg-red-100" },
        ],
      };
    case "removed":
      return {
        primary: { label: "החזר לבדיקה", icon: RotateCcw, action: () => onRestore(item), className: "text-green-700 bg-green-100" },
        secondary: [
          { icon: AlertCircle, action: () => (onViewRemoval ?? onViewReject)(item), className: "text-red-600 bg-red-100" },
          { icon: Eye, action: () => onView(item), className: "text-blue-600 bg-blue-100" },
        ],
      };
    case "rejected":
      return {
        primary: { label: "שחזר", icon: RotateCcw, action: () => onRestore(item), className: "text-green-700 bg-green-100" },
        secondary: [
          { icon: AlertCircle, action: () => onViewReject(item), className: "text-red-600 bg-red-100" },
          { icon: Eye, action: () => onView(item), className: "text-blue-600 bg-blue-100" },
          { icon: Trash2, action: () => onDelete(item), className: "text-red-600 bg-red-100" },
        ],
      };
    default:
      return {
        primary: { label: "צפייה", icon: Eye, action: () => onView(item), className: "text-blue-700 bg-blue-100" },
        secondary: onEdit ? [{ icon: Edit3, action: () => onEdit(item), className: "text-indigo-600 bg-indigo-100" }] : [],
      };
  }
}
