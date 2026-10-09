import type { Region } from "./enums";

export interface RegionRecord {
  id: string;
  name: string;
  code: Region | null;
  parent_id: string | null;
  sort_order: number;
  is_selectable: boolean;
  created_at: string;
}

export interface RegionTreeNode {
  id: string;
  name: string;
  code: Region | null;
  is_selectable: boolean;
  children?: RegionTreeNode[];
}
