"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminEntityCounts,
  getAdminEntityPage,
  getAdminTypeOptions,
  type AdminEntityTable,
  type AdminListParams,
} from "@/lib/data/admin-lists";
import { getRegions } from "@/lib/data/regions";
import type { Page } from "@/lib/data/paged";
import type { AdminStatusCounts } from "@/lib/data/admin-lists";

export interface AdminEntitySource<T> {
  fetchPage: (params: AdminListParams) => Promise<Page<T>>;
  fetchCounts: () => Promise<AdminStatusCounts>;
  /** Changes after every mutation so the list reloads from the first page. */
  version: number;
}

interface Options<Row, T> {
  table: AdminEntityTable;
  map: (row: Row) => T;
  /** Places and trails: the column that holds the open-ended type, to build the filter and "new type" badges. */
  typeColumn?: "place_type" | "trail_type";
}

/**
 * Data source for an admin list: pages come from the server, and `refresh()` (called after an
 * approve / reject / delete) reloads the list, the counters, the type options and pending regions.
 */
export function useAdminEntitySource<Row, T>({ table, map, typeColumn }: Options<Row, T>) {
  const [version, setVersion] = useState(0);
  const [types, setTypes] = useState<{ all: string[]; approved: string[] }>({ all: [], approved: [] });
  const [pendingRegions, setPendingRegions] = useState<string[]>([]);

  const loadExtras = useCallback(async () => {
    if (!typeColumn) return;
    const [options, regions] = await Promise.all([
      getAdminTypeOptions(table as "places" | "trails", typeColumn),
      getRegions(),
    ]);
    setTypes(options);
    setPendingRegions(regions.filter((region) => region.status === "pending" && region.code).map((r) => r.code as string));
  }, [table, typeColumn]);

  useEffect(() => {
    void loadExtras().catch(() => undefined);
  }, [loadExtras, version]);

  const refresh = useCallback(async () => {
    setVersion((current) => current + 1);
  }, []);

  const source = useMemo<AdminEntitySource<T>>(
    () => ({
      fetchPage: (params) => getAdminEntityPage<Row, T>(table, map, params),
      fetchCounts: () => getAdminEntityCounts(table),
      version,
    }),
    // `map` is a module-level mapper, so it never changes between renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, version]
  );

  return { source, refresh, types, pendingRegions };
}
