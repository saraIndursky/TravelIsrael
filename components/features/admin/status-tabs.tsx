"use client";

import type { Status } from "@/types";
import { STATUS_LABELS } from "@/types/enums";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StatusTabsProps {
  value: Status | "all";
  onChange: (status: Status | "all") => void;
  counts?: Partial<Record<Status | "all", number>>;
  children: (status: Status | "all") => React.ReactNode;
}

const statuses: (Status | "all")[] = ["all", "draft", "pending", "approved", "rejected"];

export function StatusTabs({ value, onChange, counts, children }: StatusTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as Status | "all")}>
      <TabsList className="w-full flex-wrap h-auto gap-1">
        {statuses.map((s) => (
          <TabsTrigger key={s} value={s} className="text-xs sm:text-sm">
            {s === "all" ? "הכל" : STATUS_LABELS[s]}
            {counts?.[s] !== undefined && ` (${counts[s]})`}
          </TabsTrigger>
        ))}
      </TabsList>
      {statuses.map((s) => (
        <TabsContent key={s} value={s}>{children(s)}</TabsContent>
      ))}
    </Tabs>
  );
}
