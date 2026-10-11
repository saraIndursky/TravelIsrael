import { createClient } from "@/lib/supabase/client";
import { ADMIN_PAGE_SIZE } from "./admin-lists";
import { pageRange, toPage, type Page } from "./paged";
import { getCurrentRole, getCurrentUser } from "./auth";

export type ContactStatus = "new" | "handled";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  user_id: string | null;
  status: ContactStatus;
  created_at: string;
  handled_at: string | null;
}

export const CONTACT_CHANGED_EVENT = "ti:contact-messages-changed";

function notifyContactChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CONTACT_CHANGED_EVENT));
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  if ((await getCurrentRole()) !== "admin") return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, user_id, status, created_at, handled_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ContactMessage[];
}

export type ContactTab = "new" | "handled" | "all";

/** Admin: one page of contact messages (newest first) for a tab. */
export async function getContactMessagesPage(params: { tab: ContactTab; page: number }): Promise<Page<ContactMessage>> {
  if ((await getCurrentRole()) !== "admin") return { items: [], total: 0, hasMore: false };

  const supabase = createClient();
  const { from, to } = pageRange(params.page, ADMIN_PAGE_SIZE);
  let query = supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, user_id, status, created_at, handled_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);
  if (params.tab !== "all") query = query.eq("status", params.tab);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return toPage((data ?? []) as ContactMessage[], count, params.page, ADMIN_PAGE_SIZE);
}

export async function getContactCounts(): Promise<{ new: number; handled: number }> {
  const supabase = createClient();
  const count = async (status: "new" | "handled") => {
    const { count: value, error } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", status);
    if (error) throw new Error(error.message);
    return value ?? 0;
  };
  const [fresh, handled] = await Promise.all([count("new"), count("handled")]);
  return { new: fresh, handled };
}

export async function getNewContactCount(): Promise<number> {
  if ((await getCurrentRole()) !== "admin") return 0;

  const supabase = createClient();
  const { count, error } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function setContactHandled(id: string, handled: boolean): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || (await getCurrentRole()) !== "admin") return false;

  const supabase = createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update(
      handled
        ? { status: "handled", handled_at: new Date().toISOString(), handled_by: user.id }
        : { status: "new", handled_at: null, handled_by: null }
    )
    .eq("id", id);
  if (error) return false;
  notifyContactChanged();
  return true;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  if ((await getCurrentRole()) !== "admin") return false;

  const supabase = createClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return false;
  notifyContactChanged();
  return true;
}
