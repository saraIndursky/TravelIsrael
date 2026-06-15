import type { Comment, Favorite, Rating, Report } from "@/types";

export const seedRatings: Rating[] = [
  { id: "r-1", user_id: "user-2", entity_type: "trip", entity_id: "trip-1", score: 5, created_at: "2025-02-01T10:00:00Z" },
  { id: "r-2", user_id: "user-1", entity_type: "trip", entity_id: "trip-2", score: 4, created_at: "2025-02-15T10:00:00Z" },
  { id: "r-3", user_id: "user-2", entity_type: "trip", entity_id: "trip-3", score: 5, created_at: "2025-03-01T10:00:00Z" },
  { id: "r-4", user_id: "user-1", entity_type: "place", entity_id: "place-1", score: 5, created_at: "2025-01-20T10:00:00Z" },
  { id: "r-5", user_id: "user-2", entity_type: "trail", entity_id: "trail-3", score: 5, created_at: "2025-02-20T10:00:00Z" },
];

export const seedComments: Comment[] = [
  {
    id: "c-1",
    user_id: "user-2",
    entity_type: "trip",
    entity_id: "trip-1",
    content: "טיול מדהים! מומלץ להתחיל מוקדם בבוקר.",
    created_at: "2025-02-05T10:00:00Z",
  },
  {
    id: "c-2",
    user_id: "user-1",
    entity_type: "trip",
    entity_id: "trip-3",
    content: "שביל הנחש מאתגר אבל שווה כל טיפה. הביאו מים!",
    created_at: "2025-03-10T10:00:00Z",
  },
  {
    id: "c-3",
    user_id: "user-2",
    entity_type: "place",
    entity_id: "place-3",
    content: "החוף הכי יפה בתל אביב, במיוחד בשקיעה.",
    created_at: "2025-04-01T10:00:00Z",
  },
  {
    id: "c-4",
    user_id: "user-2",
    entity_type: "trip",
    entity_id: "trip-1",
    content:
      "המסלול מסודר מצוין, כל תחנה בזמן. הגן הוורדים היה הפתעה נעימה. ממליצה בחום למשפחות.",
    created_at: "2025-04-12T10:00:00Z",
  },
  {
    id: "c-5",
    user_id: "user-1",
    entity_type: "trip",
    entity_id: "trip-1",
    content: "שוק מחנה יהודה בשיא — כדאי להגיע רעבים! הטיול עבר חלק ונעים.",
    created_at: "2025-05-20T10:00:00Z",
  },
];

export const seedFavorites: Favorite[] = [
  { id: "f-1", user_id: "user-1", trip_id: "trip-3", created_at: "2025-03-01T10:00:00Z" },
  { id: "f-2", user_id: "user-1", trip_id: "trip-1", created_at: "2025-03-15T10:00:00Z" },
  { id: "f-3", user_id: "user-2", trip_id: "trip-4", created_at: "2025-04-01T10:00:00Z" },
];

export const seedReports: Report[] = [
  {
    id: "rep-1",
    user_id: "user-2",
    entity_type: "trip",
    entity_id: "trip-11",
    report_type: "inaccuracy",
    reason: "תוכן לא מדויק",
    status: "pending",
    created_at: "2025-06-05T10:00:00Z",
  },
];
