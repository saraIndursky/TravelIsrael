/**
 * How urgent a waiting queue is, judged by the age of its oldest waiting item.
 * Used to colour the admin dashboard cards from green (nothing waits) to red (waiting too long).
 */
export type UrgencyTone = "green" | "yellow" | "orange" | "red";

/** Thresholds in days: the age at which a queue turns yellow, orange and red. */
const NORMAL: [number, number, number] = [2, 4, 7];
/** Reports and contact messages come from people waiting for an answer, so they turn faster. */
const URGENT: [number, number, number] = [1, 2, 3];

export function ageInDays(isoDate: string | null | undefined, now: Date = new Date()): number | null {
  if (!isoDate) return null;
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, (now.getTime() - time) / 86_400_000);
}

export function urgencyTone(oldestAgeDays: number | null, urgent = false): UrgencyTone {
  if (oldestAgeDays === null) return "green";
  const [yellow, orange, red] = urgent ? URGENT : NORMAL;
  if (oldestAgeDays >= red) return "red";
  if (oldestAgeDays >= orange) return "orange";
  if (oldestAgeDays >= yellow) return "yellow";
  return "green";
}
