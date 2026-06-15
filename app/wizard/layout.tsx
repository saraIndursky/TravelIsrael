export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[calc(100dvh-72px)] flex-col bg-white">{children}</div>;
}
