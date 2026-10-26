# `data/seed/` — reference data for the AI assistant only

Static files for the **demo assistant** (`lib/assistant/seed-lookup.ts`): matching place and trail names,
detecting the region, and approximate coordinates when there is no match in Supabase.

This is **not** the app's data source. All UI and pages read from `lib/data/` → Supabase.

Do not add new production entities here. To update the real demo data, use `supabase/seed/demo_seed.sql`.
