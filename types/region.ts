import type { Region } from "./enums";

export type RegionStatus = "approved" | "pending" | "rejected";

export interface RegionRecord {
  id: string;
  name: string;
  code: Region | null;
  parent_id: string | null;
  sort_order: number;
  is_selectable: boolean;
  status: RegionStatus;
  created_by: string | null;
  created_at: string;
}

export interface RegionTreeNode {
  id: string;
  name: string;
  code: Region | null;
  is_selectable: boolean;
  children?: RegionTreeNode[];
}
