import type { NotificationKind } from "@/types/notification";

export const NOTIFICATION_SOUND_IDS = [
  "chime-1",
  "chime-2",
  "chime-3",
  "chime-4",
  "chime-5",
  "chime-6",
  "chime-7",
  "chime-8",
  "chime-9",
  "chime-10",
] as const;

export type NotificationSoundId = (typeof NOTIFICATION_SOUND_IDS)[number];

export const DEFAULT_NOTIFICATION_SOUND_ID: NotificationSoundId = "chime-1";

export function isNotificationSoundId(value: string): value is NotificationSoundId {
  return (NOTIFICATION_SOUND_IDS as readonly string[]).includes(value);
}

export interface NotificationPreferences {
  user_id: string;
  my_content_status: boolean;
  my_reports_status: boolean;
  comments_on_my_content: boolean;
  ratings_on_my_content: boolean;
  new_approved_content: boolean;
  /** Empty = no broadcast until user picks regions in profile. */
  region_ids: string[];
  favorites_updates: boolean;
  sound_enabled: boolean;
  sound_id: NotificationSoundId;
  updated_at: string;
}

export type NotificationPreferencesUpdate = Pick<
  NotificationPreferences,
  | "my_content_status"
  | "my_reports_status"
  | "comments_on_my_content"
  | "ratings_on_my_content"
  | "new_approved_content"
  | "region_ids"
  | "favorites_updates"
  | "sound_enabled"
  | "sound_id"
>;

export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<
  NotificationPreferences,
  "user_id" | "updated_at"
> = {
  my_content_status: true,
  my_reports_status: true,
  comments_on_my_content: true,
  ratings_on_my_content: true,
  new_approved_content: false,
  region_ids: [],
  favorites_updates: false,
  sound_enabled: false,
  sound_id: DEFAULT_NOTIFICATION_SOUND_ID,
};

export type NotificationPreferenceToggleKey = Exclude<
  keyof NotificationPreferencesUpdate,
  "region_ids" | "sound_enabled" | "sound_id"
>;

export const NOTIFICATION_PREFERENCE_LABELS: Record<
  NotificationPreferenceToggleKey,
  { title: string; description: string; phase: 1 | 3 }
> = {
  my_content_status: {
    title: "סטטוס התוכן שלי",
    description: "אישור, דחייה או הסרה מהאתר של מקום, מסלול או טיול שיצרתי",
    phase: 1,
  },
  my_reports_status: {
    title: "תשובה לדיווח שלי",
    description: "כשמנהל מטפל או דוחה דיווח ששלחתי",
    phase: 1,
  },
  comments_on_my_content: {
    title: "תגובות על התוכן שלי",
    description: "כשמישהו מגיב על מקום, מסלול או טיול שלי",
    phase: 3,
  },
  ratings_on_my_content: {
    title: "דירוגים על התוכן שלי",
    description: "כשמישהו מדרג תוכן שיצרתי",
    phase: 3,
  },
  new_approved_content: {
    title: "תוכן חדש באתר",
    description: "מקומות, מסלולים וטיולים חדשים שאושרו — לפי האזורים שתבחר/י",
    phase: 3,
  },
  favorites_updates: {
    title: "עדכונים במועדפים",
    description: "שינוי או הסרה מהאתר של תוכן ששמרתי במועדפים",
    phase: 3,
  },
};

export function isNotificationKindEnabled(
  prefs: Pick<NotificationPreferences, keyof NotificationPreferencesUpdate>,
  kind: NotificationKind
): boolean {
  switch (kind) {
    case "content_approved":
    case "content_rejected":
    case "content_removed":
      return prefs.my_content_status;
    case "report_resolved":
    case "report_rejected":
      return prefs.my_reports_status;
    case "comment_on_my_content":
      return prefs.comments_on_my_content;
    case "rating_on_my_content":
      return prefs.ratings_on_my_content;
    case "new_approved_place":
    case "new_approved_trail":
    case "new_approved_trip":
      return prefs.new_approved_content;
    case "favorite_entity_updated":
    case "favorite_entity_removed":
      return prefs.favorites_updates;
    default:
      return true;
  }
}
