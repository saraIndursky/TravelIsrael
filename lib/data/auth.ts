import type { Status, User, UserRole } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { mapProfile } from "@/lib/supabase/mappers";
import { notifyWelcomeEmail } from "@/lib/notifications/client";
import { resolveBootstrapRole, syncBootstrapAdminProfile } from "./bootstrap-admin";
import { canViewContent } from "./content-access";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ProfileUpdateInput {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
}

export interface UserStatistics {
  joinDate: string;
  tripsCreated: number;
  tripsViews: number;
}

async function fetchProfile(userId: string): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return mapProfile(data);
}

function readMetadataString(metadata: Record<string, unknown>, key: string): string | undefined {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

async function ensureProfile(authUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): Promise<User> {
  const supabase = createClient();
  const email = authUser.email ?? "";

  const existing = await fetchProfile(authUser.id);
  if (existing) {
    const bootstrapRole = await resolveBootstrapRole(supabase, email);
    if (bootstrapRole === "admin" && existing.role !== "admin") {
      const synced = await syncBootstrapAdminProfile(supabase, authUser.id, email);
      if (synced) return mapProfile(synced);
    }
    return existing;
  }

  const name =
    readMetadataString(authUser.user_metadata ?? {}, "full_name") ??
    readMetadataString(authUser.user_metadata ?? {}, "name") ??
    authUser.email?.split("@")[0] ??
    "משתמש";
  const avatarUrl =
    readMetadataString(authUser.user_metadata ?? {}, "avatar_url") ??
    readMetadataString(authUser.user_metadata ?? {}, "picture");
  const role = await resolveBootstrapRole(supabase, email);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: authUser.id,
        name,
        email,
        role,
        avatar_url: avatarUrl ?? null,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error || !data) {
    return {
      id: authUser.id,
      name,
      email,
      role,
      avatar_url: avatarUrl,
      created_at: new Date().toISOString(),
    };
  }

  const synced = await syncBootstrapAdminProfile(supabase, authUser.id, email);
  return mapProfile(synced ?? data);
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return ensureProfile(user);
}

export async function getCurrentRole(): Promise<UserRole> {
  const user = await getCurrentUser();
  return user?.role ?? "guest";
}

export async function syncUserFromAuth(authUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): Promise<User> {
  return ensureProfile(authUser);
}

export async function loginWithEmail(input: LoginInput): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });

  if (error || !data.user) {
    throw new Error("אימייל או סיסמה שגויים");
  }

  return ensureProfile(data.user);
}

export async function registerWithEmail(input: RegisterInput): Promise<User> {
  const supabase = createClient();
  const email = input.email.trim().toLowerCase();
  const name = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: { full_name: name, name },
    },
  });

  if (error) {
    const message =
      error.message.includes("already") || error.message.includes("registered")
        ? "כתובת האימייל כבר רשומה במערכת"
        : error.message.includes("Database error")
          ? "שגיאה ביצירת הפרופיל. נסו שוב בעוד רגע"
          : error.message;
    throw new Error(message);
  }

  if (!data.user) {
    throw new Error("שגיאה בהרשמה");
  }

  const user = await ensureProfile(data.user);
  void notifyWelcomeEmail();
  return user;
}

export async function signOutUser(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function getUsers(): Promise<User[]> {
  const role = await getCurrentRole();
  if (role !== "admin") return [];

  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProfile);
}

export async function updateUserRole(userId: string, role: UserRole): Promise<User> {
  if (role !== "user" && role !== "admin") {
    throw new Error("תפקיד לא תקין");
  }

  const currentRole = await getCurrentRole();
  if (currentRole !== "admin") {
    throw new Error("אין הרשאה לעדכן תפקידים");
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("admin_update_user_role", {
    target_user_id: userId,
    new_role: role,
  });

  if (error) {
    throw new Error(error.message.includes("הרשאה") ? error.message : "עדכון התפקיד נכשל");
  }
  if (!data) {
    throw new Error("עדכון התפקיד נכשל");
  }

  return mapProfile(
    data as {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      avatar_url: string | null;
      created_at: string;
    }
  );
}

export function canViewStatus(
  status: string,
  createdBy: string,
  role: UserRole,
  userId: string | null,
  isFavorited = false
): boolean {
  return canViewContent(status as Status, createdBy, role, userId, isFavorited);
}

export async function updateProfile(input: ProfileUpdateInput): Promise<User> {
  const current = await getCurrentUser();
  if (!current) {
    throw new Error("יש להתחבר כדי לעדכן פרופיל");
  }

  const email = input.email.trim().toLowerCase();
  const name = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
  const supabase = createClient();

  const { error: authError } = await supabase.auth.updateUser({ email });
  if (authError) {
    throw new Error(authError.message);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ name, email })
    .eq("id", current.id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("עדכון הפרטים נכשל");
  }

  return mapProfile(data);
}

const AVATAR_BUCKET = "avatars";
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function avatarExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export async function uploadProfileAvatar(file: File): Promise<User> {
  const current = await getCurrentUser();
  if (!current) {
    throw new Error("יש להתחבר כדי לעדכן תמונה");
  }
  if (!AVATAR_MIME_TYPES.has(file.type)) {
    throw new Error("יש להעלות קובץ תמונה (JPG, PNG, WEBP או GIF)");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("גודל התמונה המקסימלי הוא 5MB");
  }

  const supabase = createClient();
  const objectPath = `${current.id}/avatar.${avatarExtension(file.type)}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(objectPath, file, { upsert: true, contentType: file.type, cacheControl: "3600" });

  if (uploadError) {
    throw new Error("העלאת התמונה נכשלה");
  }

  const { data: publicUrlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);
  const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", current.id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("עדכון תמונת הפרופיל נכשל");
  }

  return mapProfile(data);
}

export async function removeProfileAvatar(): Promise<User> {
  const current = await getCurrentUser();
  if (!current) {
    throw new Error("יש להתחבר כדי להסיר תמונה");
  }

  const supabase = createClient();
  const { data: existingFiles, error: listError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(current.id);

  if (listError) {
    throw new Error("הסרת התמונה נכשלה");
  }

  if (existingFiles?.length) {
    const paths = existingFiles.map((file) => `${current.id}/${file.name}`);
    const { error: removeError } = await supabase.storage.from(AVATAR_BUCKET).remove(paths);
    if (removeError) {
      throw new Error("הסרת התמונה נכשלה");
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", current.id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("עדכון תמונת הפרופיל נכשל");
  }

  return mapProfile(data);
}

export async function changePassword(input: PasswordChangeInput): Promise<void> {
  const current = await getCurrentUser();
  if (!current) {
    throw new Error("יש להתחבר");
  }
  if (!input.currentPassword.trim()) {
    throw new Error("סיסמה נוכחית שגויה");
  }
  if (input.newPassword.length < 8) {
    throw new Error("הסיסמה חייבת להכיל לפחות 8 תווים");
  }

  const supabase = createClient();
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: current.email,
    password: input.currentPassword,
  });
  if (verifyError) {
    throw new Error("סיסמה נוכחית שגויה");
  }

  const { error } = await supabase.auth.updateUser({ password: input.newPassword });
  if (error) {
    throw new Error(error.message);
  }
}

/** שולח מייל איפוס סיסמה דרך Supabase Auth. */
export async function requestPasswordReset(email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    throw new Error("יש להזין אימייל");
  }

  const supabase = createClient();
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`
      : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
    redirectTo,
  });
  if (error) {
    throw new Error("שליחת מייל האיפוס נכשלה. נסו שוב.");
  }
}

/** עדכון סיסמה אחרי קישור recovery (המשתמש כבר ב-session). */
export async function updatePasswordAfterReset(newPassword: string): Promise<void> {
  if (newPassword.length < 8) {
    throw new Error("הסיסמה חייבת להכיל לפחות 8 תווים");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("הקישור פג תוקף או לא תקין. בקשו איפוס סיסמה מחדש.");
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw new Error(error.message);
  }
}

export async function getUserStatistics(): Promise<UserStatistics> {
  const current = await getCurrentUser();
  if (!current) {
    throw new Error("יש להתחבר");
  }

  const supabase = createClient();
  const { data, error } = await supabase.from("trips").select("views_count").eq("created_by", current.id);
  if (error) throw new Error(error.message);

  const trips = data ?? [];
  return {
    joinDate: current.created_at ?? new Date().toISOString(),
    tripsCreated: trips.length,
    tripsViews: trips.reduce((sum, trip) => sum + (trip.views_count ?? 0), 0),
  };
}

/**
 * Other people's profiles are only available through the public_profiles view (name and avatar):
 * the profiles table itself holds e-mail addresses and is readable only by its owner and admins.
 * The e-mail is therefore empty and the role is a placeholder for profiles of other users.
 */
type PublicProfileRow = { id: string; name: string; avatar_url: string | null; created_at: string };

function mapPublicProfile(row: PublicProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: "",
    role: "user",
    avatar_url: row.avatar_url ?? undefined,
    created_at: row.created_at,
  };
}

export async function getProfileById(userId: string): Promise<User | null> {
  const [profile] = await getProfilesByIds([userId]);
  return profile ?? null;
}

export async function getProfilesByIds(ids: string[]): Promise<User[]> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("public_profiles")
    .select("id, name, avatar_url, created_at")
    .in("id", uniqueIds);
  if (error) throw new Error(error.message);
  return ((data ?? []) as PublicProfileRow[]).map(mapPublicProfile);
}
