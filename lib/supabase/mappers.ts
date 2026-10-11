import type {
  Comment,
  EntityImage,
  Favorite,
  ModerationKind,
  ModerationQueueItem,
  Notification,
  Place,
  Rating,
  Report,
  Trail,
  Trip,
  TripStation,
  User,
} from "@/types";
import type { Accessibility, Difficulty, Region, Status, UserRole } from "@/types/enums";
import { toDisplayImageUrl } from "@/lib/utils/image-url";

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
};

type PlaceRow = {
  id: string;
  slug: string | null;
  name: string;
  short_description: string;
  full_description: string;
  address: string;
  lat: number;
  lng: number;
  region: string;
  region_id: string | null;
  place_type: string;
  accessibility: number;
  tags: string[];
  avg_duration_minutes: number;
  estimated_price: number;
  opening_time: string | null;
  closing_time: string | null;
  phone: string | null;
  website: string | null;
  image_url: string;
  created_by: string | null;
  status: Status;
  rejection_reason: string | null;
  removal_reason: string | null;
  updated_at: string;
};

type TrailRow = {
  id: string;
  slug: string | null;
  name: string;
  short_description: string;
  full_description: string;
  region: string;
  region_id: string | null;
  trail_type: string;
  length_km: number;
  duration_minutes: number;
  difficulty: Difficulty;
  accessibility: number;
  tags: string[];
  estimated_price: number;
  operating_hours: string | null;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  waypoints: { lat: number; lng: number; name?: string }[];
  image_url: string;
  created_by: string | null;
  status: Status;
  rejection_reason: string | null;
  removal_reason: string | null;
  updated_at: string;
};

type TripRow = {
  id: string;
  slug: string | null;
  name: string;
  short_description: string;
  full_description: string;
  main_image: string;
  gallery_images: string[];
  tags: string[];
  created_by: string | null;
  status: Status;
  total_duration_minutes: number;
  total_distance_km: number;
  estimated_price: number;
  difficulty: Difficulty;
  accessibility: number;
  region: string;
  region_id: string | null;
  station_count: number;
  views_count: number;
  favorites_count: number;
  avg_rating: number;
  created_at: string;
  updated_at: string;
  rejection_reason: string | null;
  removal_reason: string | null;
};

type TripStationRow = {
  id: string;
  trip_id: string;
  order_index: number;
  station_type: "place" | "trail";
  place_id: string | null;
  trail_id: string | null;
  travel_mode: "walking" | "car" | "bike" | null;
};

type RatingRow = {
  id: string;
  user_id: string;
  entity_type: "trip" | "place" | "trail";
  entity_id: string;
  score: number;
  created_at: string;
};

type CommentRow = {
  id: string;
  user_id: string;
  entity_type: "trip" | "place" | "trail";
  entity_id: string;
  content: string;
  created_at: string;
};

type FavoriteRow = {
  id: string;
  user_id: string;
  entity_type: "trip" | "place" | "trail";
  entity_id: string;
  created_at: string;
};

type ReportRow = {
  id: string;
  user_id: string;
  entity_type: "trip" | "place" | "trail";
  entity_id: string;
  report_type: "problem" | "inaccuracy" | "update";
  reason: string;
  status: "pending" | "resolved" | "rejected";
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
};

export function mapProfile(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar_url: row.avatar_url ?? undefined,
    created_at: row.created_at,
  };
}

export function mapPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    slug: row.slug || undefined,
    name: row.name,
    short_description: row.short_description,
    full_description: row.full_description,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    region: row.region as Region,
    region_id: row.region_id ?? undefined,
    place_type: row.place_type,
    accessibility: row.accessibility as Accessibility,
    tags: row.tags ?? [],
    avg_duration_minutes: row.avg_duration_minutes,
    estimated_price: row.estimated_price,
    opening_time: row.opening_time ?? undefined,
    closing_time: row.closing_time ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    image_url: toDisplayImageUrl(row.image_url),
    created_by: row.created_by ?? "",
    status: row.status,
    rejection_reason: row.rejection_reason ?? undefined,
    removal_reason: row.removal_reason ?? undefined,
    updated_at: row.updated_at,
  };
}

export function mapTrail(row: TrailRow): Trail {
  return {
    id: row.id,
    slug: row.slug || undefined,
    name: row.name,
    short_description: row.short_description,
    full_description: row.full_description,
    region: row.region as Region,
    region_id: row.region_id ?? undefined,
    trail_type: row.trail_type,
    length_km: row.length_km,
    duration_minutes: row.duration_minutes,
    difficulty: row.difficulty,
    accessibility: row.accessibility as Accessibility,
    tags: row.tags ?? [],
    estimated_price: row.estimated_price,
    operating_hours: row.operating_hours ?? undefined,
    start_lat: row.start_lat,
    start_lng: row.start_lng,
    end_lat: row.end_lat,
    end_lng: row.end_lng,
    waypoints: row.waypoints ?? [],
    image_url: toDisplayImageUrl(row.image_url),
    created_by: row.created_by ?? "",
    status: row.status,
    rejection_reason: row.rejection_reason ?? undefined,
    removal_reason: row.removal_reason ?? undefined,
    updated_at: row.updated_at,
  };
}

export function mapTrip(row: TripRow): Trip {
  return {
    id: row.id,
    slug: row.slug || undefined,
    name: row.name,
    short_description: row.short_description,
    full_description: row.full_description,
    main_image: toDisplayImageUrl(row.main_image),
    gallery_images: (row.gallery_images ?? []).map(toDisplayImageUrl),
    tags: row.tags ?? [],
    created_by: row.created_by ?? "",
    status: row.status,
    total_duration_minutes: row.total_duration_minutes,
    total_distance_km: row.total_distance_km,
    estimated_price: row.estimated_price,
    difficulty: row.difficulty,
    accessibility: row.accessibility as Accessibility,
    region: row.region as Region,
    region_id: row.region_id ?? undefined,
    station_count: row.station_count,
    views_count: row.views_count,
    favorites_count: row.favorites_count,
    avg_rating: row.avg_rating,
    created_at: row.created_at,
    updated_at: row.updated_at,
    rejection_reason: row.rejection_reason ?? undefined,
    removal_reason: row.removal_reason ?? undefined,
  };
}

export function mapTripStation(row: TripStationRow): TripStation {
  return {
    id: row.id,
    trip_id: row.trip_id,
    order_index: row.order_index,
    station_type: row.station_type,
    place_id: row.place_id,
    trail_id: row.trail_id,
    travel_mode: row.travel_mode ?? undefined,
  };
}

export function mapRating(row: RatingRow): Rating {
  return {
    id: row.id,
    user_id: row.user_id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    score: row.score,
    created_at: row.created_at,
  };
}

export function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    user_id: row.user_id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    content: row.content,
    created_at: row.created_at,
  };
}

export function mapFavorite(row: FavoriteRow): Favorite {
  return {
    id: row.id,
    user_id: row.user_id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    created_at: row.created_at,
  };
}

export function mapReport(row: ReportRow): Report {
  return {
    id: row.id,
    user_id: row.user_id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    report_type: row.report_type,
    reason: row.reason,
    status: row.status,
    created_at: row.created_at,
    resolved_at: row.resolved_at ?? undefined,
    resolved_by: row.resolved_by ?? undefined,
  };
}

type NotificationRow = {
  id: string;
  user_id: string;
  kind: Notification["kind"];
  title: string;
  body: string;
  link_path: string;
  entity_type: Notification["entity_type"] | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
};

type EntityImageRow = {
  id: string;
  user_id: string;
  entity_type: EntityImage["entity_type"];
  entity_id: string;
  url: string;
  storage_path: string;
  created_at: string;
};

export function mapEntityImage(row: EntityImageRow): EntityImage {
  return {
    id: row.id,
    user_id: row.user_id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    url: toDisplayImageUrl(row.url),
    storage_path: row.storage_path,
    created_at: row.created_at,
  };
}

type ModerationQueueRow = {
  id: string;
  kind: ModerationKind;
  entity_type: ModerationQueueItem["entity_type"];
  entity_id: string;
  entity_name: string;
  content: string;
  source_id: string;
  created_by: string;
  seen_at: string | null;
  seen_by: string | null;
  created_at: string;
};

export function mapModerationQueueItem(row: ModerationQueueRow): ModerationQueueItem {
  return {
    id: row.id,
    kind: row.kind,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    entity_name: row.entity_name,
    content: row.content,
    source_id: row.source_id,
    created_by: row.created_by,
    seen_at: row.seen_at ?? undefined,
    seen_by: row.seen_by ?? undefined,
    created_at: row.created_at,
  };
}

export function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    user_id: row.user_id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    link_path: row.link_path,
    entity_type: row.entity_type ?? undefined,
    entity_id: row.entity_id ?? undefined,
    read_at: row.read_at ?? undefined,
    created_at: row.created_at,
  };
}
