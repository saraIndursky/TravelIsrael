# Supabase — סכמה ונתוני דמו

תיקייה זו היא **תמונת מצב (baseline) של המסד החי**, לא היסטוריית מיגרציות.

הסכמה הבסיסית של `public` נוצרה דרך הדשבורד לפני שהתחילו להיווצר מיגרציות,
ולכן `supabase_migrations.schema_migrations` מכיל רק את השינויים המאוחרים.
הקבצים כאן הופקו מהמסד עצמו ומשקפים את מה שרץ בפועל בפרויקט
`xsfbqypayaznaonsprzn`.

הקבצים אינם מחוברים כרגע ל-Supabase CLI — הם משמשים לתיעוד, לצורך code review
ולשחזור. אחרי `supabase link` אפשר להפוך אותם למיגרציה ראשונה.

## מבנה

| קובץ | תוכן |
| --- | --- |
| `schema/01_enums.sql` | כל ה-enums (משותפים לשתי הסכמות) |
| `schema/02_tables_public.sql` | טבלאות, מפתחות, אילוצים ואינדקסים של `public` |
| `schema/03_functions_public.sql` | פונקציות, RPCs, hook ההרשמה וטריגרים |
| `schema/04_policies_public.sql` | RLS של `public` |
| `schema/05_storage.sql` | bucket ה-avatars ומדיניות הגישה אליו |
| `schema/06_demo_schema.sql` | סכמת `demo` במלואה |
| `seed/demo_seed.sql` | נתוני הדמו (239 שורות) |
| `schema/14_notifications_phase3.sql` | kinds חברתיים (תגובה/דירוג) — public + demo |
| `schema/15_notifications_realtime.sql` | Realtime publication — badge מיידי בפעמון |
| `schema/16_notifications_broadcast.sql` | kinds לתוכן חדש/מועדפים + `region_ids` בהעדפות |
| `schema/17_content_delete_hardening.sql` | חסימת מחיקה hard של תוכן מאושר |
| `schema/25_region_requests.sql` | הצעת אזור חדש על ידי משתמש (ממתין עד אישור מנהל או אישור התוכן) — public + demo |
| `schema/26_dedupe_regions.sql` | איחוד אזורים כפולים ("מרכז" ו"צפון" בתוך עצמם) — public + demo |
| `schema/27_contact_messages.sql` | פניות מטופס יצירת הקשר (כולם שולחים, רק מנהל קורא) — public + demo |
| `schema/28_profile_privacy.sql` | פרטיות פרופילים: מייל ותפקיד נראים רק לבעלים ולמנהלים; שם ותמונה דרך התצוגה public_profiles; app_config סגור — public + demo |

## הרצת SQL על הפרויקט החי

אין `supabase link` מקומי. אפשרות א:

1. **SQL Editor** בדשבורד — להדביק את תוכן הקובץ.

אפשרות ב (CLI, בלי MCP):

```bash
# פעם אחת — התחברות + קישור לפרויקט
npx supabase login
npx supabase link --project-ref xsfbqypayaznaonsprzn

npm run db:execute -- supabase/schema/14_notifications_phase3.sql
```

או עם `DATABASE_URL` (connection string מהדשבורד) בלי link:

```bash
set DATABASE_URL=postgresql://postgres.[ref]:[password]@...
npm run db:execute -- supabase/schema/14_notifications_phase3.sql
```

## הרצה על מסד ריק

לפי הסדר:

```
schema/01_enums.sql
schema/02_tables_public.sql
schema/03_functions_public.sql
schema/04_policies_public.sql
schema/05_storage.sql
schema/06_demo_schema.sql
seed/demo_seed.sql
```

`03` מפנה ל-`demo.resolve_bootstrap_role`, ולכן אם מריצים את `handle_new_user`
לפני `06` יש להריץ אותו שוב אחרי — או להסיר זמנית את בלוק הסנכרון ל-demo.

## סכמת demo

עותק מלא של `public` באותו פרויקט, כדי לבדוק זרימות מול נתונים עשירים בלי לגעת
בפרודקשן. המעבר ביניהן נעשה עם `NEXT_PUBLIC_SUPABASE_SCHEMA=public|demo`.

משותף לשתיהן: `auth.users` (אותם חשבונות), Storage וכל ה-enums.
שאר הדברים עצמאיים, כולל `is_admin()` וארבעת ה-RPCs.

**צעד ידני בדשבורד:** להוסיף `demo` ל-Settings → API → Exposed schemas.
בלי זה PostgREST לא יגיש את הסכמה והאפליקציה תקבל שגיאות.

### נתוני הדמו

15 אזורים, 3 פרופילים, 20 מקומות, 12 מסלולים, 11 טיולים (30 תחנות),
76 דירוגים, 33 ביקורות, 34 מועדפים, 4 דיווחים.
התוכן פרוס על כל הסטטוסים (`draft`, `pending`, `approved`, `rejected`).

## RPCs

כולם `SECURITY DEFINER` ובודקים הרשאות בעצמם דרך `is_admin()` לפני כל שינוי.
קיימים בשתי הסכמות.

| RPC | מה עושה |
| --- | --- |
| `resolve_bootstrap_role(email)` | מחזיר את התפקיד למשתמש חדש. המשתמש הראשון במערכת מקבל `admin`; אחריו רק הכתובת ב-`app_config.bootstrap_admin_email` |
| `sync_bootstrap_admin(id, email)` | מקדם משתמש קיים ל-`admin` אם מגיע לו. לעולם לא מוריד תפקיד |
| `admin_update_user_role(id, role)` | שינוי תפקיד ידני על ידי מנהל |
| `approve_trip_cascade(trip_id)` | מאשר טיול, ויחד איתו כל מקום/מסלול שלו שממתין לאישור |

## פערים ידועים

- `trips_update` בשתי הסכמות עדיין בגרסה המקלה — הבעלים יכול לערוך טיול מאושר
  ולקבוע לו כל סטטוס. ב-`places` וב-`trails` זה כבר הודק. להידוק יחד עם זרימת
  עריכת הטיול (שלב 1.3 ב-`TODO.md`).
- הבדלי `on delete` בין הסכמות מתועדים בראש `schema/06_demo_schema.sql`.
- ל-`demo` אין את אינדקסי ה-`region_id` שיש ל-`public`.

## הפקה מחדש של ה-seed

הרצה מול המסד, ואיסוף עמודת `stmt` לפי הסדר:

```sql
with recursive tree as (
  select r.id, 0 as depth from demo.regions r where r.parent_id is null
  union all
  select r.id, tree.depth + 1 from demo.regions r join tree on r.parent_id = tree.id
),
s as (
  select 1 as ord, tree.depth as sub,
    'insert into demo.regions select * from jsonb_populate_record(null::demo.regions, '
    || quote_literal(to_jsonb(r)::text) || '::jsonb) on conflict (id) do nothing;' as stmt
  from demo.regions r join tree on tree.id = r.id
  union all select 2, 0, 'insert into demo.profiles select * from jsonb_populate_record(null::demo.profiles, '      || quote_literal(to_jsonb(t)::text) || '::jsonb) on conflict (id) do nothing;'  from demo.profiles t
  union all select 3, 0, 'insert into demo.places select * from jsonb_populate_record(null::demo.places, '          || quote_literal(to_jsonb(t)::text) || '::jsonb) on conflict (id) do nothing;'  from demo.places t
  union all select 4, 0, 'insert into demo.trails select * from jsonb_populate_record(null::demo.trails, '          || quote_literal(to_jsonb(t)::text) || '::jsonb) on conflict (id) do nothing;'  from demo.trails t
  union all select 5, 0, 'insert into demo.trips select * from jsonb_populate_record(null::demo.trips, '            || quote_literal(to_jsonb(t)::text) || '::jsonb) on conflict (id) do nothing;'  from demo.trips t
  union all select 6, 0, 'insert into demo.trip_stations select * from jsonb_populate_record(null::demo.trip_stations, ' || quote_literal(to_jsonb(t)::text) || '::jsonb) on conflict (id) do nothing;' from demo.trip_stations t
  union all select 7, 0, 'insert into demo.ratings select * from jsonb_populate_record(null::demo.ratings, '        || quote_literal(to_jsonb(t)::text) || '::jsonb) on conflict (id) do nothing;'  from demo.ratings t
  union all select 8, 0, 'insert into demo.comments select * from jsonb_populate_record(null::demo.comments, '      || quote_literal(to_jsonb(t)::text) || '::jsonb) on conflict (id) do nothing;'  from demo.comments t
  union all select 9, 0, 'insert into demo.favorites select * from jsonb_populate_record(null::demo.favorites, '    || quote_literal(to_jsonb(t)::text) || '::jsonb) on conflict (id) do nothing;'  from demo.favorites t
  union all select 10, 0, 'insert into demo.reports select * from jsonb_populate_record(null::demo.reports, '       || quote_literal(to_jsonb(t)::text) || '::jsonb) on conflict (id) do nothing;'  from demo.reports t
  union all select 11, 0, 'insert into demo.app_config select * from jsonb_populate_record(null::demo.app_config, ' || quote_literal(to_jsonb(t)::text) || '::jsonb) on conflict (key) do nothing;' from demo.app_config t
)
select stmt from s order by ord, sub, stmt;
```

`jsonb_populate_record` נבחר כי הוא מטפל נכון ב-enums, במערכים וב-jsonb בלי
לבנות רשימת עמודות ידנית. סדר הטבלאות הוא סדר התלויות; `regions` ממוינות לפי
עומק ההיררכיה כי ה-FK העצמי אינו `deferrable`.
