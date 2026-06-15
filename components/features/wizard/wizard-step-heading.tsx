interface WizardStepHeadingProps {
  title: string;
  subtitle?: string;
}

export function WizardStepHeading({ title, subtitle }: WizardStepHeadingProps) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-light text-foreground">{title}</h2>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
