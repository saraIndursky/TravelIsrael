"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Copy, MessageCircle, Sparkles, X } from "lucide-react";
import type {
  AssistantContext,
  AssistantEntity,
  AssistantFieldUpdate,
  QuickActionId,
} from "@/types/assistant";
import type { FieldValues, UseFormSetValue } from "react-hook-form";
import { useCreateAssistant } from "@/hooks/use-create-assistant";
import { formatFieldValuePreview } from "@/lib/assistant/format-update-preview";
import { toast } from "@/components/ui/use-toast";

interface QuickAction {
  id: QuickActionId;
  label: string;
}

const PLACE_ACTIONS: QuickAction[] = [
  { id: "full_description", label: "מלא תיאור מלא" },
  { id: "accessibility", label: "הצע נגישות" },
  { id: "coordinates", label: "הצע קואורדינטות" },
  { id: "tags", label: "הצע תגיות" },
  { id: "duration_price", label: "משך ומחיר" },
  { id: "fill_missing", label: "מלא שדות חסרים" },
];

const TRAIL_ACTIONS: QuickAction[] = [
  { id: "full_description", label: "מלא תיאור מלא" },
  { id: "accessibility", label: "הצע נגישות" },
  { id: "coordinates", label: "הצע קואורדינטות" },
  { id: "waypoints", label: "נקודות ביניים" },
  { id: "tags", label: "הצע תגיות" },
  { id: "duration_price", label: "משך ומחיר" },
  { id: "fill_missing", label: "מלא שדות חסרים" },
];

const TRIP_ACTIONS: QuickAction[] = [
  { id: "short_description", label: "תיאור קצר" },
  { id: "full_description", label: "מלא תיאור מלא" },
  { id: "tags", label: "הצע תגיות" },
  { id: "stations_hint", label: "עזרה בתחנות" },
  { id: "fill_missing", label: "מלא שדות חסרים" },
];

const PROVIDER_LABELS = {
  none: "עוזר יצירה",
  gemini: "עוזר AI (Gemini)",
  openai: "עוזר AI (OpenAI)",
  demo: "עוזר (דמו)",
} as const;

function getActions(entity: AssistantEntity): QuickAction[] {
  switch (entity) {
    case "place":
      return PLACE_ACTIONS;
    case "trail":
      return TRAIL_ACTIONS;
    case "trip":
      return TRIP_ACTIONS;
  }
}

interface CreateAssistantPanelProps<T extends FieldValues> {
  entity: AssistantEntity;
  context?: AssistantContext;
  getSnapshot: () => Record<string, unknown>;
  setValue?: UseFormSetValue<T>;
  copyOnly?: boolean;
}

export function CreateAssistantPanel<T extends FieldValues>({
  entity,
  context = "create",
  getSnapshot,
  setValue,
  copyOnly = false,
}: CreateAssistantPanelProps<T>) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const {
    messages,
    pendingUpdates,
    loading,
    error,
    sendMessage,
    runQuickAction,
    applyUpdates,
    copyUpdateValue,
    clearPendingUpdates,
    provider,
  } = useCreateAssistant({
    entity,
    context,
    getSnapshot,
    setValue: copyOnly ? undefined : setValue,
  });

  const actions = getActions(entity);
  const canApply = !copyOnly && setValue && pendingUpdates.length > 0;
  const lastAssistantIndex = messages.reduce(
    (index, msg, i) => (msg.role === "assistant" ? i : index),
    -1
  );

  useEffect(() => {
    if (loading || lastAssistantIndex < 0) return;

    const frame = requestAnimationFrame(() => {
      const messageEl = lastAssistantMessageRef.current;
      const scrollEl = messagesScrollRef.current;
      if (!messageEl || !scrollEl) return;

      const top =
        messageEl.getBoundingClientRect().top -
        scrollEl.getBoundingClientRect().top +
        scrollEl.scrollTop;

      scrollEl.scrollTo({ top, behavior: "smooth" });
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, loading, lastAssistantIndex]);

  useEffect(() => {
    if (open) focusInput();
  }, [open, focusInput]);

  useEffect(() => {
    if (open && !loading) focusInput();
  }, [open, loading, focusInput]);

  async function handleCopy(update: AssistantFieldUpdate) {
    const ok = await copyUpdateValue(update);
    toast({
      title: ok ? `«${update.label}» הועתק` : "לא הצלחתי להעתיק",
      variant: ok ? "default" : "destructive",
    });
  }

  function handleApply() {
    applyUpdates();
    toast({ title: "השינויים הוחלו על הטופס" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    void sendMessage(input);
    setInput("");
    focusInput();
  }

  return (
    <div className="fixed bottom-6 start-6 z-50" dir="rtl">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-white shadow-lg transition-all hover:bg-[#1f2937] hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111827] focus-visible:ring-offset-2"
          aria-label="פתח עוזר יצירה"
        >
          <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
        </button>
      ) : (
        <div
          className="flex h-[min(520px,80vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-[#e5e7eb] bg-[#111827] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <p className="text-sm font-bold">{PROVIDER_LABELS[provider ?? "none"]}</p>
                <p className="text-xs text-[#9ca3af]">לא משנה הטופס ללא אישור</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-[#9ca3af] transition-colors hover:bg-white/10 hover:text-white"
              aria-label="סגור עוזר"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-1.5 border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-2">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled={loading}
                onClick={() => void runQuickAction(action.id)}
                className="rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 text-xs text-[#374151] transition-colors hover:bg-[#f3f4f6] disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div
            ref={messagesScrollRef}
            className="flex-1 space-y-2 overflow-y-auto px-3 py-3"
          >
            {messages.length === 0 && (
              <p className="text-center text-xs text-[#9ca3af] py-4">
                כתבי מה חסר — למשל «תוסיפי תיאור ותגיות» או «מה הוחל על הטופס?»
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                ref={i === lastAssistantIndex ? lastAssistantMessageRef : undefined}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "ms-auto bg-[#111827] text-white"
                    : "me-auto border border-[#e5e7eb] bg-[#f9fafb] text-[#374151]"
                }`}
              >
                {msg.content.startsWith("__quick:")
                  ? `כפתור: ${msg.content.replace("__quick:", "").replace(/_/g, " ")}`
                  : msg.content}
              </div>
            ))}
            {loading && (
              <p className="text-xs text-[#9ca3af] animate-pulse px-1">חושב...</p>
            )}
          </div>

          {error && (
            <p className="px-3 pb-1 text-xs text-red-600">{error}</p>
          )}

          {/* Pending updates — user must approve */}
          {pendingUpdates.length > 0 && (
            <div className="border-t border-[#d1fae5] bg-[#ecfdf5] px-3 py-3">
              <p className="mb-2 flex items-center gap-1 text-xs font-bold text-[#065f46]">
                <Sparkles className="h-3.5 w-3.5" />
                {pendingUpdates.length} הצעות — אשרי לפני החלה
              </p>
              <ul className="mb-3 max-h-40 space-y-2 overflow-y-auto">
                {pendingUpdates.map((u) => (
                  <li
                    key={u.field}
                    className="rounded-lg border border-[#a7f3d0] bg-white/70 px-2 py-1.5 text-xs text-[#047857]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{u.label}</span>
                      {copyOnly && (
                        <button
                          type="button"
                          onClick={() => void handleCopy(u)}
                          className="flex shrink-0 items-center gap-1 hover:underline"
                        >
                          <Copy className="h-3 w-3" />
                          העתק
                        </button>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap break-words text-[#065f46]/90">
                      {formatFieldValuePreview(u.field, u.value, 200)}
                    </p>
                  </li>
                ))}
              </ul>
              {canApply && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleApply}
                    className="flex-1 rounded-lg bg-[#111827] py-2 text-xs font-medium text-white hover:bg-[#1f2937]"
                  >
                    אשר והחל על הטופס
                  </button>
                  <button
                    type="button"
                    onClick={clearPendingUpdates}
                    className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-xs text-[#6b7280] hover:bg-[#f9fafb]"
                  >
                    דחי
                  </button>
                </div>
              )}
              {copyOnly && (
                <button
                  type="button"
                  onClick={clearPendingUpdates}
                  className="text-xs text-[#6b7280] hover:underline"
                >
                  סגור
                </button>
              )}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-[#e5e7eb] px-3 py-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="שאלי על שדה בטופס..."
              disabled={loading}
              autoFocus
              className="min-w-0 flex-1 rounded-full border border-[#e5e7eb] px-4 py-2 text-sm focus:border-[#111827] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-full bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
            >
              שלח
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
