import type { AssistantEntity, AssistantFieldUpdate } from "@/types/assistant";

const TRIP_DEFAULT_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg/1280px-ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg";

export function formatFieldValuePreview(
  field: string,
  value: unknown,
  maxLen = 140
): string {
  if (value == null) return "—";

  if (Array.isArray(value)) {
    const text = value.map(String).join(", ");
    return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "—";
    if (field === "main_image" || field === "image_url") {
      return trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
    }
    return trimmed.length > maxLen ? `${trimmed.slice(0, maxLen)}…` : trimmed;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  const json = JSON.stringify(value);
  return json.length > maxLen ? `${json.slice(0, maxLen)}…` : json;
}

export function formatUpdatesSummary(updates: AssistantFieldUpdate[]): string {
  if (updates.length === 0) return "";
  const lines = updates.map(
    (u) => `• ${u.label}: ${formatFieldValuePreview(u.field, u.value)}`
  );
  return `\n\n${lines.join("\n")}`;
}

export function isChangesStatusQuery(text: string): boolean {
  return /שינוי|הוחל|הוחלו|הוחלה|ממתין|אלו.*(שינוי|הצע)|מה.*(הוחל|ממתין)|האם.*(הוחל|הוחלה)/.test(
    text
  );
}

export function buildChangesStatusReply(
  pending: AssistantFieldUpdate[],
  lastApplied: AssistantFieldUpdate[]
): string {
  if (pending.length > 0) {
    return [
      `עדיין לא הוחלו שינויים על הטופס — יש ${pending.length} הצעות ממתינות לאישור:`,
      formatUpdatesSummary(pending).trim(),
      "",
      "לחצו על «אישור והחלה על הטופס» כדי להחיל, או «דחייה» לביטול.",
    ].join("\n");
  }

  if (lastApplied.length > 0) {
    return [
      `הוחלו לאחרונה ${lastApplied.length} שדות על הטופס:`,
      formatUpdatesSummary(lastApplied).trim(),
    ].join("\n");
  }

  return "עדיין לא הוחלו שינויים מהעוזר על הטופס. בקשו ממני למלא שדות — ואז תוכלו לאשר לפני ההחלה.";
}

export function getDefaultTripImage(): string {
  return TRIP_DEFAULT_IMAGE;
}

/** Short description for a trip card — one line, up to 80 characters */
export const TRIP_SHORT_DESCRIPTION_MAX = 80;

export function suggestTripShortDescription(
  name: string,
  fullDesc = "",
  tags: string[] = []
): string {
  const trimmedFull = fullDesc.trim();
  if (trimmedFull.length >= 10) {
    const firstLine = trimmedFull.split(/\n/)[0]?.trim() ?? "";
    if (firstLine.length >= 10) {
      return clampOneLine(firstLine, TRIP_SHORT_DESCRIPTION_MAX);
    }
  }

  const tagHint = tags.slice(0, 2).join(", ");
  let candidate = tagHint
    ? `${name} — ${tagHint} בישראל`
    : `${name} — מסלול מומלץ ליום מהנה בישראל`;

  candidate = clampOneLine(candidate, TRIP_SHORT_DESCRIPTION_MAX);

  if (candidate.length < 10) {
    return clampOneLine(`${name} — טיול מומלץ`, TRIP_SHORT_DESCRIPTION_MAX);
  }

  return candidate;
}

function clampOneLine(text: string, maxLen: number): string {
  const singleLine = text.replace(/\s+/g, " ").trim();
  if (singleLine.length <= maxLen) return singleLine;
  const cut = singleLine.slice(0, maxLen - 1).trimEnd();
  return `${cut}…`;
}

export function scanMissingFieldsMessage(
  entity: AssistantEntity,
  missingLabels: string[]
): string {
  if (missingLabels.length === 0) {
    return "כל השדות העיקריים כבר מלאים.";
  }
  return `שדות שחסרים: ${missingLabels.join(", ")}.`;
}
