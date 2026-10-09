import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  isNotificationKindEnabled,
  isNotificationSoundId,
  DEFAULT_NOTIFICATION_SOUND_ID,
  type NotificationPreferences,
} from "@/types/notification-preferences";
import type { NotificationKind } from "@/types/notification";

type NotificationPreferencesRow = {
  user_id: string;
  my_content_status: boolean;
  my_reports_status: boolean;
  comments_on_my_content: boolean;
  ratings_on_my_content: boolean;
  new_approved_content: boolean;
  region_ids: string[] | null;
  favorites_updates: boolean;
  sound_enabled: boolean;
  sound_id: string;
  updated_at: string;
};

function mapRow(row: NotificationPreferencesRow): NotificationPreferences {
  return {
    user_id: row.user_id,
    my_content_status: row.my_content_status,
    my_reports_status: row.my_reports_status,
    comments_on_my_content: row.comments_on_my_content,
    ratings_on_my_content: row.ratings_on_my_content,
    new_approved_content: row.new_approved_content,
    region_ids: row.region_ids ?? [],
    favorites_updates: row.favorites_updates,
    sound_enabled: row.sound_enabled,
    sound_id: isNotificationSoundId(row.sound_id)
      ? row.sound_id
      : DEFAULT_NOTIFICATION_SOUND_ID,
    updated_at: row.updated_at,
  };
}

export async function shouldDeliverNotification(
  userId: string,
  kind: NotificationKind
): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return true;
  }

  const prefs = data
    ? mapRow(data as NotificationPreferencesRow)
    : {
        user_id: userId,
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        updated_at: new Date().toISOString(),
      };

  return isNotificationKindEnabled(prefs, kind);
}
