export type Status = "draft" | "pending" | "approved" | "rejected" | "removed";
export type Difficulty =
  | "easy"
  | "easy_medium"
  | "medium"
  | "medium_hard"
  | "hard"
  | "challenging";
export type StationType = "place" | "trail";
export type TravelMode = "walking" | "car" | "bike";

export const TRAVEL_MODE_LABELS: Record<TravelMode, string> = {
  walking: "הליכה",
  car: "רכב",
  bike: "אופניים",
};
export type UserRole = "guest" | "user" | "admin";
export type EntityType = "trip" | "place" | "trail";
export type ReportStatus = "pending" | "resolved" | "rejected";
export type ReportType = "problem" | "inaccuracy" | "update";
export type Accessibility = 1 | 2 | 3 | 4 | 5;

export type Region =
  | "צפון"
  | "גליל"
  | "כרמל"
  | "מרכז"
  | "ירושלים"
  | "יהודה ושומרון"
  | "נגב"
  | "אילת"
  | "ים המלח"
  | "חוף";

export const REGIONS: Region[] = [
  "צפון",
  "גליל",
  "כרמל",
  "מרכז",
  "ירושלים",
  "יהודה ושומרון",
  "נגב",
  "אילת",
  "ים המלח",
  "חוף",
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "קל",
  easy_medium: "קל-בינוני",
  medium: "בינוני",
  medium_hard: "בינוני-קשה",
  hard: "קשה",
  challenging: "מאתגר",
};

export const STATUS_LABELS: Record<Status, string> = {
  draft: "טיוטה",
  pending: "ממתין",
  approved: "מאושר",
  rejected: "נדחה",
  removed: "הוסר מהאתר",
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  problem: "בעיה",
  inaccuracy: "חוסר נכונות",
  update: "עדכון",
};

export const COMMON_TAGS = [
  "משפחות",
  "טבע",
  "היסטוריה",
  "ארכיאולוגיה",
  "ים",
  "מדבר",
  "הליכה",
  "אוכל",
  "תרבות",
  "נוף",
  "דת",
  "צילום",
  "קמפינג",
  "מים",
  "חינם",
] as const;
