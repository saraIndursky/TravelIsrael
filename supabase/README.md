# Supabase — schema and demo data

This folder is a **baseline snapshot of the live database**, not a migration history.

The base `public` schema was created in the dashboard before migrations were introduced, so
`supabase_migrations.schema_migrations` contains only the later changes. The files here were
exported from the database itself and reflect what actually runs in project
`xsfbqypayaznaonsprzn`.

The files are not currently connected to the Supabase CLI — they are used for documentation,
code review and recovery. After `supabase link` they can become the first migration.

## Structure

| File | Contents |
| --- | --- |
| `schema/01_enums.sql` | All enums (shared by both schemas) |
| `schema/02_tables_public.sql` | Tables, keys, constraints and indexes of `public` |
| `schema/03_functions_public.sql` | Functions, RPCs, the sign-up hook and triggers |
| `schema/04_policies_public.sql` | RLS of `public` |
| `schema/05_storage.sql` | The avatars bucket and its access policies |
| `schema/06_demo_schema.sql` | The full `demo` schema |
| `seed/demo_seed.sql` | Demo data (239 rows) |
| `schema/14_notifications_phase3.sql` | Social notification kinds (comment/rating) — public + demo |
| `schema/15_notifications_realtime.sql` | Realtime publication — instant badge on the bell |
| `schema/16_notifications_broadcast.sql` | Kinds for new content/favorites + `region_ids` in preferences |
| `schema/17_content_delete_hardening.sql` | Blocks hard deletion of approved content |
| `schema/25_region_requests.sql` | A user can suggest a new region (pending until an admin approves it or the content) — public + demo |
| `schema/26_dedupe_regions.sql` | Merges duplicate regions ("מרכז" and "צפון" nested in themselves) — public + demo |
| `schema/27_contact_messages.sql` | Contact form messages (anyone can send, only admins can read) — public + demo |
| `schema/28_profile_privacy.sql` | Profile privacy: email and role visible only to the owner and admins; name and avatar through the public_profiles view; app_config closed — public + demo |
| `schema/29_security_hardening.sql` | Hardening: only admins change roles, content is created only as draft/pending, view/rating/favorite counters in triggers, length constraints, execute permissions — public + demo |
| `schema/30_role_change_reauth.sql` | Changing a role requires a fresh password check (up to 5 minutes), and blocks self-changes and removing the last admin — public + demo |
| `schema/31_account_deletion.sql` | Self-service account deletion (`delete_my_account`, requires a fresh password check): approved content moves to a "TravelIsrael" system profile (an admin no one can log in as), and drafts, pending content, comments, ratings and favorites are deleted — public + demo |
| `schema/32_comment_edit_requeue.sql` | An edited comment returns to the moderation queue as unseen, so editing cannot bypass review — public + demo |
| `schema/33_text_limits.sql` | Length limits on user text and no `javascript:`/`data:` URLs in a place's website — public + demo |

## Running SQL on the live project

There is no local `supabase link`. Option A:

1. **SQL Editor** in the dashboard — paste the file contents.

Option B (CLI, without MCP):

```bash
# Once — log in and link the project
npx supabase login
npx supabase link --project-ref xsfbqypayaznaonsprzn

npm run db:execute -- supabase/schema/14_notifications_phase3.sql
```

Or with `DATABASE_URL` (connection string from the dashboard), without linking:

```bash
set DATABASE_URL=postgresql://postgres.[ref]:[password]@...
npm run db:execute -- supabase/schema/14_notifications_phase3.sql
```

## Running on an empty database

In this order:

```
schema/01_enums.sql
schema/02_tables_public.sql
schema/03_functions_public.sql
schema/04_policies_public.sql
schema/05_storage.sql
schema/06_demo_schema.sql
seed/demo_seed.sql
```

`03` references `demo.resolve_bootstrap_role`, so if `handle_new_user` runs before `06`, run it
again afterwards — or temporarily remove the demo sync block.

## The demo schema

A full copy of `public` in the same project, for testing flows against rich data without touching
production. Switch between them with `NEXT_PUBLIC_SUPABASE_SCHEMA=public|demo`.

Shared by both: `auth.users` (the same accounts), Storage and all enums.
Everything else is separate, including `is_admin()` and the four RPCs.

**Manual dashboard step:** add `demo` under Settings → API → Exposed schemas.
Without it PostgREST will not serve the schema and the app will get errors.

### Demo data

15 regions, 3 profiles, 20 places, 12 trails, 11 trips (30 stops),
76 ratings, 33 reviews, 34 favorites, 4 reports.
The content covers every status (`draft`, `pending`, `approved`, `rejected`).

## RPCs

All are `SECURITY DEFINER` and check permissions themselves through `is_admin()` before any change.
They exist in both schemas.

| RPC | What it does |
| --- | --- |
| `resolve_bootstrap_role(email)` | Returns the role for a new user. The first user gets `admin`; after that only the address in `app_config.bootstrap_admin_email` |
| `sync_bootstrap_admin(id, email)` | Promotes an existing user to `admin` if eligible. Never lowers a role |
| `admin_update_user_role(id, role)` | Manual role change by an admin |
| `approve_trip_cascade(trip_id)` | Approves a trip together with its pending places and trails |

## Known gaps

- `trips_update` in both schemas is still the permissive version — the owner can edit an approved
  trip and set any status. `places` and `trails` are already tightened. To be tightened together with
  the trip editing flow (step 1.3 in `TODO.md`).
- `on delete` differences between the schemas are documented at the top of `schema/06_demo_schema.sql`.
- `demo` does not have the `region_id` indexes that `public` has.

## Regenerating the seed

Run against the database and collect the `stmt` column in order:

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

`jsonb_populate_record` was chosen because it handles enums, arrays and jsonb correctly without
building a column list by hand. The table order follows the dependencies; `regions` are sorted by
hierarchy depth because the self-referencing FK is not `deferrable`.
