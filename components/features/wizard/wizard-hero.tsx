import { Compass } from "lucide-react";

export function WizardHero() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Compass className="h-8 w-8" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-light text-foreground md:text-5xl">נתכנן את המסלול המושלם עבורך</h1>
        <p className="mt-4 text-lg text-muted-foreground">בחרו העדפות, ואנחנו נדאג לשאר</p>
      </div>
    </section>
  );
}
