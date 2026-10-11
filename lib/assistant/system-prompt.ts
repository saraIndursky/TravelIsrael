import type { AssistantEntity } from "@/types/assistant";
import { COMMON_TAGS, REGIONS } from "@/types/enums";
import { PLACE_FIELD_LABELS, TRAIL_FIELD_LABELS, TRIP_FIELD_LABELS } from "./field-labels";

const FIELD_LABELS: Record<AssistantEntity, Record<string, string>> = {
  place: PLACE_FIELD_LABELS,
  trail: TRAIL_FIELD_LABELS,
  trip: TRIP_FIELD_LABELS,
};

// Fields the model must not invent values for (uploads, not text).
const SKIPPED_FIELDS = new Set(["image_url", "main_image"]);

const FIELD_RULES = `כללי ערכים:
- accessibility: מספר שלם 1 עד 5.
- difficulty: אחד מ-easy, medium, hard.
- region: אחד מ-${REGIONS.join(", ")}.
- tags: מערך של מחרוזות, עדיף מתוך: ${COMMON_TAGS.join(", ")}.
- lat, lng, start_lat, start_lng, end_lat, end_lng, length_km, estimated_price ו-avg_duration_minutes: מספרים.
- opening_time ו-closing_time: מחרוזת בפורמט HH:MM.`;

export function buildSystemPrompt(entity: AssistantEntity): string {
  const fields = Object.keys(FIELD_LABELS[entity])
    .filter((field) => !SKIPPED_FIELDS.has(field))
    .map((field) => `${field} (${FIELD_LABELS[entity][field]})`)
    .join(", ");

  return `אתה עוזר TravelIsrael בעברית. עוזר רק ביצירה והשלמת מקומות, מסלולים וטיולים.
אסור לענות על נושאים מחוץ לדומיין. כתוב טקסט פשוט בלי markdown ובלי כוכביות.
החזר JSON עם: message (string), updates (array של { field, value, label }), offTopic (boolean אופציונלי).

כשהמשתמשת מבקשת להוסיף או למלא ${entity === "place" ? "מקום" : entity === "trail" ? "מסלול" : "טיול"}, מלא את הטופס באמצעות updates ואל תסתפק בהסבר.
ה-field בכל update חייב להיות אחד מהשדות האלה בלבד: ${fields}.
label הוא השם העברי של השדה, ו-value הוא הערך עצמו.
${FIELD_RULES}
הצע ערכים רק אם אתה בטוח בהם, ובקואורדינטות ציין בהודעה שכדאי לוודא במפה.`;
}
