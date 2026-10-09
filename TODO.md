# TravelIsrael — תוכנית עבודה

> עודכן: 10 באוגוסט 2026  
> סטטוס פרויקט: Supabase production-ready חלקי — core flows עובדים, חסרים edit flows, tests, תיעוד.

---

## איך לקרוא את הקובץ

| סימון | משמעות |
|-------|--------|
| `[ ]` | לא התחיל |
| `[~]` | בתהליך |
| `[x]` | הושלם |
| **P0** | חובה לפני production |
| **P1** | חשוב ל-UX |
| **P2** | איכות ותחזוקה |
| **P3** | עתידי |

---

## שלב 0 — הבהרות (ללא קוד)

### מה זה "90% בגרות" בדף הבית?

דף הבית **עובד ונראה שלם**, אבל לא 100% "אמיתי":

| רכיב | סטטוס | מה קיים | מה חסר |
|------|-------|---------|--------|
| Hero | ✅ 100% | תמונה, כותרת, 2 CTA (wizard + create) | — |
| טיולים מומלצים | ✅ ~95% | 3 טיולים מה-DB (top views) | כותרת "השבוע" לא מדויקת; אין skeleton בטעינה |
| סטטיסטיקות | ❌ ~30% | UI מעוצב | מספרים **hardcoded** (+500, +200, +10,000) — לא מה-DB |
| Features | ✅ 100% | 3 יתרונות (marketing) | טקסט "מאות מקומות" — marketing, לא count אמיתי |
| CTA | ✅ 100% | guest → register, user → create trip | — |
| SEO | ⚠️ ~50% | metadata ב-layout root | אין metadata ייעודי לדף הבית |

**לכן ~85–90%:** רוב הדף production-ready, אבל band הסטטיסטיקות מזויף ויש פערים קטנים ב-SEO/טעינה.

---

## שלב 1 — P0: עמודים וזרימות חסרות (קריטי)

> **הערה:** המשתמש אישר שיש לבצע את העמודים החסרים.

### 1.1 עריכת מקום — `/places/[id]/edit`

**מדיניות שנקבעה:** בעלים עורך `pending` + `rejected` בלבד; אחרי עריכה הסטטוס חוזר ל-`pending` ו-`rejection_reason` מתאפס. מקום `approved` — מנהל בלבד. עריכת מנהל לא משנה סטטוס.

- [x] **P0** `lib/data/places.ts` — `UpdatePlaceInput`, `canEditPlace()`, `updatePlace(id, data)`
- [x] **P0** `lib/validations/` — `placeFormSchema` משמש כמו שהוא גם ל-edit (ללא שינוי)
- [x] **P0** `app/places/[id]/edit/page.tsx` — Client Component + auth gate (owner/admin)
- [x] **P0** `components/features/places/place-form.tsx` — טופס משותף `mode="create"|"edit"` (החליף את `create-place-form.tsx`)
- [x] **P0** `components/features/profile/my-place-card.tsx` — כפתור "עריכה"
- [x] **P0** `components/features/places/detail/place-detail-actions.tsx` — כפתור עריכה לבעלים/מנהל
- [x] **P0** RLS / Supabase — migration `tighten_places_update_policy` הוחלה ואומתה (ראה §1.4)
- [ ] **P0** בדיקה ידנית: rejected → edit → שמירה → pending → admin approve

### 1.4 RLS — מה הוחל בפועל

פרויקט Supabase: `TravelIsrael` (`xsfbqypayaznaonsprzn`), אזור `eu-central-1`.

ה-policy הקודמת `places_update` הייתה `(created_by = auth.uid() OR is_admin())` בלי הגבלת סטטוס — כלומר בעלים יכול היה לערוך מקום מאושר וגם להעלות את עצמו ל-`approved` בקריאה ישירה ל-API. הוחלפה ב:

```sql
drop policy if exists "places_update" on public.places;

create policy "places_update" on public.places
  for update to authenticated
  using (
    is_admin()
    or (created_by = auth.uid() and status in ('pending', 'rejected'))
  )
  with check (
    is_admin()
    or (created_by = auth.uid() and status = 'pending')
  );
```

`is_admin()` כבר היה קיים בפרויקט — לא נוצר מחדש.

> **בוצע בשלב 1.2:** `trails_update` סבלה מאותה בעיה והודקה באותו אופן, בשתי הסכמות (`public` ו-`demo`).

> **בוצע בשלב 1.3:** `trips_update` הודקה — בעלים יכול לערוך רק `draft`/`pending`/`rejected`, ו-`with check` מאפשר רק `draft`/`pending` (לא self-approve).

### 1.5 ממצאי אבטחה נלווים (לא חוסמים)

- `admin_update_user_role` ו-`approve_trip_cascade` מסומנים ב-advisor כ-`SECURITY DEFINER` שנגישים ל-`anon` — **נבדק: שתיהן מכילות `IF NOT public.is_admin() THEN RAISE EXCEPTION`**, כך שאין חשיפה בפועל. אפשר בכל זאת `revoke execute ... from anon` כהגנה בשכבות.
- `sync_entity_region` — ללא `search_path` קבוע (P2).
- Leaked password protection כבוי ב-Supabase Auth (P2 — הפעלה בלחיצה בדשבורד).

### 1.2 עריכת מסלול — `/trails/[id]/edit`

**מדיניות:** זהה למקומות — בעלים עורך `pending` + `rejected` בלבד; אחרי עריכה חוזר ל-`pending` ו-`rejection_reason` מתאפס. מסלול `approved` — מנהל בלבד. עריכת מנהל לא משנה סטטוס.

- [x] **P0** `lib/data/trails.ts` — `UpdateTrailInput`, `canEditTrail()`, `updateTrail(id, data)`
- [x] **P0** `lib/validations/` — `trailFormSchema` משמש כמו שהוא גם ל-edit (ללא שינוי)
- [x] **P0** `app/trails/[id]/edit/page.tsx` — Client Component + auth gate (owner/admin)
- [x] **P0** `components/features/trails/trail-form.tsx` — טופס משותף `mode="create"|"edit"` (החליף את `create-trail-form.tsx`)
- [x] **P0** `components/features/profile/my-trail-card.tsx` — כפתור "עריכה"
- [x] **P0** `components/features/trails/detail/trail-detail-actions.tsx` — כפתור עריכה לבעלים/מנהל (הקומפוננטה מקבלת עכשיו `trail`)
- [x] **P0** `lib/utils/preview-trail.ts` — `base` אופציונלי לשמירת `id`/`created_by`/`status` בתצוגה מקדימה
- [x] **P0** RLS / Supabase — migration `tighten_trails_update_policy` הוחלה על `public` **ועל `demo`**, ואומתה מול `pg_policies`
- [ ] **P0** בדיקה ידנית: rejected → edit → שמירה → pending → admin approve

### 1.3 יישור עריכת טיול — `/trips/[id]/edit` — ✅ הושלם

**מדיניות:** בעלים עורך `draft`, `pending` או `rejected`. `draft` נשאר טיוטה או עובר ל-`pending` בלחיצה על "שלח לאישור". `pending`/`rejected` — כל עריכת תוכן מחזירה ל-`pending` ומאפסת `rejection_reason`. טיול `approved` — מנהל בלבד. עריכת מנהל לא משנה סטטוס.

- [x] **P0** `lib/data/trips.ts` — `canEditTrip()`, `updateTrip()` עם לוגיקת סטטוס, `submitTripForApproval()` / `updateTripStatus()` / `rejectTrip()` ישירות ל-Supabase
- [x] **P0** `app/trips/[id]/edit/page.tsx` — auth gate עם `canEditTrip` + הודעות לפי סטטוס
- [x] **P0** `components/features/trips/build-trip-form.tsx` — `editHint`, toasts מותאמים לשמירה/שליחה
- [x] **P0** `components/features/profile/my-trip-card.tsx` — כפתור עריכה לפי `canEditTrip`
- [x] **P0** `components/features/trips/detail/trip-detail-actions.tsx` — כפתור עריכה/שליחה לפי `canEditTrip`
- [x] **P0** `components/features/trips/trip-detail-client.tsx` — `submitTripForApproval` במקום `updateTrip` ישיר
- [x] **P0** RLS / Supabase — migration `tighten_trips_update_policy` על `public` **ועל `demo`**
- [ ] **P0** בדיקה ידנית: rejected → edit → שמירה → pending → admin approve (גם למקומות/מסלולים/טיולים)

---

## שלב 2 — P0: תשתית ותיעוד

### 2.0 סביבת דמו — ✅ הושלם

סכמת `demo` באותו פרויקט Supabase (`xsfbqypayaznaonsprzn`), עם כל 12 הטבלאות, RLS, טריגרים ו-RPCs.

- [x] 3 מיגרציות: `demo_schema_tables`, `demo_schema_rls`, `demo_schema_rpcs`
- [x] `demo.is_admin()` ו-`demo.sync_entity_region()` — עצמאיות מ-public
- [x] 4 RPCs משוכפלים: `approve_trip_cascade`, `admin_update_user_role`, `resolve_bootstrap_role`, `sync_bootstrap_admin`
- [x] `public.handle_new_user()` מסנכרן משתמשים חדשים לשתי הסכמות
- [x] נתונים: 20 מקומות, 12 מסלולים, 11 טיולים (30 תחנות), 76 דירוגים, 33 ביקורות, 34 מועדפים, 4 דיווחים
- [x] מתג בקוד: `NEXT_PUBLIC_SUPABASE_SCHEMA=demo` (ברירת מחדל `public`)

- [x] `demo` נוסף ל-Settings → API → Exposed schemas בדשבורד — הסביבה עובדת

**מה משותף בין הסכמות:** `auth.users` (אותם חשבונות) ו-Storage.

### 2.1 תיעוד והגדרות — ✅ הושלם

- [x] **P0** `README.md` — נכתב מחדש: Supabase, שתי הסכמות, הרשאות, bootstrap admin, כל ה-routes, מבנה תיקיות, עוזר AI
- [x] **P0** `.env.example` — כל 8 המשתנים עם הסבר בעברית
- [x] **P0** `travel-israel-product.mdc` — Supabase במקום demo data
- [x] **P0** `travel-israel-data-model.mdc` — הוסר "Demo Mode", נוספו סכמות, RPCs וכללי הסטטוס
- [x] **P0** `travel-israel-components.mdc` — הוסר DemoRoleSwitcher

### 2.2 Supabase schema ב-repo — ✅ הושלם

היסטוריית המיגרציות חלקית (הסכמה הבסיסית נוצרה בדשבורד לפני שהתחילו מיגרציות),
ולכן יוצא **baseline מהמצב החי** ולא היסטוריה.

- [x] **P0** `supabase/schema/01_enums.sql` — 8 enums
- [x] **P0** `supabase/schema/02_tables_public.sql` — 12 טבלאות, אילוצים, אינדקסים
- [x] **P0** `supabase/schema/03_functions_public.sql` — פונקציות, 4 RPCs, `handle_new_user`, טריגרים
- [x] **P0** `supabase/schema/04_policies_public.sql` — RLS מלא
- [x] **P0** `supabase/schema/05_storage.sql` — bucket avatars ומדיניות
- [x] **P0** `supabase/schema/06_demo_schema.sql` — סכמת demo במלואה
- [x] **P0** `supabase/seed/demo_seed.sql` — 239 statements, idempotent
- [x] **P0** `supabase/README.md` — סדר הרצה, תיעוד RPCs, פערים ידועים, שאילתת הפקה מחדש

### 2.3 תיקוני UX קטנים — ✅ הושלם

- [x] **P0** `admin-access-gate.tsx` — הוסרה ההפניה לבורר התפקיד
- [x] **P0** `image-gallery.tsx` — empty state אמיתי במקום `/placeholder.jpg` שלא היה קיים
- [x] **P0** מחיקת `profile-trips-client.tsx` (קוד מת)
- [x] **P0** `lib/data/trip-approval.ts` — `Array.from` במקום spread על `Set`. **`tsc --noEmit` נקי לחלוטין**
- [x] **P0** 4 תמונות Unsplash שבורות (404) הוחלפו ב-demo וב-public

### 2.4 נותר פתוח משלב 2

- [x] **P0** `trips_update` בשתי הסכמות — הודק בשלב 1.3 (`tighten_trips_update_policy`)
- [ ] **P1** חיבור Supabase CLI (`supabase link`) כדי שהקבצים ב-`supabase/` יהפכו למיגרציה ראשונה אמיתית
- [ ] **P2** יישור הפרשי `on delete` בין `demo` ל-`public` (מתועד בראש `06_demo_schema.sql`)

---

## שלב 3 — P1: שיפורי דף הבית — ✅ הושלם

- [x] **P1** `lib/data/server/stats.ts` — ספירת מקומות/טיולים מאושרים + משתמשים (parallel count queries)
- [x] **P1** `components/home/stats.tsx` — counts אמיתיים מה-server + `HomeStatsSkeleton`
- [x] **P1** `app/page.tsx` — Suspense boundaries ל-stats ול-featured trips
- [x] **P1** `featured-trips-skeleton.tsx` + `featured-trips-section.tsx` — skeleton בזמן טעינה
- [x] **P1** כותרת "מומלצים השבוע" → "פופולריים" (מיון לפי `views_count`)
- [x] **P1** `app/page.tsx` — metadata SEO ייעודי (title, description, Open Graph, Twitter)

---

## שלב 4 — P1: חוויית משתמש כללית — ✅ הושלם

### 4.1 Loading & Error boundaries — ✅

- [x] **P1** `app/trips/loading.tsx` + `error.tsx`
- [x] **P1** `app/places/loading.tsx` + `error.tsx`
- [x] **P1** `app/trails/loading.tsx` + `error.tsx`
- [x] **P1** `app/wizard/loading.tsx`
- [x] **P1** `app/admin/loading.tsx` + `error.tsx`
- [x] **P1** `app/profile/loading.tsx`
- [x] **P1** קומפוננטות משותפות: `list-page-loading`, `detail-page-loading`, `wizard-page-loading`, `admin-page-loading`, `route-error`

### 4.2 SEO per page — ✅

- [x] **P1** metadata ל-`/trips`, `/places`, `/trails`, `/wizard` (דרך `lib/seo/metadata.ts`)
- [x] **P1** `generateMetadata` ל-`/trips/[id]`, `/places/[id]`, `/trails/[id]` (תוכן מאושר בלבד)

### 4.3 Email (Resend) — ✅

- [x] **P1** התקנת `resend`
- [x] **P1** `lib/email/` + API routes: approve/reject (trip, place, trail) — no-op בלי `RESEND_API_KEY`
- [x] **P1** welcome email בהרשמה (`/api/notifications/welcome`)
- [x] **P1** `.env.example` — `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL`

---

## שלב 5 — P2: איכות ובדיקות — ✅ הושלם — ✅ הושלם

### 5.1 Tests

- [x] **P2** בחירת framework — Vitest
- [x] **P2** unit tests: `lib/utils/match-score.ts`
- [x] **P2** unit tests: `lib/utils/trip-calculations.ts`
- [x] **P2** unit tests: Zod validations (`lib/validations/index.test.ts`)
- [x] **P2** E2E (Playwright): wizard flow (`e2e/wizard.spec.ts`)
- [x] **P2** E2E: create trip + submit (`e2e/trip-create.spec.ts`)
- [x] **P2** E2E: login + profile (`e2e/auth.spec.ts`)

### 5.2 CI/CD

- [x] **P2** `.github/workflows/ci.yml` — lint + build + unit + E2E
- [x] **P2** branch protection rules (ב-GitHub) — מתועד ב-README

### 5.3 Lint & Format

- [x] **P2** החלטה: ESLint-only (Next.js) — לא Biome
- [x] **P2** pre-commit hook — `simple-git-hooks` + `lint-staged`

---

## שלב 6 — P2: ניקוי טכני — ✅ הושלם

- [x] **P2** `EntityImage` ב-`types/social.ts` — מתועד (טבלת `images` ב-DB; UI משתמש ב-`gallery_images`)
- [x] **P2** `data/seed/` — `data/seed/README.md` (legacy assistant only)
- [x] **P2** `/profile/trips` — redirect ל-`/profile/content` (נשאר + הערה)
- [x] **P2** infinite scroll — `LazyList` (20/page) ב-`/trips`, `/places`, `/trails`

---

## שלב 7 — P3: פיצ'רים עתידיים

> **איך עובדים עם שלב 7:** כל תת-שלב הוא יחידה עצמאית. לפני קוד — עונים על שאלות ההחלטה (✋). אחרי תשובות — מסמנים `[~]` ומתחילים.

---

### 7.1 שיתוף טיול (link + Open Graph) — ✅ הושלם

**מה זה:** כפתור "שתף" בדף טיול + קישור שעובד ב-WhatsApp/Telegram + תצוגה יפה כשמשתפים (OG image/title).

**החלטות (מומלץ — אושר):**
- [x] **העתקת קישור + Web Share API** במובייל (fallback ל-clipboard)
- [x] OG דינמי — `generateMetadata` + `canonical` + `openGraph.url`
- [x] שיתוף רק לטיולים **approved** (כפתור מוסתר אחרת)

**Deliverables:**
- [x] `lib/utils/share.ts` — `shareTrip`, `buildTripShareUrl`
- [x] כפתור שיתוף ב-`trip-detail-hero` (wired)
- [x] OG: `canonicalPath` ב-`buildEntityMetadata` + `/trips/[id]`
- [x] (אופציונלי) אותו share ב-wizard results hero

**תלות:** אין. **מורכבות:** נמוכה–בינונית. **מומלץ כראשון.**

---

### 7.2 חיפוש גלובלי — ✅ הושלם

**מה זה:** שדה חיפוש אחד (header?) שמחפש trips + places + trails ביחד.

**החלטות (מומלץ — אושר):**
- [x] **Header + דף `/search`** — שניהם
- [x] **טאבים:** הכל | טיולים | מקומות | מסלולים
- [x] חיפוש **in-memory** (reuse repos) — Postgres FTS בשלב מאוחר
- [x] תוצאות רק **approved**

**Deliverables:**
- [x] `lib/data/search.ts` — `globalSearch()`
- [x] `HeaderSearch` ב-header + `/search?q=...`
- [x] טאבים + empty state בעברית + spinner

**תלות:** אין. **מורכבות:** בינונית.

---

### 7.3 התראות in-app (pending → approved) — ✅ הושלם

**מה זה:** bell/badge ב-header — "הטיול שלך אושר", "נדחה עם סיבה".

**החלטות (מומלץ — אושר):**
- [x] **Fetch בכניסה/רענון** — unread נשאר עד קריאה
- [x] **אירועים:** אישור/דחייה של place/trail/trip (התחלה)
- [x] **טבלת `notifications`** + RLS
- [x] **UI:** פעמון + dropdown + "ראה הכל" → `/notifications`
- [x] **mark as read:** per-click (+ "סמן הכל כנקרא")

**Deliverables:**
- [x] `supabase/schema/07_notifications.sql` — public + demo
- [x] `lib/data/notifications.ts` + `lib/utils/notification-content.ts`
- [x] יצירת התראה ב-`/api/notifications/content-status` (ליד מייל)
- [x] `NotificationBell` ב-header + `/notifications`

**המשך אפשרי (TODO):**
- [ ] התראת ברוכים הבאים in-app
- [x] תגובות/דירוגים על התוכן שלי — 7.9.3 (דורש migration kinds)
- [x] עדכון badge — Realtime (מיידי) + polling fallback
- [ ] קישור מ-email לאותה התראה (`?notification=`)

**תלות:** Resend + migrations. **מורכבות:** בינונית–גבוהה.

---

### 7.9 העדפות התראות + צלילים — `[~]` שלבים 1–2 הושלמו בקוד; נותר QA + שלב 3

**מה זה:** מסך הגדרות שבו המשתמש בוחר **אילו סוגי התראות** לקבל (in-app), ובשלב מאוחר — **צליל** כשמגיעה התראה חדשה.

**עקרונות (מומלץ — אושר בשיחה):**
- [x] **ברירת מחדל:** רק מה שרלוונטי ל"הדברים שלי" — מופעל; "תוכן חדש באתר" — **כבוי**
- [x] **צליל:** כבוי כברירת מחדל; ~10 צלילים + "נגן לדוגמה" — **שלב 2**
- [x] **מיקום UI:** `/profile` — סקשן "התראות" (או `/profile/notifications` אם יתנפח)
- [x] **סינון:** אם קטגוריה כבויה — **לא נוצרת** שורה ב-`notifications` (לא רק מוסתרת ב-UI)
- [x] **אימייל (Resend):** נשאר נפרד — שלב 1 רק in-app; יישור email↔prefs — עתידי

#### מיפוי קטגוריות → `NotificationKind` (נוכחי + עתידי)

| קטגוריה (UI) | סוגי התראה | ברירת מחדל | שלב |
|--------------|------------|------------|-----|
| סטטוס התוכן שלי | `content_approved`, `content_rejected` | ✅ | 1 |
| תשובה לדיווח שלי | `report_resolved`, `report_rejected` | ✅ | 1 |
| תגובות על התוכן שלי | (עתידי) | ✅ | 3 |
| דירוגים על התוכן שלי | (עתידי) | ✅ | 3 |
| תוכן חדש שאושר באתר | (עתידי — לפי אזור/סוג) | ❌ | 3 |
| עדכון במועדפים שלי | (עתידי) | ❌ | 3 |
| ברוכים הבאים | (עתידי) | ✅ | 3 |

#### שלב 1 — MVP: העדפות + סינון (P1) — ✅ הושלם

> **מטרה:** משתמש שולט במה מקבל; אין צלילים עדיין.

**DB:**
- [x] **P1** `supabase/schema/10_notification_preferences.sql` — טבלה `notification_preferences` (public + demo)
- [x] **P1** migration ב-Supabase (`public` + `demo`)
- [x] **P1** `handle_new_user` — שורת prefs למשתמש חדש + backfill לפרופילים קיימים

**Types + data:**
- [x] **P1** `types/notification-preferences.ts`
- [x] **P1** `lib/data/notification-preferences.ts`
- [x] **P1** `lib/notifications/preference-check.ts`
- [x] **P1** unit tests — `types/notification-preferences.test.ts`

**סינון ביצירת התראות:**
- [x] **P1** `lib/notifications/server.ts` — `shouldDeliverNotification` לפני insert/upsert

**UI:**
- [x] **P1** `notification-preferences-section.tsx` — 2 מתגים פעילים
- [x] **P1** שילוב ב-`profile-personal-area.tsx` — `#notifications`
- [x] **P1** קישור "הגדרות התראות" מה-dropdown של הפעמון

**בדיקות ידניות (עדיין פתוח — לסגור לפני 7.9.3 / 7.4):**
- [ ] כיבוי "סטטוס התוכן" → admin מאשר → **אין** התראה
- [ ] כיבוי "תשובה לדיווח" → admin מטפל → **אין** התראה
- [ ] פעמון: קריאה / לא-נקרא ברור; אין כפילויות של אותה התראה
- [ ] אדמין דיווחים: מוצג **שם ישות** (לא UUID); מדווח מקבל התראה על resolve/reject

---

#### שלב 2 — צלילים (P2) — ✅ הושלם

> **מטרה:** צליל אופציונלי כשמגיעה התראה **חדשה** (badge עלה).

**נכסים:**
- [x] **P2** `lib/notifications/sounds.ts` — 10 צלילים (Web Audio, ללא קבצי mp3)
- [x] **P2** מטא-דאטה + `playNotificationSound()`

**DB (הרחבה):**
- [x] **P2** `supabase/schema/11_notification_sound_prefs.sql` — `sound_enabled`, `sound_id`

**UI:**
- [x] **P2** מתג "צליל בהתראה חדשה"
- [x] **P2** רשימת 10 צלילים + **"נגן לדוגמה"**
- [x] **P2** הערה על חסימת דפדפן

**לוגיקת ניגון:**
- [x] **P2** `hooks/use-notification-sound.ts` + שילוב ב-`NotificationBell`
- [x] **P2** polling 45s + visibility refresh (כדי לזהות התראות חדשות)
- [x] **P2** `prefers-reduced-motion: reduce` — ללא צליל

**בדיקות ידניות:**
- [ ] צליל כבוי → badge עולה → שקט
- [ ] צליל מופעל + chime-3 → admin פעולה → נשמע
- [ ] "נגן לדוגמה" עובד

---

#### שלב 3 — קטגוריות מתקדמות + polling (P3) — `[~]` חלקי

> **מטרה:** התראות על תוכן שלא שלי. badge **מיידי** (Realtime) + polling כ-fallback.

**סוגי התראות חדשים (DB + kinds):**
- [x] **P3** `comment_on_my_content`, `rating_on_my_content`
- [x] **P3** `new_approved_place` / `trail` / `trip` — מסונן לפי `region_ids` בפרופיל
- [x] **P3** `favorite_entity_updated` — עריכת בעלים

**תשתית:**
- [x] **P3** הרחמת `notifications_kind_check` + `build*Notification` helpers (תגובה/דירוג)
- [x] **P3** API `/api/notifications/social` + שילוב ב-`social.ts`
- [x] **P3** API `/api/notifications/broadcast-approved` (דרך `content-status`) + `/favorite-updated`
- [x] **P3** Realtime על `notifications` + polling 60s fallback
- [x] **P3** מתגים: תגובות + דירוגים + תוכן חדש + מועדפים + בחירת אזורים
- [x] **P3** dedupe unread לפי user+kind+entity
- [x] **P3** הרצת `14_notifications_phase3.sql` (kinds)
- [x] **P3** הרצת `15_notifications_realtime.sql` — Realtime publication
- [x] **P3** הרצת `16_notifications_broadcast.sql` — kinds + region_ids
- [x] **P3** הרצת `17_content_delete_hardening.sql` — חסימת מחיקת מאושר

**מורכבות:** גבוהה. **תלות:** שלב 1–2.

---

#### סדר ביצוע 7.9

```
7.9.1 העדפות + סינון (שלב 1)  ✅
7.9.2 צלילים (שלב 2)          ✅
7.9.3 קטגוריות + polling ← `[~]` תגובות/דירוגים ✅; migration kinds + QA; תוכן חדש/מועדפים — עתידי
```

#### שאלות פתוחות (לפני שלב 3 בלבד)

- [x] "תוכן חדש" — לפי **אזורים** בפרופיל (`region_ids`)
- [ ] email + in-app — אותה העדפה או מסכים נפרדים?
- [x] Realtime בשלב 3 — כן (מיידי) + polling fallback

#### ניקוי / follow-up סביב 7.9 + אדמין (לא חוסם)

- [x] הסרת checkbox "הצג תוכן E2E" מ-UI אדמין (סינון שקט נשאר)
- [x] seed demo: ~10 pending לכל ישות + ניקוי `E2E %` (רץ ב-DB)
- [x] תיקון טקסט `"יehuda"` → `"יהודה"` ב-`supabase/schema/13_demo_pending_review_seed.sql`
- [x] מחיקת קבצים זמניים: `supabase/schema/_seed_chunks/`, `_seed_body.sql`
- [ ] יישור email↔prefs (Resend) — עתידי, לא חלק מ-7.9.3

---

### 7.4 ייבוא / ייצוא GPX — ✅ הושלם בקוד

**מה זה:** הורדת קובץ GPX (GPS) ממקום / מסלול / טיול; העלאת GPX ליצירת מסלול.

**החלטות (אושר בשיחה):**
- [x] **סדר:** ייצוא קודם → ייבוא אחר כך (שלב נפרד)
- [x] **ייצוא מ:** מקום (נקודה) + מסלול (track) + טיול (תחנות)
- [x] **ייבוא:** יוצר **trail חדש (pending)**; שאר השדות — השלמה בטופס עריכה
- [x] **ספרייה:** ללא תלות חיצונית — XML ידני (serialize + parse)

#### שלב א — ייצוא — ✅

**Deliverables:**
- [x] `lib/utils/gpx.ts` — `placeToGpx` / `trailToGpx` / `tripToGpx` + `downloadGpx`
- [x] unit tests — `lib/utils/gpx.test.ts`
- [x] "הורד מסלול GPS" תחת מפה — place / trail / trip detail
- [x] בדיקה ידנית: הורדה מכל סוג + פתיחה באפליקציית מפות

#### שלב ב — ייבוא — ✅

- [x] `parseGpx` / `gpxImportToCreateTrailInput` — parse + נקודות מסלול
- [x] יצירת trail חדש (pending) עם waypoints מהקובץ
- [x] הפניה ל-`/trails/[id]/edit` להשלמת שאר השדות
- [x] upload ב-`/trails/create` — `TrailGpxImport`
- [x] upload ב-`/places/create` — `PlaceGpxImport`
- [x] upload ב-`/trips/create` — `TripGpxImport` (round-trip מ-GPX שייצא מהאתר בלבד)
- [x] בדיקה ידנית: ייבוא GPX → עריכה → שליחה לאישור (מסלול / מקום / טיול)

**תלות:** lat/lng / waypoints. **מורכבות:** נמוכה–בינונית (ייצוא); בינונית (ייבוא).

---

### 7.5 המלצות AI (מעבר ל-assistant בטפסים) — `[~]` שלב 1 (Demo)

**מה זה:** המלצות אחרי האשף — match-score בוחר; בעתיד AI רק מנסח הסבר.

**החלטות (אושר):**
- [x] **מנוע:** Demo (rules) עכשיו → Demo + OpenAI להסבר בעתיד (AI לא בוחר טיולים)
- [x] **מיקום:** רק `/wizard/results` אחרי העדפות
- [x] **סיגנלים:** העדפות האשף בלבד (לא favorites/history בשלב זה)

#### שלב 1 — Demo / UX (P1) — ✅ בקוד
- [x] **P1** `buildMatchExplanation()` — הסברים עשירים בעברית (hook מוכן ל-AI)
- [x] **P1** `MIN_MATCH_SCORE = 40` + סינון ב-`rankTripsByMatch`
- [x] **P1** empty state משופר (שינוי העדפות / לכל הטיולים)
- [x] **P1** analytics: `wizard_results_viewed`, `wizard_trip_selected`
- [x] **P1** unit tests ל-match-score / explanation / min score

#### שלב 2 — OpenAI הסבר (P3) — עתידי
- [ ] `OPENAI_API_KEY` + route `/api/wizard/explain-match`
- [ ] UI בלוק "הסבר AI" עם fallback ל-`buildMatchExplanation`
- [ ] קריאה רק לטיול המוצג (לא לכל המועמדים)

**תלות:** wizard + `match-score.ts`. **מורכבות:** שלב 1 נמוכה; שלב 2 בינונית.

---

### 7.6 רב-לשוני (עברית + אנגלית)

**מה זה:** `/en/...` או toggle שפה — תוכן UI + (אולי) תוכן entities.

**שאלות לפני שמתחילים:**
- [ ] **UI בלבד** (next-intl) או גם **תוכן DB** (name/description באנגלית)?
- [ ] **URL strategy:** `/en/trips` (subpath) vs `?lang=en` vs cookie?
- [ ] **ברירת מחדל** נשארת עברית RTL — אנגלית LTR לדפים מלאים?
- [ ] entities: שדות `name_en` ב-DB או טבלת translations?

**Deliverables:**
- [ ] `next-intl` (או i18n routing ב-App Router)
- [ ] קבצי `messages/he.json`, `messages/en.json`
- [ ] (שלב 2) תרגום תוכן — scope נפרד

**תלות:** גדול — נוגע בכל דף. **מורכבות:** גבוהה. **מומלץ late.**

---

### 7.7 PWA / offline drafts

**מה זה:** "התקן אפליקציה" + שמירת טיוטת create offline.

**שאלות לפני שמתחילים:**
- [ ] **PWA מלא** (service worker + cache) או רק **manifest** + icon?
- [ ] offline: רק **trip create draft** (localStorage כבר קיים) או גם קריאת trips?
- [ ] sync בחזרה online — conflict resolution?
- [ ] Vercel / HTTPS — PWA דורש production?

**Deliverables:**
- [ ] `manifest.json` + icons
- [ ] (אופציונלי) next-pwa / serwist
- [ ] הרחבת `trip-create-draft` ל-offline indicator

**תלות:** `lib/utils/trip-create-draft.ts`. **מורכבות:** בינונית–גבוהה.

---

### 7.8 Analytics (Vercel / Plausible) — ✅ הושלם

**מה זה:** מדידת צפיות, wizard completions, signups.

**החלטות (מומלץ — אושר):**
- [x] **provider אחד** דרך env: `vercel` | `plausible` | ריק (= כבוי)
- [x] **אירועים:** page views (provider) + `wizard_completed`, `trip_created`, `trip_shared`, `user_registered`
- [x] **ללא cookie banner** — Plausible/Vercel Analytics ללא cookies (בהגדרה סטנדרטית)
- [x] **production בלבד** — dev כבוי; `NEXT_PUBLIC_ANALYTICS_DEBUG=true` לבדיקה

**Deliverables:**
- [x] `components/analytics/analytics-scripts.tsx` + `app/layout.tsx`
- [x] `lib/analytics/track.ts` — `trackEvent()` typed
- [x] `.env.example` — `NEXT_PUBLIC_ANALYTICS_PROVIDER`, `PLAUSIBLE_DOMAIN`, `ANALYTICS_DEBUG`
- [x] hooks: wizard results, trip create, share, register

---

### סדר מומלץ לשלב 7

```
7.1 שיתוף          ← מהיר, value גבוה, אין DB
7.8 Analytics      ← מהיר, לפני production
7.2 חיפוש גלובלי   ← UX חזק
7.3 התראות in-app  ← משלים emails
7.9 העדפות התראות  ← 1–2 ✅ בקוד; QA ידני → אחר כך 7.9.3 או דילוג ל-7.4
7.4 GPX            ← ✅ בקוד; QA ייבוא ידני
7.5 AI המלצות      ← תלוי החלטת OpenAI
7.7 PWA            ← אחרי יציבות
7.6 i18n           ← הכי invasive — אחרון
```

### מה לעשות עכשיו?

1. **QA ידני ל-7.5 שלב 1** — אשף → תוצאות: הסברים, ציון ≥40%, empty state כשאין התאמה.
2. **QA ידני ל-7.9** — כיבוי מתגים / הסרה מהאתר (אם עדיין פתוח).
3. **הבא בקוד:** 7.5 שלב 2 (OpenAI) כשמוכנים למפתח — או שלבי production checklist.

---

## סדר ביצוע מומלץ

```
שבוע 1–2:  שלב 1 (edit places + edit trails)     ← עדיפות עליונה
שבוע 2:    שלב 2 (README, .env.example, migrations, fixes)
שבוע 3:    שלב 3 (stats אמיתיים, SEO home)
שבוע 4:    שלב 4 (loading/error, SEO pages)
שבוע 5+:   שלב 5–6 (tests, CI, cleanup)
עתיד:      שלב 7
```

---

## Checklist לפני Production

- [ ] כל routes ב-README קיימים ועובדים
- [ ] `.env.example` מלא
- [ ] migrations ב-repo
- [ ] edit places/trails עובד
- [ ] admin gate טקסט נכון
- [ ] stats דף בית אמיתיים
- [ ] `npm run build` עובר
- [ ] `npm run verify:dev` עובר
- [ ] לפחות smoke tests E2E
- [ ] RLS policies נבדקו לכל entity

---

## ספרינט שיפורים (אוג׳ 2026) — אחרי 7.9 + 7.5 Demo

> מבוסס על מפת השיפורים. סדר: P0 מהיר → תשתית → ליטוש.

### S1 — Auth / סיסמה (P0)
- [x] **P0** שכחתי סיסמה — `/forgot-password` + מייל Supabase + `/reset-password`
- [x] **P0** יישור סיסמה ל-min 8 (פרופיל + `changePassword`)

### S2 — תמונות תוכן → Storage (P0)
- [x] **P0** bucket `content-images` + RLS
- [x] **P0** `uploadContentImage()` + `TripImageField` בלי data URL ב-DB

### S3 — SEO / שגיאות (P1)
- [x] **P1** `app/sitemap.ts` + `app/robots.ts`
- [x] **P1** `error.tsx` ל-search / profile / wizard / notifications

### S4 — אימות + ביצועים (המשך)
- [ ] **P0** QA ידני: עריכה / התראות / wizard results
- [x] **P1** E2E: edit → pending → admin approve (`e2e/content-moderation.spec.ts`)
- [ ] **P2** server pagination לרשימות
- [ ] **P2** admin counts ב-SQL count

---

## Reference — Routes מלא (מצב נוכחי)

| Route | קיים | הערה |
|-------|------|------|
| `/` | ✅ | stats מה-DB, SEO, Suspense |
| `/trips` | ✅ | |
| `/trips/[id]` | ✅ | |
| `/trips/create` | ✅ | |
| `/trips/[id]/edit` | ✅ | קוד + RLS הושלמו — נותרה בדיקה ידנית |
| `/places` | ✅ | |
| `/places/[id]` | ✅ | |
| `/places/create` | ✅ | |
| `/places/[id]/edit` | ✅ | קוד + RLS הושלמו — נותרה בדיקה ידנית |
| `/trails` | ✅ | |
| `/trails/[id]` | ✅ | |
| `/trails/create` | ✅ | |
| `/trails/[id]/edit` | ✅ | קוד + RLS הושלמו — נותרה בדיקה ידנית |
| `/wizard` | ✅ | |
| `/search` | ✅ | חיפוש גלובלי — header + טאבים |
| `/notifications` | ✅ | התראות in-app |
| `/wizard/results` | ✅ | |
| `/login`, `/register` | ✅ | |
| `/forgot-password` | ✅ | איפוס סיסמה |
| `/reset-password` | ✅ | אחרי קישור מהמייל |
| `/profile`, `/profile/content` | ✅ | |
| `/profile#notifications` | ✅ | העדפות התראות — שלב 7.9.1 |
| `/admin/*` | ✅ | |

---

## הערות

- **לא לשנות קוד** עד אישור — קובץ זה תוכנית בלבד.
- כל task P0 בשלב 1 דורש גם בדיקה ידנית + וידוא RLS.
- לפני כל שלב: `npm run verify:dev` אחרי שינויי UI.
