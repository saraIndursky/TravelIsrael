-- TravelIsrael — English URL slugs for trips, places, trails (public + demo).
-- UUID remains the primary key. Old /entity/<uuid> links still resolve.

create or replace function public.slugify_name(p_name text)
returns text
language plpgsql
immutable
as $$
declare
  t text;
  ch text;
  mapped text;
  out_text text := '';
  i int;
  len int;
begin
  t := coalesce(p_name, '');
  t := regexp_replace(t, '[\u0591-\u05C7]', '', 'g');

  t := replace(t, 'ים המלח', ' dead-sea ');
  t := replace(t, 'תל אביב', ' tel-aviv ');
  t := replace(t, 'בירושלים', ' in-jerusalem ');
  t := replace(t, 'ירושלים', ' jerusalem ');
  t := replace(t, 'עין גדי', ' ein-gedi ');
  t := replace(t, 'מצדה', ' masada ');
  t := replace(t, 'חיפה', ' haifa ');
  t := replace(t, 'אילת', ' eilat ');
  t := replace(t, 'כנרת', ' kinneret ');
  t := replace(t, 'גולן', ' golan ');
  t := replace(t, 'נגב', ' negev ');
  t := replace(t, 'גליל', ' galilee ');
  t := replace(t, 'כרמל', ' carmel ');
  t := replace(t, 'חרמון', ' hermon ');
  t := replace(t, 'שמורה', ' reserve ');
  t := replace(t, 'מסלול', ' trail ');
  t := replace(t, 'טיול', ' trip ');
  t := replace(t, 'מקום', ' place ');
  t := replace(t, 'מפל', ' waterfall ');
  t := replace(t, 'נחל', ' nahal ');
  t := replace(t, 'עין', ' ein ');
  t := replace(t, 'חוף', ' hof ');
  t := replace(t, 'כפר', ' kfar ');
  t := replace(t, 'בית', ' beit ');
  t := replace(t, 'יום', ' day ');
  t := replace(t, 'גן', ' gan ');
  t := replace(t, 'תל', ' tel ');
  t := replace(t, 'הר', ' har ');

  len := char_length(t);
  for i in 1..len loop
    ch := substr(t, i, 1);
    mapped := case ch
      when 'א' then 'a'
      when 'ב' then 'b'
      when 'ג' then 'g'
      when 'ד' then 'd'
      when 'ה' then 'h'
      when 'ו' then 'v'
      when 'ז' then 'z'
      when 'ח' then 'ch'
      when 'ט' then 't'
      when 'י' then 'y'
      when 'כ' then 'k'
      when 'ך' then 'k'
      when 'ל' then 'l'
      when 'מ' then 'm'
      when 'ם' then 'm'
      when 'נ' then 'n'
      when 'ן' then 'n'
      when 'ס' then 's'
      when 'ע' then 'a'
      when 'פ' then 'p'
      when 'ף' then 'p'
      when 'צ' then 'ts'
      when 'ץ' then 'ts'
      when 'ק' then 'k'
      when 'ר' then 'r'
      when 'ש' then 'sh'
      when 'ת' then 't'
      else ch
    end;
    out_text := out_text || mapped;
  end loop;

  out_text := lower(out_text);
  out_text := regexp_replace(out_text, '[^a-z0-9\s-]', '', 'g');
  out_text := regexp_replace(out_text, '[\s_]+', '-', 'g');
  out_text := regexp_replace(out_text, '-+', '-', 'g');
  out_text := trim(both '-' from out_text);

  if out_text = '' then
    return 'item';
  end if;
  if out_text in ('create', 'edit', 'new', 'search', 'page', 'admin') then
    return out_text || '-item';
  end if;
  return out_text;
end;
$$;

create or replace function public.next_unique_slug(p_schema text, p_table text, p_name text)
returns text
language plpgsql
as $$
declare
  base text := public.slugify_name(p_name);
  candidate text := base;
  n int := 2;
  exists_row boolean;
begin
  loop
    execute format(
      'select exists(select 1 from %I.%I where slug = $1)',
      p_schema,
      p_table
    ) into exists_row using candidate;
    exit when not exists_row;
    candidate := base || '-' || n::text;
    n := n + 1;
  end loop;
  return candidate;
end;
$$;

alter table public.places add column if not exists slug text;
alter table public.trails add column if not exists slug text;
alter table public.trips add column if not exists slug text;
alter table demo.places add column if not exists slug text;
alter table demo.trails add column if not exists slug text;
alter table demo.trips add column if not exists slug text;

do $$
declare
  r record;
begin
  for r in select id, name from public.places where slug is null loop
    update public.places set slug = public.next_unique_slug('public', 'places', r.name) where id = r.id;
  end loop;
  for r in select id, name from public.trails where slug is null loop
    update public.trails set slug = public.next_unique_slug('public', 'trails', r.name) where id = r.id;
  end loop;
  for r in select id, name from public.trips where slug is null loop
    update public.trips set slug = public.next_unique_slug('public', 'trips', r.name) where id = r.id;
  end loop;
  for r in select id, name from demo.places where slug is null loop
    update demo.places set slug = public.next_unique_slug('demo', 'places', r.name) where id = r.id;
  end loop;
  for r in select id, name from demo.trails where slug is null loop
    update demo.trails set slug = public.next_unique_slug('demo', 'trails', r.name) where id = r.id;
  end loop;
  for r in select id, name from demo.trips where slug is null loop
    update demo.trips set slug = public.next_unique_slug('demo', 'trips', r.name) where id = r.id;
  end loop;
end;
$$;

alter table public.places alter column slug set not null;
alter table public.trails alter column slug set not null;
alter table public.trips alter column slug set not null;
alter table demo.places alter column slug set not null;
alter table demo.trails alter column slug set not null;
alter table demo.trips alter column slug set not null;

create unique index if not exists places_slug_key on public.places (slug);
create unique index if not exists trails_slug_key on public.trails (slug);
create unique index if not exists trips_slug_key on public.trips (slug);
create unique index if not exists places_slug_key on demo.places (slug);
create unique index if not exists trails_slug_key on demo.trails (slug);
create unique index if not exists trips_slug_key on demo.trips (slug);
