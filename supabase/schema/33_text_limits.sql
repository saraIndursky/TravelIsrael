-- Length limits on user text and a ban on script-style URLs (public + demo). Constraints are
-- added NOT VALID so rows that already exist are left alone, while every new or edited row is checked.

do $$
declare
  s text;
begin
  foreach s in array array['public', 'demo'] loop
    execute format('alter table %I.places drop constraint if exists places_text_limits', s);
    execute format('alter table %I.places add constraint places_text_limits check (char_length(name) <= 200 and char_length(short_description) <= 600 and char_length(full_description) <= 20000 and char_length(address) <= 400) not valid', s);
    execute format('alter table %I.places drop constraint if exists places_website_scheme', s);
    execute format('alter table %I.places add constraint places_website_scheme check (website is null or website !~* ''^\s*(javascript|data|vbscript|file):'') not valid', s);

    execute format('alter table %I.trails drop constraint if exists trails_text_limits', s);
    execute format('alter table %I.trails add constraint trails_text_limits check (char_length(name) <= 200 and char_length(short_description) <= 600 and char_length(full_description) <= 20000) not valid', s);

    execute format('alter table %I.trips drop constraint if exists trips_text_limits', s);
    execute format('alter table %I.trips add constraint trips_text_limits check (char_length(name) <= 200 and char_length(short_description) <= 600 and char_length(full_description) <= 20000) not valid', s);
  end loop;
end
$$;

notify pgrst, 'reload schema';
