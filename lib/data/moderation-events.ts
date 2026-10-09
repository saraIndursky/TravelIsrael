export const MODERATION_QUEUE_CHANGED_EVENT = "ti:moderation-queue-changed";

export function notifyModerationQueueChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MODERATION_QUEUE_CHANGED_EVENT));
}
