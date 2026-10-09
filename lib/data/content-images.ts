import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/data/auth";

const CONTENT_IMAGES_BUCKET = "content-images";
const MAX_BYTES = 5 * 1024 * 1024;
const MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionForMime(mimeType: string): string {
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

export interface UploadedContentImage {
  url: string;
  storagePath: string;
}

/** Uploads a content image to Storage and returns the public URL plus object path. */
export async function uploadContentImageWithPath(file: File): Promise<UploadedContentImage> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("יש להתחבר כדי להעלות תמונה");
  }
  if (!MIME_TYPES.has(file.type)) {
    throw new Error("יש להעלות קובץ תמונה (JPG, PNG, WEBP או GIF)");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("גודל התמונה המקסימלי הוא 5MB");
  }

  const supabase = createClient();
  const objectPath = `${user.id}/${crypto.randomUUID()}.${extensionForMime(file.type)}`;

  const { error: uploadError } = await supabase.storage
    .from(CONTENT_IMAGES_BUCKET)
    .upload(objectPath, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error("העלאת התמונה נכשלה");
  }

  const { data } = supabase.storage.from(CONTENT_IMAGES_BUCKET).getPublicUrl(objectPath);
  return { url: data.publicUrl, storagePath: objectPath };
}

/** Uploads a content image to Storage and returns a public HTTPS URL. */
export async function uploadContentImage(file: File): Promise<string> {
  const uploaded = await uploadContentImageWithPath(file);
  return uploaded.url;
}

export async function removeContentImage(storagePath: string): Promise<void> {
  const path = storagePath.trim();
  if (!path) return;

  const supabase = createClient();
  await supabase.storage.from(CONTENT_IMAGES_BUCKET).remove([path]).catch(() => undefined);
}
