import { cn } from "@/lib/utils";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function PageShell({ title, subtitle, children, className, action }: PageShellProps) {
  return (
    <div className={cn("bg-white", className)}>
      <div className="border-b border-border/60 bg-white">
        <div className="ti-container py-10 md:py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              {subtitle && <p className="ti-section-subtitle">{subtitle}</p>}
              <h1 className="ti-section-title">{title}</h1>
            </div>
            {action}
          </div>
        </div>
      </div>
      <div className="ti-container py-8 md:py-10">{children}</div>
    </div>
  );
}
