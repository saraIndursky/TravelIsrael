-- Region hierarchy cleanup (public + demo).
-- "מרכז" and "צפון" existed twice: once as a group under ישראל and again as a selectable child of
-- that same group. The group itself becomes the selectable region; content, notification
-- preferences and sub-regions that pointed at the duplicate are moved to it, then the duplicate
-- is deleted. Safe to re-run: it does nothing once no duplicates remain.

do $$
declare
  s text;
  n text;
  g uuid;
  l uuid;
begin
  foreach s in array array['public', 'demo'] loop
    foreach n in array array['מרכז', 'צפון'] loop
      execute format(
        'select g.id from %1$I.regions g join %1$I.regions i on i.id = g.parent_id where g.name = %2$L and i.name = ''ישראל'' and i.parent_id is null',
        s, n
      ) into g;
      if g is null then continue; end if;

      execute format(
        'select id from %1$I.regions where parent_id = %2$L and name = %3$L and is_selectable',
        s, g, n
      ) into l;
      if l is null then continue; end if;

      -- free the unique code, make the group selectable with it
      execute format('update %I.regions set is_selectable = false, code = null where id = %L', s, l);
      execute format('update %I.regions set is_selectable = true, code = %L where id = %L', s, n, g);

      -- move everything that referenced the duplicate
      execute format('update %I.places set region_id = %L where region_id = %L', s, g, l);
      execute format('update %I.trails set region_id = %L where region_id = %L', s, g, l);
      execute format('update %I.trips set region_id = %L where region_id = %L', s, g, l);
      execute format('update %I.regions set parent_id = %L where parent_id = %L', s, g, l);
      execute format(
        'update %1$I.notification_preferences set region_ids = array_replace(region_ids, %2$L::uuid, %3$L::uuid) where %2$L::uuid = any(region_ids)',
        s, l, g
      );

      execute format('delete from %I.regions where id = %L', s, l);
    end loop;
  end loop;
end
$$;
