import type { Accessibility, Difficulty, Region, Status } from "./enums";

export interface Trail {
  id: string;
  slug?: string;
  name: string;
  short_description: string;
  full_description: string;
  region: Region;
  region_id?: string;
  trail_type: string;
  length_km: number;
  duration_minutes: number;
  difficulty: Difficulty;
  accessibility: Accessibility;
  tags: string[];
  estimated_price: number;
  operating_hours?: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  waypoints: { lat: number; lng: number; name?: string }[];
  image_url: string;
  created_by: string;
  status: Status;
  rejection_reason?: string;
  removal_reason?: string;
  updated_at: string;
}
