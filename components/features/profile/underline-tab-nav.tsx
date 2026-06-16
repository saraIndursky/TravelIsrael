"use client";

import { cn } from "@/lib/utils";

export interface UnderlineTabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface UnderlineTabNavProps<T extends string> {
  tabs: UnderlineTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function UnderlineTabNav<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: UnderlineTabNavProps<T>) {
  return (
    <nav className={cn("border-b border-border", className)} aria-label="ניווט טאבים">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
        {tabs.map((tab) => {
          const isActive = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={cn(
                "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
