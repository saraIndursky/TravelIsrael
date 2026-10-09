"use client";

import { useCallback, useState } from "react";
import type {
  AssistantContext,
  AssistantEntity,
  AssistantFieldUpdate,
  AssistantMessage,
  AssistantResponse,
  QuickActionId,
} from "@/types/assistant";
import type { FieldValues, Path, PathValue, UseFormSetValue } from "react-hook-form";
import {
  buildChangesStatusReply,
  isChangesStatusQuery,
} from "@/lib/assistant/format-update-preview";

interface UseCreateAssistantOptions<T extends FieldValues> {
  entity: AssistantEntity;
  context: AssistantContext;
  getSnapshot: () => Record<string, unknown>;
  setValue?: UseFormSetValue<T>;
}

export function useCreateAssistant<T extends FieldValues>({
  entity,
  context,
  getSnapshot,
  setValue,
}: UseCreateAssistantOptions<T>) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<AssistantFieldUpdate[]>([]);
  const [lastAppliedUpdates, setLastAppliedUpdates] = useState<AssistantFieldUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendToApi = useCallback(
    async (nextMessages: AssistantMessage[]): Promise<AssistantResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity,
            context,
            messages: nextMessages,
            formSnapshot: getSnapshot(),
          }),
        });
        if (!res.ok) {
          setError("שגיאה בשליחה לעוזר");
          return null;
        }
        return (await res.json()) as AssistantResponse;
      } catch {
        setError("שגיאה בחיבור לעוזר");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [entity, context, getSnapshot]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const userMsg: AssistantMessage = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);

      if (isChangesStatusQuery(trimmed)) {
        const reply = buildChangesStatusReply(pendingUpdates, lastAppliedUpdates);
        setMessages([...nextMessages, { role: "assistant", content: reply }]);
        return;
      }

      const response = await sendToApi(nextMessages);
      if (!response) return;

      setMessages([...nextMessages, { role: "assistant", content: response.message }]);
      if (response.updates?.length) {
        setPendingUpdates(response.updates);
      } else {
        setPendingUpdates([]);
      }
    },
    [messages, sendToApi, pendingUpdates, lastAppliedUpdates]
  );

  const runQuickAction = useCallback(
    async (action: QuickActionId) => {
      const userMsg: AssistantMessage = { role: "user", content: `__quick:${action}` };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);

      const response = await sendToApi(nextMessages);
      if (!response) return;

      setMessages([...nextMessages, { role: "assistant", content: response.message }]);
      if (response.updates?.length) {
        setPendingUpdates(response.updates);
      } else {
        setPendingUpdates([]);
      }
    },
    [messages, sendToApi]
  );

  const applyUpdates = useCallback(() => {
    if (!setValue || pendingUpdates.length === 0) return;

    for (const update of pendingUpdates) {
      setValue(
        update.field as Path<T>,
        update.value as PathValue<T, Path<T>>,
        { shouldValidate: true, shouldDirty: true }
      );
    }
    setLastAppliedUpdates(pendingUpdates);
    setPendingUpdates([]);
  }, [setValue, pendingUpdates]);

  const copyUpdateValue = useCallback(async (update: AssistantFieldUpdate) => {
    const text =
      typeof update.value === "string"
        ? update.value
        : JSON.stringify(update.value, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  const clearPendingUpdates = useCallback(() => setPendingUpdates([]), []);

  return {
    messages,
    pendingUpdates,
    loading,
    error,
    sendMessage,
    runQuickAction,
    applyUpdates,
    copyUpdateValue,
    clearPendingUpdates,
  };
}
