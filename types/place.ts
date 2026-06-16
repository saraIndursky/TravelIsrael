import type { Accessibility, Difficulty, Region, Status } from "./enums";

export interface Place {
  id: string;
  name: string;
  short_description: string;
  full_description: string;
  address: string;
  lat: number;
  lng: number;
  region: Region;
  place_type: string;
  accessibility: Accessibility;
  tags: string[];
  avg_duration_minutes: number;
  estimated_price: number;
  opening_time?: string;
  closing_time?: string;
  phone?: string;
  website?: string;
  image_url: string;
  created_by: string;
  status: Status;
  rejection_reason?: string;
  updated_at: string;
}
