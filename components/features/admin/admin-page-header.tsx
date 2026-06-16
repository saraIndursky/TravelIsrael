interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}
