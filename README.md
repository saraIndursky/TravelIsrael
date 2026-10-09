# TravelIsrael

פלטפורמת Web לתכנון, גילוי ושיתוף טיולים בישראל. ממשק בעברית, RTL, mobile-first.

## Tech Stack

- Next.js 14 (App Router) · React 18 · TypeScript strict
- Tailwind CSS + shadcn/ui
- Supabase — Auth, Postgres עם RLS, Storage
- Zustand לניהול state של האשף · React Hook Form + Zod לטפסים
- Leaflet למפות

## התחלה

```bash
npm install
cp .env.example .env.local   # ומלאו את הערכים
npm run dev
```

פתחו [http://localhost:3000](http://localhost:3000).

`.env.example` מתעד כל משתנה. המינימום הנדרש הוא `NEXT_PUBLIC_SUPABASE_URL`
ומפתח ציבורי אחד. שינוי של משתנה `NEXT_PUBLIC_` דורש הפעלה מחדש של שרת הפיתוח,
כי הערך מוטבע בקוד בזמן ה-build.

## סקריפטים

| פקודה | מה עושה |
| --- | --- |
| `npm run dev` | שרת פיתוח |
| `npm run dev:clean` | מחיקת cache של `.next` ואז dev — כשיש 404 על קבצים סטטיים |
| `npm run verify:dev` | בדיקה שה-wizard וה-CSS מוגשים כראוי |
| `npm run build` | build לפרודקשן. נחסם אוטומטית אם שרת פיתוח רץ על פורט 3000 |
| `npm run lint` | ESLint |
| `npm run test` | unit tests (Vitest) |
| `npm run test:e2e` | E2E (Playwright) — דורש Supabase; login/trip/אישור דורשים `E2E_USER_*` |

## בדיקות

- **Unit** — `npm run test` (Vitest): חישובי טיול, match score, Zod validations
- **E2E** — `npm run test:e2e` (Playwright): אשף, התחברות+פרופיל, יצירת טיול, עריכה+אישור מקום
- **CI** — `.github/workflows/ci.yml` מריץ typecheck, lint, unit, build, ו-E2E

### Lint & format

הפרויקט נשאר על **ESLint** (`eslint-config-next`) — לא Biome, כדי להימנע מכפילות עם Next.js.
pre-commit מריץ `lint-staged` על קבצי `.ts/.tsx` (דורש `npm install` פעם אחת להפעלת ה-hook).

### Branch protection (GitHub)

מומלץ על `main`: דרוש PR, דרוש status check `verify`, ואופציונלית `e2e` אחרי הוספת secrets:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`.


הסכמה המלאה מתועדת ב-[`supabase/README.md`](supabase/README.md), כולל ה-RLS,
ה-RPCs ונתוני הדמו.

### שתי סכמות

`public` היא הסביבה האמיתית. `demo` היא עותק מלא באותו פרויקט עם נתוני בדיקה
עשירים, לבדיקת זרימות בלי לגעת בפרודקשן. המעבר ביניהן:

```
NEXT_PUBLIC_SUPABASE_SCHEMA=demo
```

שתיהן חולקות את `auth.users` — אותם חשבונות, אותן סיסמאות.

### הרשאות

נאכפות ב-RLS ברמת המסד, לא בקוד הלקוח:

- **אורח** — קורא תוכן מאושר בלבד
- **משתמש** — CRUD על תוכן שיצר, ועל הדירוגים, הביקורות והמועדפים שלו
- **מנהל** — גישה מלאה, אישור ודחייה של תוכן, טיפול בדיווחים

מחזור חיים של תוכן: `draft → pending → approved | rejected → (עריכה) → pending`.
בעלים יכול לערוך רק כשהפריט `pending` או `rejected`, וכל עריכה מחזירה אותו
ל-`pending`. רק מנהל יכול להעביר ל-`approved`.

### מנהל ראשון

המשתמש הראשון שנרשם למערכת מקבל אוטומטית תפקיד `admin`. אחריו, רק הכתובת
שמוגדרת ב-`NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL` תקודם. קידום בלבד — התפקיד
לעולם לא יורד אוטומטית.

## Routes

| Route | תיאור |
| --- | --- |
| `/` | דף הבית |
| `/login`, `/register` | התחברות והרשמה |
| `/trips`, `/trips/[id]` | גילוי טיולים ודף טיול |
| `/trips/create`, `/trips/[id]/edit` | יצירה ועריכה של טיול |
| `/places`, `/places/[id]` | מקומות |
| `/places/create`, `/places/[id]/edit` | יצירה ועריכה של מקום |
| `/trails`, `/trails/[id]` | מסלולים |
| `/trails/create`, `/trails/[id]/edit` | יצירה ועריכה של מסלול |
| `/wizard`, `/wizard/results` | אשף התאמת טיולים |
| `/profile`, `/profile/trips`, `/profile/content` | אזור אישי |
| `/admin` | פאנל ניהול |
| `/admin/trips`, `/admin/places`, `/admin/trails` | אישור ודחייה של תוכן |
| `/admin/users`, `/admin/regions`, `/admin/reports` | ניהול משתמשים, אזורים ודיווחים |

## מבנה התיקיות

```
app/                 עמודים (App Router)
components/
  ui/                פרימיטיבים של shadcn
  layout/            Header, Footer, MobileNav
  features/          trips, places, trails, wizard, admin, profile
lib/
  data/              שכבת גישה לנתונים — כל query ו-mutation עוברים כאן
  supabase/          יצירת clients, mappers, הגדרת הסכמה
  utils/             עזרים
  validations/       סכמות Zod
types/               טיפוסי TypeScript
hooks/               hooks מותאמים
supabase/            תיעוד סכמת המסד ונתוני הדמו
scripts/             סקריפטים לתחזוקת סביבת הפיתוח
```

## עוזר ה-AI

יצירת תוכן נעזרת בעוזר שממלא שדות בטופס. ברירת המחדל היא `ASSISTANT_MODE=demo`
— עוזר מקומי מבוסס חוקים, בלי קריאות חוץ ובלי עלות. עם `ASSISTANT_MODE=openai`
ומפתח `OPENAI_API_KEY` הוא עובר ל-OpenAI, ונופל חזרה ל-demo אם המפתח חסר.

## פיתוח בסביבת Windows

דף לבן או HTML בלי עיצוב נובעים כמעט תמיד מ-cache שבור של `.next`. שלושה כללים
מונעים את זה:

1. לא להריץ `npm run build` בזמן ששרת הפיתוח פעיל
2. לא למחוק את `.next` לפני עצירת שרת הפיתוח
3. אחרי שינויי עיצוב — `npm run verify:dev`, ואם נכשל אז `npm run dev:clean`

נבנה עם ❤️ לטיילי ישראל
