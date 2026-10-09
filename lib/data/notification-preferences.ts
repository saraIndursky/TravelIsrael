import type {
  NotificationPreferences,
  NotificationPreferencesUpdate,
  NotificationSoundId,
} from "@/types/notification-preferences";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_NOTIFICATION_SOUND_ID,
  isNotificationSoundId,
} from "@/types/notification-preferences";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "./auth";

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

function mapSoundId(value: string): NotificationSoundId {
  return isNotificationSoundId(value) ? value : DEFAULT_NOTIFICATION_SOUND_ID;
}

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
    sound_id: mapSoundId(row.sound_id),
    updated_at: row.updated_at,
  };
}

export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (data) {
    return mapRow(data as NotificationPreferencesRow);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("notification_preferences")
    .insert({ user_id: user.id })
    .select("*")
    .single();

  if (insertError || !inserted) {
    return {
      user_id: user.id,
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      updated_at: new Date().toISOString(),
    };
  }

  return mapRow(inserted as NotificationPreferencesRow);
}

export async function updateNotificationPreferences(
  patch: Partial<NotificationPreferencesUpdate>
): Promise<NotificationPreferences | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        user_id: user.id,
        ...patch,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "עדכון ההגדרות נכשל");
  return mapRow(data as NotificationPreferencesRow);
}
