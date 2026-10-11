"use client";

import { useEffect, useState } from "react";
import { Check, Inbox, Mail, RotateCcw, Trash2 } from "lucide-react";
import { CenteredPageLoading } from "@/components/layout/page-loading";
import { InfiniteScrollFooter } from "@/components/ui/custom/infinite-scroll-footer";
import { usePagedList } from "@/hooks/use-paged-list";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/hooks/use-stores";
import {
  deleteContactMessage,
  getContactCounts,
  getContactMessagesPage,
  setContactHandled,
  type ContactMessage,
} from "@/lib/data/contact";

type Tab = "new" | "handled" | "all";

const TABS: Array<{ value: Tab; label: string }> = [
  { value: "new", label: "חדשות" },
  { value: "handled", label: "טופלו" },
  { value: "all", label: "הכול" },
];

function formatDate(value: string): string {
  return new Date(value).toLocaleString("he-IL", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminMessagesPage() {
  const { role } = useAuthStore();
  const [version, setVersion] = useState(0);
  const [tab, setTab] = useState<Tab>("new");
  const [counts, setCounts] = useState({ new: 0, handled: 0 });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);

  const { items: visible, hasMore, loading, loadingMore, error, loadMore } = usePagedList<ContactMessage>(
    (page) => getContactMessagesPage({ tab, page }),
    `${tab}|${version}`
  );

  useEffect(() => {
    if (role === "admin") getContactCounts().then(setCounts).catch(() => undefined);
  }, [role, version]);

  const load = async () => setVersion((current) => current + 1);

  async function toggleHandled(message: ContactMessage) {
    setBusyId(message.id);
    const ok = await setContactHandled(message.id, message.status === "new");
    setBusyId(null);
    if (!ok) {
      toast({ title: "העדכון נכשל", variant: "destructive" });
      return;
    }
    await load();
    toast({ title: message.status === "new" ? "הפנייה סומנה כטופלה" : "הפנייה הוחזרה לחדשות" });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    const ok = await deleteContactMessage(pendingDelete.id);
    setBusyId(null);
    setPendingDelete(null);
    if (!ok) {
      toast({ title: "המחיקה נכשלה", variant: "destructive" });
      return;
    }
    await load();
    toast({ title: "הפנייה נמחקה" });
  }

  if (role !== "admin") return null;
  if (loading && visible.length === 0 && counts.new + counts.handled === 0) return <CenteredPageLoading />;

  return (
    <div className="min-h-full bg-secondary/30">
      <div className="border-b border-border/60 bg-white px-4 py-6 md:px-8">
        <h1 className="text-2xl font-light tracking-tight text-foreground md:text-3xl">פניות מהאתר</h1>
        <p className="mt-1 text-sm text-muted-foreground">הודעות שנשלחו דרך טופס יצירת הקשר.</p>
        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="סינון פניות">
          {TABS.map(({ value, label }) => {
            const count = value === "all" ? counts.new + counts.handled : counts[value];
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  tab === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white text-foreground/80 hover:bg-muted"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 px-4 py-6 md:px-8">
        {!loading && visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-white py-12 text-center">
            <Inbox className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" aria-hidden />
            <p className="text-muted-foreground">אין פניות להצגה</p>
          </div>
        ) : (
          visible.map((message) => (
            <article key={message.id} className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{message.subject}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {message.name} ·{" "}
                    <a href={`mailto:${message.email}`} dir="ltr" className="text-blue-700 underline">
                      {message.email}
                    </a>{" "}
                    · {formatDate(message.created_at)}
                    {message.user_id && " · משתמש רשום"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    message.status === "new" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {message.status === "new" ? "חדשה" : "טופלה"}
                </span>
              </div>

              <p className="mb-4 whitespace-pre-wrap leading-relaxed text-foreground/90">{message.message}</p>

              <div className="flex flex-wrap gap-2">
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
                >
                  <Mail className="h-4 w-4" aria-hidden /> מענה באימייל
                </a>
                <button
                  type="button"
                  disabled={busyId === message.id}
                  onClick={() => toggleHandled(message)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
                >
                  {message.status === "new" ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden /> סימון כטופלה
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" aria-hidden /> החזרה לחדשות
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={busyId === message.id}
                  onClick={() => setPendingDelete(message)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" aria-hidden /> מחיקה
                </button>
              </div>
            </article>
          ))
        )}
        <InfiniteScrollFooter hasMore={hasMore} loadingMore={loadingMore} error={error} onLoadMore={loadMore} />
      </div>

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        title="מחיקת פנייה"
        description={`למחוק את הפנייה "${pendingDelete?.subject ?? ""}"? אי אפשר לשחזר אותה.`}
        confirming={Boolean(pendingDelete && busyId === pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
