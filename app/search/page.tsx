import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/features/search/search-client";
import { ListPageLoading } from "@/components/layout/list-page-loading";
import { LIST_PAGE_METADATA } from "@/lib/seo/metadata";

export const metadata: Metadata = LIST_PAGE_METADATA.search;

export default function SearchPage() {
  return (
    <Suspense fallback={<ListPageLoading />}>
      <SearchClient />
    </Suspense>
  );
}
