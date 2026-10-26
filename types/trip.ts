import type { Accessibility, Difficulty, Region, StationType, Status, TravelMode } from "./enums";

export interface TripStation {
  id: string;
  trip_id: string;
  order_index: number;
  station_type: StationType;
  place_id: string | null;
  trail_id: string | null;
  /** Travel mode to the next stop (not relevant for the last stop) */
  travel_mode?: TravelMode;
}

export interface Trip {
  id: string;
  slug?: string;
  name: string;
  short_description: string;
  full_description: string;
  main_image: string;
  gallery_images: string[];
  tags: string[];
  created_by: string;
  status: Status;
  total_duration_minutes: number;
  total_distance_km: number;
  estimated_price: number;
  difficulty: Difficulty;
  accessibility: Accessibility;
  region: Region;
  region_id?: string;
  station_count: number;
  views_count: number;
  favorites_count: number;
  avg_rating: number;
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
  removal_reason?: string;
}

export interface TripWithStations extends Trip {
  stations: TripStation[];
}
