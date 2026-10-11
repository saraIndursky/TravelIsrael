"use client";

import type { Notification } from "@/types";
import { cn } from "@/lib/utils";

interface NotificationListItemProps {
  notification: Notification;
  formattedDate: string;
  compact?: boolean;
  onClick: () => void;
}

export function NotificationListItem({
  notification,
  formattedDate,
  compact = false,
  onClick,
}: NotificationListItemProps) {
  const isUnread = !notification.read_at;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full flex-col gap-1 text-right transition",
        compact ? "px-4 py-3" : "gap-1.5 px-5 py-4",
        isUnread
          ? "border-s-4 border-s-primary bg-primary/10 hover:bg-primary/[0.14]"
          : "border-s-4 border-s-gray-200 bg-gray-50/80 hover:bg-gray-100/80"
      )}
    >
      {isUnread && (
        <span
          className="absolute start-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
          aria-hidden
        />
      )}

      <div className={cn("flex items-start justify-between gap-2", isUnread && "pe-1")}>
        <span
          className={cn(
            "min-w-0 flex-1 text-right",
            compact ? "text-sm" : "text-base",
            isUnread ? "font-bold text-gray-900" : "font-normal text-gray-500"
          )}
        >
          {notification.title}
        </span>
        {isUnread ? (
          <span className="mt-0.5 shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            חדש
          </span>
        ) : (
          <span className="mt-0.5 shrink-0 text-[10px] font-medium text-gray-500">נקרא</span>
        )}
      </div>
      <span
        className={cn(
          "line-clamp-2 text-right leading-relaxed",
          compact ? "text-xs" : "text-sm",
          isUnread ? "font-medium text-gray-800" : "text-gray-500"
        )}
      >
        {notification.body}
      </span>
      <span
        className={cn(
          "text-right",
          compact ? "text-[11px]" : "text-xs",
          isUnread ? "text-gray-600" : "text-gray-600"
        )}
      >
        {formattedDate}
      </span>
    </button>
  );
}
