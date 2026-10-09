const OFF_TOPIC_REPLY =
  "אני עוזר רק בהוספת מקומות, מסלולים וטיולים ב-TravelIsrael. שאלי על שדות הטופס, תיאורים, מיקום, נגישות, תגיות או תחנות.";

const ALLOWED_KEYWORDS = [
  "מקום",
  "מסלול",
  "טיול",
  "תיאור",
  "נגישות",
  "תגית",
  "תגיות",
  "קואורדינט",
  "מיקום",
  "lat",
  "lng",
  "כתובת",
  "אזור",
  "משך",
  "מחיר",
  "שעה",
  "שעות",
  "פתיחה",
  "סגירה",
  "טלפון",
  "אתר",
  "waypoint",
  "נקודה",
  "נקודות",
  "ביניים",
  "תחנה",
  "תחנות",
  "קושי",
  "אורך",
  "מלא",
  "הצע",
  "הערך",
  "עזרה",
  "שדה",
  "שדות",
  "חסר",
  "trail",
  "place",
  "trip",
  "הליכה",
  "חוף",
  "מוזיאון",
  "גן",
  "ירושלים",
  "צפון",
  "נגב",
  "גליל",
  "כרמל",
  "מרכז",
  "יציר",
  "יצירה",
  "שם",
  "תמונה",
  "טופס",
  "שינוי",
  "שינויים",
  "הוחל",
  "הצע",
  "הצעה",
  "הצעות",
  "אשר",
  "החל",
  "קצר",
  "אילת",
];

const BLOCKED_PATTERNS = [
  /סיפור|אהבה|רכילות/i,
  /^(מה|איך|למה).*(חיים|עולם|פוליטיק)/i,
];

export function isOffTopicMessage(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (normalized.length < 2) return false;

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) return true;
  }

  const hasAllowed = ALLOWED_KEYWORDS.some((kw) => normalized.includes(kw.toLowerCase()));
  if (hasAllowed) return false;

  // Very short greetings are ok to get help prompt
  if (/^(היי|שלום|עזרה|help)$/i.test(normalized)) return false;

  // Generic questions without domain keywords
  if (/^(מה|איך|למה|מי|איפה)\s/.test(normalized) && !hasAllowed) return true;

  return false;
}

export function offTopicResponse(): { message: string; offTopic: true } {
  return { message: OFF_TOPIC_REPLY, offTopic: true };
}
