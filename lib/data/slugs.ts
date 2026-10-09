import { slugifyName } from "@/lib/utils/slug";

type InsertResult<T> = {
  data: T | null;
  error: { code?: string; message: string } | null;
};

export async function insertWithUniqueSlug<T>(
  name: string,
  insertRow: (slug: string) => Promise<InsertResult<T>>
): Promise<T> {
  const base = slugifyName(name);
  let lastMessage = "יצירת התוכן נכשלה";

  for (let attempt = 1; attempt <= 25; attempt += 1) {
    const slug = attempt === 1 ? base : `${base}-${attempt}`;
    const { data, error } = await insertRow(slug);
    if (!error && data) return data;
    if (error?.code === "23505") {
      lastMessage = error.message;
      continue;
    }
    throw new Error(error?.message ?? lastMessage);
  }

  throw new Error(lastMessage);
}

