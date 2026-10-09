# `data/seed/` — נתוני עזר לעוזר AI בלבד

קבצים סטטיים ל-**demo assistant** (`lib/assistant/seed-lookup.ts`): התאמת שמות מקומות/מסלולים,
זיהוי אזור, וקואורדינטות משוערות כשאין התאמה ב-Supabase.

**לא** מקור הנתונים של האפליקציה. כל ה-UI והדפים קוראים מ-`lib/data/` → Supabase.

אין להוסיף כאן entities חדשים לפרודקשן. לעדכון נתוני דמו אמיתיים — `supabase/seed/demo_seed.sql`.
