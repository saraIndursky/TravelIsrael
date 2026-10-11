"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Volume2 } from "lucide-react";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/data/notification-preferences";
import { NOTIFICATION_SOUNDS, playNotificationSound, unlockNotificationAudio } from "@/lib/notifications/sounds";
import {
  NOTIFICATION_PREFERENCE_LABELS,
  type NotificationPreferenceToggleKey,
  type NotificationPreferences,
  type NotificationPreferencesUpdate,
  type NotificationSoundId,
} from "@/types/notification-preferences";
import { NotificationRegionPicker } from "@/components/features/profile/notification-region-picker";
import { cn } from "@/lib/utils";

const PHASE_1_KEYS = (
  Object.entries(NOTIFICATION_PREFERENCE_LABELS) as [
    NotificationPreferenceToggleKey,
    (typeof NOTIFICATION_PREFERENCE_LABELS)[NotificationPreferenceToggleKey],
  ][]
)
  .filter(([, meta]) => meta.phase === 1)
  .map(([key]) => key);

const PHASE_3_ACTIVE_KEYS = (
  Object.entries(NOTIFICATION_PREFERENCE_LABELS) as [
    NotificationPreferenceToggleKey,
    (typeof NOTIFICATION_PREFERENCE_LABELS)[NotificationPreferenceToggleKey],
  ][]
)
  .filter(([, meta]) => meta.phase === 3)
  .map(([key]) => key);

function PreferenceToggle({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-4">
      <div className="min-w-0 flex-1 text-right">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 disabled:opacity-50",
          checked ? "bg-gray-900" : "bg-gray-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "end-0.5" : "start-0.5"
          )}
        />
      </button>
    </div>
  );
}

export function NotificationPreferencesSection() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<keyof NotificationPreferencesUpdate | null>(null);
  const [previewingId, setPreviewingId] = useState<NotificationSoundId | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPrefs(await getNotificationPreferences());
    } catch {
      setMessage({ type: "error", text: "טעינת ההגדרות נכשלה" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function savePatch(
    patch: Partial<NotificationPreferencesUpdate>,
    saving: keyof NotificationPreferencesUpdate
  ) {
    if (!prefs) return;
    setSavingKey(saving);
    setMessage(null);
    const previous = { ...prefs };
    setPrefs({ ...prefs, ...patch });

    try {
      const updated = await updateNotificationPreferences(patch);
      if (updated) setPrefs(updated);
      setMessage({ type: "success", text: "ההגדרות נשמרו" });
    } catch {
      setPrefs(previous);
      setMessage({ type: "error", text: "שמירת ההגדרות נכשלה" });
    } finally {
      setSavingKey(null);
    }
  }

  async function handleToggle(key: keyof NotificationPreferencesUpdate, value: boolean) {
    if (!prefs) return;
    setSavingKey(key);
    setMessage(null);
    const previous = { ...prefs };
    setPrefs({ ...prefs, [key]: value });

    try {
      const updated = await updateNotificationPreferences({ [key]: value });
      if (updated) {
        setPrefs(updated);
        if (key === "sound_enabled" && value) {
          await unlockNotificationAudio();
          await playNotificationSound(updated.sound_id);
        }
      }
      setMessage({ type: "success", text: "ההגדרות נשמרו" });
    } catch {
      setPrefs(previous);
      setMessage({ type: "error", text: "שמירת ההגדרות נכשלה" });
    } finally {
      setSavingKey(null);
    }
  }

  async function handleSoundSelect(id: NotificationSoundId) {
    if (!prefs || prefs.sound_id === id) return;
    await savePatch({ sound_id: id }, "sound_id");
  }

  async function handlePreview(id: NotificationSoundId) {
    setPreviewingId(id);
    try {
      await unlockNotificationAudio();
      await playNotificationSound(id);
    } finally {
      setPreviewingId(null);
    }
  }

  return (
    <div
      id="notifications"
      className="mb-4 scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
    >
      <div className="mb-6 flex items-center gap-2">
        <Bell className="h-5 w-5 text-gray-700" aria-hidden />
        <h2 className="text-base font-semibold text-gray-800">התראות</h2>
      </div>
      <p className="mb-6 text-sm text-gray-500">
        בחר/י אילו עדכונים יופיעו בפעמון ובעמוד ההתראות. אימיילים נשלחים בנפרד.
      </p>

      {message && (
        <p
          className={cn(
            "mb-4 text-sm font-medium",
            message.type === "success" ? "text-emerald-700" : "text-red-600"
          )}
        >
          {message.text}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
        </div>
      ) : prefs ? (
        <div className="space-y-6">
          <div className="space-y-3">
            {PHASE_1_KEYS.map((key) => {
              const meta = NOTIFICATION_PREFERENCE_LABELS[key];
              return (
                <PreferenceToggle
                  key={key}
                  title={meta.title}
                  description={meta.description}
                  checked={prefs[key]}
                  disabled={savingKey === key}
                  onChange={(value) => void handleToggle(key, value)}
                />
              );
            })}
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-gray-800">פעילות על התוכן שלי</h3>
            {PHASE_3_ACTIVE_KEYS.filter(
              (key) =>
                key === "comments_on_my_content" || key === "ratings_on_my_content"
            ).map((key) => {
              const meta = NOTIFICATION_PREFERENCE_LABELS[key];
              return (
                <PreferenceToggle
                  key={key}
                  title={meta.title}
                  description={meta.description}
                  checked={prefs[key]}
                  disabled={savingKey === key}
                  onChange={(value) => void handleToggle(key, value)}
                />
              );
            })}
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-gray-800">גילוי תוכן ומועדפים</h3>
            {PHASE_3_ACTIVE_KEYS.filter(
              (key) => key === "new_approved_content" || key === "favorites_updates"
            ).map((key) => {
              const meta = NOTIFICATION_PREFERENCE_LABELS[key];
              return (
                <div key={key} className="space-y-3">
                  <PreferenceToggle
                    title={meta.title}
                    description={meta.description}
                    checked={prefs[key]}
                    disabled={savingKey === key}
                    onChange={(value) => void handleToggle(key, value)}
                  />
                  {key === "new_approved_content" && prefs.new_approved_content && (
                    <NotificationRegionPicker
                      selectedIds={prefs.region_ids}
                      disabled={savingKey === "region_ids"}
                      onChange={(regionIds) => void savePatch({ region_ids: regionIds }, "region_ids")}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="mb-4 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-600" aria-hidden />
              <h3 className="text-sm font-semibold text-gray-800">צליל בהתראה חדשה</h3>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-gray-500">
              דפדפנים עשויים לחסום צליל עד לחיצה באתר. השתמש/י ב&quot;נגן לדוגמה&quot; או לחץ/י על
              הפעמון פעם אחת — ואז צלילים חדשים יושמעו אוטומטית.
            </p>

            <PreferenceToggle
              title="השמע צליל כשמגיעה התראה חדשה"
              description="הצליל יושמע רק כשמספר ההתראות שלא נקראו עולה"
              checked={prefs.sound_enabled}
              disabled={savingKey === "sound_enabled"}
              onChange={(value) => void handleToggle("sound_enabled", value)}
            />

            <div
              className={cn(
                "mt-4 space-y-2 transition-opacity",
                prefs.sound_enabled ? "opacity-100" : "pointer-events-none opacity-45"
              )}
            >
              <p className="text-right text-xs font-medium text-gray-600">בחר/י צליל</p>
              <ul className="space-y-2">
                {NOTIFICATION_SOUNDS.map((sound) => {
                  const selected = prefs.sound_id === sound.id;
                  return (
                    <li
                      key={sound.id}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5",
                        selected ? "border-gray-900 bg-gray-50" : "border-gray-100"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => void handlePreview(sound.id)}
                        disabled={previewingId === sound.id}
                        className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-white disabled:opacity-50"
                      >
                        {previewingId === sound.id ? "…" : "נגן לדוגמה"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSoundSelect(sound.id)}
                        disabled={savingKey === "sound_id"}
                        className="min-w-0 flex-1 text-right"
                      >
                        <span className="text-sm text-gray-900">{sound.label}</span>
                        {selected && (
                          <span className="me-2 text-xs font-medium text-gray-500">(נבחר)</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
