-- Accessibility and difficulty levels as lookup tables (public + demo).
--
-- Until now the meaning of "accessibility 1-5" lived only in code (in three different wordings) and
-- difficulty was a three-value enum. Both become small lookup tables, so the names, the order and
-- the explanation shown to users have one home. Idempotent: running it again keeps edited rows.
--
-- accessibility_levels  level 1-5, name, description. places/trails/trips.accessibility now
--                       reference it.
-- difficulty_levels     code, name, description, sort_order. trails/trips.difficulty change from the
--                       three-value enum to text that references it, which allows six levels
--                       (easy, easy_medium, medium, medium_hard, hard, challenging). Existing
--                       easy/medium/hard rows keep their meaning. The old enum type is left in place.
--
-- Everyone can read both tables; only admins can change them.

do $$
declare
  s text;
  t text;
begin
  foreach s in array array['public', 'demo'] loop
    -- ── accessibility_levels ────────────────────────────────────
    execute format($f$
      create table if not exists %1$I.accessibility_levels (
        level       smallint primary key check (level between 1 and 5),
        name        text not null check (char_length(name) between 1 and 40),
        description text not null check (char_length(description) <= 600)
      )
    $f$, s);

    execute format($f$
      insert into %1$I.accessibility_levels (level, name, description) values
        (1, 'לא נגיש', 'שטח לא סלול, מדרגות או שיפועים חדים. לא מתאים לכיסא גלגלים או לעגלה.'),
        (2, 'נגישות מוגבלת', 'חלק מהאתר נגיש, ויש קטעים עם מדרגות או שביל לא סלול. מתאים להולכים עם קושי קל, לא לכיסא גלגלים.'),
        (3, 'נגישות בינונית', 'רוב האתר על משטח יציב ושטוח. עגלה אפשרית, כיסא גלגלים בליווי. ייתכנו מכשולים או שירותים לא נגישים.'),
        (4, 'נגישות גבוהה', 'משטח סלול, שיפועים מתונים, חניית נכים ושירותים נגישים. כיסא גלגלים עצמאי ברוב האתר.'),
        (5, 'נגישות מלאה', 'נגיש כולו לכיסא גלגלים, בלי מדרגות, עם חניה ושירותים נגישים.')
      on conflict (level) do nothing
    $f$, s);

    -- ── difficulty_levels ───────────────────────────────────────
    execute format($f$
      create table if not exists %1$I.difficulty_levels (
        code        text primary key check (code ~ '^[a-z][a-z_]{0,29}$'),
        name        text not null check (char_length(name) between 1 and 40),
        description text not null default '' check (char_length(description) <= 600),
        sort_order  smallint not null unique
      )
    $f$, s);

    execute format($f$
      insert into %1$I.difficulty_levels (code, name, description, sort_order) values
        ('easy',         'קל',         'הליכה קצרה על שביל מסודר, בלי עליות משמעותיות. מתאים לכולם, כולל ילדים.', 1),
        ('easy_medium',  'קל-בינוני',  'בעיקר שביל מסודר עם כמה עליות או ירידות קלות. מתאים למשפחות עם ילדים גדולים יותר.', 2),
        ('medium',       'בינוני',     'הליכה של כמה שעות עם עליות, מדרגות או שטח לא אחיד. דורש כושר בסיסי.', 3),
        ('medium_hard',  'בינוני-קשה', 'עליות תלולות או שטח מאתגר לאורך חלק מהמסלול. מתאים למי שרגיל לטייל.', 4),
        ('hard',         'קשה',        'מסלול ארוך או תלול, ייתכנו קטעי טיפוס או חציית נחל. דורש כושר טוב וציוד מתאים.', 5),
        ('challenging',  'מאתגר',      'מסלול תובעני מאוד: טיפוס, שטח קשה או מרחק גדול. למטיילים מנוסים בלבד.', 6)
      on conflict (code) do nothing
    $f$, s);

    -- ── Access: read for everyone, write for admins ─────────────
    foreach t in array array['accessibility_levels', 'difficulty_levels'] loop
      execute format('alter table %I.%I enable row level security', s, t);
      execute format('drop policy if exists %I on %I.%I', t || '_public_read', s, t);
      execute format('create policy %I on %I.%I for select using (true)', t || '_public_read', s, t);
      execute format('drop policy if exists %I on %I.%I', t || '_admin_write', s, t);
      execute format(
        'create policy %1$I on %2$I.%3$I for all to authenticated using (%2$I.is_admin()) with check (%2$I.is_admin())',
        t || '_admin_write', s, t
      );
      execute format('grant select on %I.%I to anon, authenticated', s, t);
      execute format('grant insert, update, delete on %I.%I to authenticated', s, t);
    end loop;

    -- ── difficulty: enum column -> text referencing difficulty_levels ──
    foreach t in array array['trails', 'trips'] loop
      if (
        select data_type from information_schema.columns
        where table_schema = s and table_name = t and column_name = 'difficulty'
      ) = 'USER-DEFINED' then
        execute format('alter table %I.%I alter column difficulty drop default', s, t);
        execute format('alter table %I.%I alter column difficulty type text using difficulty::text', s, t);
        execute format('alter table %I.%I alter column difficulty set default ''easy''', s, t);
      end if;

      if not exists (
        select 1 from pg_constraint
        where conname = t || '_difficulty_level_fkey' and conrelid = (s || '.' || t)::regclass
      ) then
        execute format(
          'alter table %1$I.%2$I add constraint %3$I foreign key (difficulty) references %1$I.difficulty_levels(code)',
          s, t, t || '_difficulty_level_fkey'
        );
      end if;
    end loop;

    -- ── accessibility: reference the level table ────────────────
    foreach t in array array['places', 'trails', 'trips'] loop
      if not exists (
        select 1 from pg_constraint
        where conname = t || '_accessibility_level_fkey' and conrelid = (s || '.' || t)::regclass
      ) then
        execute format(
          'alter table %1$I.%2$I add constraint %3$I foreign key (accessibility) references %1$I.accessibility_levels(level)',
          s, t, t || '_accessibility_level_fkey'
        );
      end if;
    end loop;
  end loop;
end
$$;

-- After running: select pg_notify('pgrst', 'reload schema');  (refreshes the API schema cache)
