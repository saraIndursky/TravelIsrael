-- Contact details for trails (public + demo).
--
-- A trail that is closed or needs prior arrangement (a nature reserve, a guided or booked route)
-- should say how to reach whoever manages it. Same idea as places, which already have phone and
-- website; trails also get a short free-text note ("needs booking", "open on request").
--
--   phone          optional phone number
--   website        optional web address (javascript:, data:, vbscript: and file: are refused)
--   contact_note   optional short note, e.g. that coordination is required
--
-- All three are optional, so existing trails are unchanged. Idempotent: safe to run again.

do $$
declare
  s text;
begin
  foreach s in array array['public', 'demo'] loop
    execute format('alter table %I.trails add column if not exists phone text', s);
    execute format('alter table %I.trails add column if not exists website text', s);
    execute format('alter table %I.trails add column if not exists contact_note text', s);

    execute format('alter table %I.trails drop constraint if exists trails_contact_limits', s);
    execute format(
      'alter table %I.trails add constraint trails_contact_limits check ((phone is null or char_length(phone) <= 40) and (website is null or char_length(website) <= 500) and (contact_note is null or char_length(contact_note) <= 400)) not valid',
      s
    );

    execute format('alter table %I.trails drop constraint if exists trails_website_scheme', s);
    execute format(
      'alter table %I.trails add constraint trails_website_scheme check (website is null or website !~* ''^\s*(javascript|data|vbscript|file):'') not valid',
      s
    );
  end loop;
end
$$;

-- After running: select pg_notify('pgrst', 'reload schema');  (refreshes the API schema cache)
