import type { RegionTreeNode } from "@/types/region";

/** Reference tree — source of truth is Supabase `regions` table (same structure). */
export const SEED_REGION_TREE: RegionTreeNode[] = [
  {
    id: "seed-israel",
    name: "ישראל",
    code: null,
    is_selectable: false,
    children: [
      {
        id: "seed-south",
        name: "דרום",
        code: null,
        is_selectable: false,
        children: [
          { id: "seed-negev", name: "נגב", code: "נגב", is_selectable: true },
          { id: "seed-eilat", name: "אילת", code: "אילת", is_selectable: true },
          { id: "seed-dead-sea", name: "ים המלח", code: "ים המלח", is_selectable: true },
        ],
      },
      {
        id: "seed-center",
        name: "מרכז",
        code: null,
        is_selectable: false,
        children: [
          { id: "seed-center-leaf", name: "מרכז", code: "מרכז", is_selectable: true },
          { id: "seed-coast", name: "חוף", code: "חוף", is_selectable: true },
        ],
      },
      {
        id: "seed-north",
        name: "צפון",
        code: null,
        is_selectable: false,
        children: [
          { id: "seed-north-leaf", name: "צפון", code: "צפון", is_selectable: true },
          { id: "seed-galil", name: "גליל", code: "גליל", is_selectable: true },
          { id: "seed-carmel", name: "כרמל", code: "כרמל", is_selectable: true },
        ],
      },
      {
        id: "seed-jerusalem-area",
        name: "ירושלים והסביבה",
        code: null,
        is_selectable: false,
        children: [
          { id: "seed-jerusalem", name: "ירושלים", code: "ירושלים", is_selectable: true },
          { id: "seed-judea", name: "יהודה ושומרון", code: "יהודה ושומרון", is_selectable: true },
        ],
      },
    ],
  },
];
