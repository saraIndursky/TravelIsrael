import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPanelProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function AdminPanel({ title, description, icon: Icon, children, className }: AdminPanelProps) {
  return (
    <section className={cn("ti-card", className)}>
      {(title || description) && (
        <div className="border-b border-border/60 px-5 py-4 md:px-6">
          {title && (
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              {Icon && <Icon className="h-4 w-4 text-primary" aria-hidden />}
              {title}
            </h2>
          )}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}
