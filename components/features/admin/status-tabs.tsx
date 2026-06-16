"use client";

import type { Status } from "@/types";
import { STATUS_LABELS } from "@/types/enums";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
      <TabsList className="mb-4 h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/60 p-1">
        {statuses.map((s) => (
          <TabsTrigger
            key={s}
            value={s}
            className={cn(
              "rounded-lg px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
            )}
          >
            {s === "all" ? "הכל" : STATUS_LABELS[s]}
            {counts?.[s] !== undefined && (
              <span className="mr-1.5 text-muted-foreground">({counts[s]})</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {statuses.map((s) => (
        <TabsContent key={s} value={s} className="mt-0">
          {children(s)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
