import type { Metadata } from "next";
import { LIST_PAGE_METADATA } from "@/lib/seo/metadata";

export const metadata: Metadata = LIST_PAGE_METADATA.wizard;

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
