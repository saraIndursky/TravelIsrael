"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, CheckCircle2, Eye, EyeOff, Trash2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/custom/user-avatar";
import {
  changePassword,
  getCurrentUser,
  getUserStatistics,
  removeProfileAvatar,
  updateProfile,
  uploadProfileAvatar,
} from "@/lib/data/auth";
import { useAuthStore } from "@/hooks/use-stores";
import { cn } from "@/lib/utils";
import { NotificationPreferencesSection } from "@/components/features/profile/notification-preferences-section";

type ProfileState = {
  firstName: string;
  lastName: string;
  email: string;
};

type PasswordState = {
  current: string;
  newPass: string;
  confirm: string;
};

type ShowPasswordState = {
  current: boolean;
  newPass: boolean;
  confirm: boolean;
};

type AlertState = {
  message: string;
  type: "success" | "error";
  section: "profile" | "password";
};

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function AlertMessage({ message, type }: { message: string; type: "success" | "error" }) {
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={cn(
        "mb-5 flex animate-in fade-in slide-in-from-top-1 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium duration-300",
        type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  onToggleVisibility,
  showPassword,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onToggleVisibility?: () => void;
  showPassword?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-500">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-900 transition-all placeholder:text-gray-300 hover:bg-white focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
        {onToggleVisibility && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5">
      <span className="text-2xl font-bold tabular-nums leading-none text-gray-900">{value}</span>
      <span className="text-center text-xs leading-tight text-gray-400">{label}</span>
    </div>
  );
}

function ProfileHero({
  profile,
  avatarUrl,
  stats,
  avatarUploading,
  onAvatarSelect,
  onAvatarRemove,
}: {
  profile: ProfileState;
  avatarUrl?: string;
  stats: { joinDate: string; trips: number; views: number };
  avatarUploading?: boolean;
  onAvatarSelect: (file: File) => void;
  onAvatarRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayName = `${profile.firstName} ${profile.lastName}`.trim() || profile.email;
  const statistics = [
    { label: "תאריך הצטרפות", value: stats.joinDate },
    { label: "טיולים שנוצרו", value: stats.trips },
    { label: "צפיות בטיולים", value: stats.views },
  ];

  return (
    <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <UserAvatar name={displayName} avatarUrl={avatarUrl} size="xl" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
              aria-label="החלף תמונת פרופיל"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onAvatarSelect(file);
                event.target.value = "";
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="text-xs font-medium text-gray-700 transition hover:text-gray-900 disabled:opacity-60"
            >
              {avatarUploading ? "מעלה..." : "העלאת תמונה"}
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={onAvatarRemove}
                disabled={avatarUploading}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 transition hover:text-red-700 disabled:opacity-60"
              >
                <Trash2 className="h-3 w-3" />
                הסר
              </button>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold leading-tight text-gray-900">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="mt-1 text-sm text-gray-400">{profile.email}</p>
        </div>

        <div className="flex w-full items-center gap-0 border-t border-gray-100 pt-5 sm:w-auto sm:border-r sm:border-t-0 sm:pr-6 sm:pt-0">
          {statistics.map((stat, index) => (
            <div key={stat.label} className="flex items-center">
              {index > 0 && <div className="mx-1 h-9 w-px self-center bg-gray-200" />}
              <StatCard label={stat.label} value={stat.value} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfilePersonalArea() {
  const router = useRouter();
  const { role, setSession } = useAuthStore();
  const [profile, setProfile] = useState<ProfileState>({ firstName: "", lastName: "", email: "" });
  const [passwords, setPasswords] = useState<PasswordState>({ current: "", newPass: "", confirm: "" });
  const [showPw, setShowPw] = useState<ShowPasswordState>({ current: false, newPass: false, confirm: false });
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [stats, setStats] = useState({ joinDate: "", trips: 0, views: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "guest") {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        const [user, statistics] = await Promise.all([getCurrentUser(), getUserStatistics()]);
        if (!user) return;

        const { firstName, lastName } = splitName(user.name);
        setProfile({ firstName, lastName, email: user.email });
        setAvatarUrl(user.avatar_url);
        setStats({
          joinDate: new Date(statistics.joinDate).toLocaleDateString("he-IL", {
            month: "short",
            year: "2-digit",
          }),
          trips: statistics.tripsCreated,
          views: statistics.tripsViews,
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [role]);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 3000);
    return () => clearTimeout(timer);
  }, [alert]);

  async function handleAvatarSelect(file: File) {
    setAvatarUploading(true);
    try {
      const user = await uploadProfileAvatar(file);
      setAvatarUrl(user.avatar_url);
      setSession(user);
      setAlert({ message: "תמונת הפרופיל עודכנה", type: "success", section: "profile" });
    } catch (error) {
      setAlert({
        message: error instanceof Error ? error.message : "העלאת התמונה נכשלה",
        type: "error",
        section: "profile",
      });
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarUploading(true);
    try {
      const user = await removeProfileAvatar();
      setAvatarUrl(undefined);
      setSession(user);
      setAlert({ message: "תמונת הפרופיל הוסרה", type: "success", section: "profile" });
    } catch (error) {
      setAlert({
        message: error instanceof Error ? error.message : "הסרת התמונה נכשלה",
        type: "error",
        section: "profile",
      });
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleProfileSave() {
    try {
      await updateProfile(profile);
      setAlert({ message: "הפרטים עודכנו בהצלחה", type: "success", section: "profile" });
    } catch (error) {
      setAlert({
        message: error instanceof Error ? error.message : "עדכון הפרטים נכשל",
        type: "error",
        section: "profile",
      });
    }
  }

  async function handlePasswordUpdate() {
    if (passwords.newPass.length < 8) {
      setAlert({
        message: "הסיסמה חייבת להכיל לפחות 8 תווים",
        type: "error",
        section: "password",
      });
      return;
    }

    if (passwords.newPass !== passwords.confirm) {
      setAlert({
        message: "הסיסמאות אינן תואמות",
        type: "error",
        section: "password",
      });
      return;
    }

    try {
      await changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      setPasswords({ current: "", newPass: "", confirm: "" });
      setAlert({ message: "הסיסמה עודכנה בהצלחה", type: "success", section: "password" });
    } catch (error) {
      setAlert({
        message: error instanceof Error ? error.message : "עדכון הסיסמה נכשל",
        type: "error",
        section: "password",
      });
    }
  }

  if (role === "guest") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-[#f5f6f8] to-[#eef0f4] px-4">
        <div className="max-w-md rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <h1 className="mb-2 text-2xl font-light text-gray-900">האזור האישי שלי</h1>
          <p className="mb-6 text-sm text-gray-400">יש להתחבר כדי לצפות ולעדכן את הפרטים האישיים</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            התחברות
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-br from-[#f5f6f8] to-[#eef0f4] px-4 py-12">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-32 rounded-2xl bg-white" />
          <div className="h-64 rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f6f8] to-[#eef0f4]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10">
          <h1 className="mb-2 text-4xl font-light tracking-tight text-gray-900">האזור האישי שלי</h1>
          <p className="text-sm font-light text-gray-400">
            כאן ניתן לצפות ולעדכן את הפרטים האישיים שלך ולנהל את הגדרות החשבון
          </p>
          <Link href="/profile/content" className="mt-3 inline-block text-sm font-medium text-gray-700 hover:underline">
            הטיולים שלי ←
          </Link>
        </div>

        <ProfileHero
          profile={profile}
          avatarUrl={avatarUrl}
          stats={stats}
          avatarUploading={avatarUploading}
          onAvatarSelect={handleAvatarSelect}
          onAvatarRemove={handleAvatarRemove}
        />

        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-base font-semibold text-gray-800">פרטים אישיים</h2>

          {alert?.section === "profile" && <AlertMessage message={alert.message} type={alert.type} />}

          <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InputField
              label="שם פרטי"
              value={profile.firstName}
              onChange={(firstName) => setProfile({ ...profile, firstName })}
              placeholder="שם פרטי"
            />
            <InputField
              label="שם משפחה"
              value={profile.lastName}
              onChange={(lastName) => setProfile({ ...profile, lastName })}
              placeholder="שם משפחה"
            />
          </div>

          <div className="mb-7">
            <InputField
              label="כתובת מייל"
              type="email"
              value={profile.email}
              onChange={(email) => setProfile({ ...profile, email })}
              placeholder="your@email.com"
            />
          </div>

          <div dir="ltr" className="flex justify-start">
            <button
              type="button"
              onClick={handleProfileSave}
              className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-md active:translate-y-0"
            >
              שמור שינויים
            </button>
          </div>
        </div>

        <NotificationPreferencesSection />

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-base font-semibold text-gray-800">שינוי סיסמה</h2>

          {alert?.section === "password" && <AlertMessage message={alert.message} type={alert.type} />}

          <div className="mb-4 flex flex-col gap-5">
            <InputField
              label="סיסמה נוכחית"
              type={showPw.current ? "text" : "password"}
              value={passwords.current}
              onChange={(current) => setPasswords({ ...passwords, current })}
              placeholder="הזן סיסמה נוכחית"
              showPassword={showPw.current}
              onToggleVisibility={() => setShowPw({ ...showPw, current: !showPw.current })}
            />
          </div>

          <div className="my-6 border-t border-gray-100" />

          <div className="mb-7 flex flex-col gap-5">
            <InputField
              label="סיסמה חדשה"
              type={showPw.newPass ? "text" : "password"}
              value={passwords.newPass}
              onChange={(newPass) => setPasswords({ ...passwords, newPass })}
              placeholder="הזן סיסמה חדשה"
              showPassword={showPw.newPass}
              onToggleVisibility={() => setShowPw({ ...showPw, newPass: !showPw.newPass })}
            />
            <InputField
              label="אימות סיסמה חדשה"
              type={showPw.confirm ? "text" : "password"}
              value={passwords.confirm}
              onChange={(confirm) => setPasswords({ ...passwords, confirm })}
              placeholder="הזן שוב את הסיסמה החדשה"
              showPassword={showPw.confirm}
              onToggleVisibility={() => setShowPw({ ...showPw, confirm: !showPw.confirm })}
            />
          </div>

          <div dir="ltr" className="flex justify-start">
            <button
              type="button"
              onClick={handlePasswordUpdate}
              className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-md active:translate-y-0"
            >
              עדכן סיסמה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
