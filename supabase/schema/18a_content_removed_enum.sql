-- Step 1: enum value must commit before use in policies (Postgres 55P04).
alter type public.status add value if not exists 'removed';
