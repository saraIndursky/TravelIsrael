-- Readable phonetic slugs: whole words only, vav = o/u not v.
-- Matches lib/utils/slug.ts. Recomputes existing slugs (UUID URLs still resolve).

create or replace function public.romanize_hebrew_word(p_word text)
returns text
language plpgsql
immutable
as $$
declare
  stem text := p_word;
  prefix text := '';
  out_text text := '';
  i int;
  n int;
  ch text;
  nxt text;
  mapped text;
begin
  if p_word is null or p_word = '' then
    return '';
  end if;
  if p_word !~ '[\u0590-\u05FF]' then
    return p_word;
  end if;
  if p_word = 'ו' then
    return 've';
  end if;

  if stem like 'וה%' and char_length(stem) > 2 then
    prefix := 'veha';
    stem := substr(stem, 3);
  elsif substr(stem, 1, 1) = 'ו' and char_length(stem) > 1 then
    prefix := 've';
    stem := substr(stem, 2);
  elsif substr(stem, 1, 1) = 'ה' and char_length(stem) > 2 then
    prefix := 'ha';
    stem := substr(stem, 2);
  elsif substr(stem, 1, 1) = 'ב' and char_length(stem) > 2 then
    prefix := 'ba';
    stem := substr(stem, 2);
  elsif substr(stem, 1, 1) = 'ל' and char_length(stem) > 2 then
    prefix := 'le';
    stem := substr(stem, 2);
  end if;

  n := char_length(stem);
  i := 1;
  while i <= n loop
    ch := substr(stem, i, 1);
    nxt := case when i < n then substr(stem, i + 1, 1) else '' end;
    if ch = 'ו' and nxt = 'ו' then
      mapped := 'v';
      i := i + 2;
    elsif ch = 'י' and nxt = 'י' then
      mapped := case when i = 1 then 'yi' else 'ay' end;
      i := i + 2;
    elsif ch = 'י' and nxt = 'ם' and i + 1 = n then
      mapped := 'im';
      i := i + 2;
    elsif ch = 'ו' and nxt = 'ת' and i + 1 = n then
      mapped := 'ot';
      i := i + 2;
    elsif ch = 'א' and nxt = 'ו' then
      mapped := 'o';
      i := i + 2;
    elsif ch = 'ו' then
      mapped := 'o';
      i := i + 1;
    elsif ch = 'י' then
      mapped := case when i = 1 then 'ye' else 'i' end;
      i := i + 1;
    elsif (ch = 'א' or ch = 'ע') and i = 1 then
      mapped := 'a';
      i := i + 1;
    elsif ch = 'א' or ch = 'ע' then
      mapped := '';
      i := i + 1;
    elsif ch = 'ה' and i = n then
      mapped := 'a';
      i := i + 1;
    else
      mapped := case ch
        when 'ב' then 'b'
        when 'ג' then 'g'
        when 'ד' then 'd'
        when 'ה' then 'h'
        when 'ז' then 'z'
        when 'ח' then 'ch'
        when 'ט' then 't'
        when 'כ' then 'k'
        when 'ך' then 'k'
        when 'ל' then 'l'
        when 'מ' then 'm'
        when 'ם' then 'm'
        when 'נ' then 'n'
        when 'ן' then 'n'
        when 'ס' then 's'
        when 'פ' then 'p'
        when 'ף' then 'p'
        when 'צ' then 'tz'
        when 'ץ' then 'tz'
        when 'ק' then 'k'
        when 'ר' then 'r'
        when 'ש' then 'sh'
        when 'ת' then 't'
        else ch
      end;
      i := i + 1;
    end if;
    out_text := out_text || mapped;
  end loop;

  return prefix || out_text;
end;
$$;

create or replace function public.slugify_hebrew_token(p_token text)
returns text
language plpgsql
immutable
as $$
declare
  word_map jsonb := $m${
    "בירושלים":"in-jerusalem","ירושלים":"jerusalem","מצדה":"masada","חיפה":"haifa",
    "אילת":"eilat","כנרת":"kinneret","גולן":"golan","נגב":"negev","גליל":"galilee",
    "כרמל":"carmel","חרמון":"hermon","קיסריה":"caesarea","אשקלון":"ashkelon",
    "ישראל":"israel","יפו":"jaffa","עכו":"acre","תמנע":"timna","מירון":"meron",
    "רמון":"ramon","ארבל":"arbel","אכזיב":"achziv","געש":"gaash","איילון":"ayalon",
    "אלכסנדר":"alexander","דוד":"david","בניאס":"banias","יהודייה":"yehudiya",
    "כזיב":"kaziv","זויתן":"zavitan","בלומפילד":"bloomfield","עזריאלי":"azrieli",
    "נמרוד":"nimrod","אופניים":"ophnayim","בשרון":"basharon","שרון":"sharon",
    "שוק":"shuk","מחנה":"machane","יהודה":"yehuda","מוזיאון":"museum","לאומי":"leumi",
    "שמורת":"reserve","שמורה":"reserve","מסלולי":"trails","מסלול":"trail",
    "טיול":"trip","מקום":"place","ליום":"day","יום":"day","מדבר":"midbar",
    "מכתשים":"makhteshim","מכתש":"makhtesh","מים":"mayim","יער":"yaar",
    "שביל":"shvil","טיילת":"tayelet","משפחתי":"mishpachti","נגיש":"nagish",
    "תרבות":"tarbut","מערבי":"maaravi","תיכון":"tikhon","היסטוריה":"historia",
    "כוכבים":"kochavim","מורשת":"moreshet","אתגר":"etgar","לחובבי":"lechovevei",
    "הליכה":"halicha","ערבה":"arava","צפון":"tzafon","ירוק":"yarok",
    "עתיקה":"atika","העיר":"hair","נמל":"namal","קניון":"canyon","פארק":"park",
    "מעיין":"maayan","מערת":"mearat","מערה":"meara","מצודת":"metzudat",
    "מצודה":"metzuda","מצוק":"metzuk","מצפה":"mitzpe","עמק":"emek","ירדן":"jordan",
    "דולפינים":"dolphins","ריף":"reef","פרסה":"parsa","קטע":"section",
    "נחל":"nahal","חוף":"hof","עין":"ein","בית":"beit","כפר":"kfar","תל":"tel",
    "הר":"har","מפל":"waterfall","גני":"ganei","גנות":"ganot","גן":"gan",
    "בריכת":"breichat","בריכה":"breicha","טבע":"teva","מדע":"mada","ים":"yam",
    "הבהאיים":"bahai","ערב":"erev","רגוע":"ragu","בערך":"baerech",
    "הבונים":"habonim","הבשור":"habesor","השופט":"hashofet","עמוד":"amud",
    "פרת":"prat","חצץ":"chatsats","מורש":"moresh","הנטיפים":"hantifim",
    "ההעתקים":"haatakim","הסוסות":"hasusot","בצפון":"batsafon","שבוע":"shavua",
    "סוף":"sof"
  }$m$::jsonb;
  prefixes text[][] := array[
    array['וה', 'veha'],
    array['ו', 've'],
    array['ה', 'ha'],
    array['ב', 'ba'],
    array['ל', 'le'],
    array['כ', 'ke'],
    array['מ', 'mi']
  ];
  pref text;
  eng text;
  stem text;
  p int;
begin
  if p_token is null or p_token = '' then
    return '';
  end if;
  if word_map ? p_token then
    return word_map ->> p_token;
  end if;
  for p in 1..array_length(prefixes, 1) loop
    pref := prefixes[p][1];
    eng := prefixes[p][2];
    if p_token like pref || '%' and char_length(p_token) > char_length(pref) + 1 then
      stem := substr(p_token, char_length(pref) + 1);
      if word_map ? stem then
        return eng || '-' || (word_map ->> stem);
      end if;
    end if;
  end loop;
  return public.romanize_hebrew_word(p_token);
end;
$$;

create or replace function public.slugify_name(p_name text)
returns text
language plpgsql
immutable
as $$
declare
  t text;
  word text;
  out_text text := '';
begin
  t := coalesce(p_name, '');
  t := regexp_replace(t, '[\u0591-\u05C7]', '', 'g');

  t := replace(t, 'מחנה יהודה', ' machane-yehuda ');
  t := replace(t, 'גן לאומי', ' national-park ');
  t := replace(t, 'סוף שבוע', ' weekend ');
  t := replace(t, 'ראש הנקרה', ' rosh-hanikra ');
  t := replace(t, 'מכתש רמון', ' makhtesh-ramon ');
  t := replace(t, 'בית גוברין', ' beit-govrin ');
  t := replace(t, 'בית שאן', ' beit-shean ');
  t := replace(t, 'בתל אביב', ' in-tel-aviv ');
  t := replace(t, 'תל אביב', ' tel-aviv ');
  t := replace(t, 'בים המלח', ' at-dead-sea ');
  t := replace(t, 'ים המלח', ' dead-sea ');
  t := replace(t, 'עין גדי', ' ein-gedi ');
  t := replace(t, 'יום מלא', ' full-day ');
  t := replace(t, 'בן שמן', ' ben-shemen ');

  t := regexp_replace(t, '[^\u0590-\u05FFa-zA-Z0-9]+', ' ', 'g');
  t := trim(both from t);

  if t = '' then
    return 'item';
  end if;

  foreach word in array regexp_split_to_array(t, '\s+') loop
    if word = '' then
      continue;
    end if;
    if out_text <> '' then
      out_text := out_text || '-';
    end if;
    out_text := out_text || public.slugify_hebrew_token(word);
  end loop;

  out_text := lower(out_text);
  out_text := regexp_replace(out_text, '[^a-z0-9-]', '', 'g');
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

drop index if exists public.places_slug_key;
drop index if exists public.trails_slug_key;
drop index if exists public.trips_slug_key;
drop index if exists demo.places_slug_key;
drop index if exists demo.trails_slug_key;
drop index if exists demo.trips_slug_key;

alter table public.places alter column slug drop not null;
alter table public.trails alter column slug drop not null;
alter table public.trips alter column slug drop not null;
alter table demo.places alter column slug drop not null;
alter table demo.trails alter column slug drop not null;
alter table demo.trips alter column slug drop not null;

update public.places set slug = null;
update public.trails set slug = null;
update public.trips set slug = null;
update demo.places set slug = null;
update demo.trails set slug = null;
update demo.trips set slug = null;

do $$
declare
  r record;
begin
  for r in select id, name from public.places loop
    update public.places set slug = public.next_unique_slug('public', 'places', r.name) where id = r.id;
  end loop;
  for r in select id, name from public.trails loop
    update public.trails set slug = public.next_unique_slug('public', 'trails', r.name) where id = r.id;
  end loop;
  for r in select id, name from public.trips loop
    update public.trips set slug = public.next_unique_slug('public', 'trips', r.name) where id = r.id;
  end loop;
  for r in select id, name from demo.places loop
    update demo.places set slug = public.next_unique_slug('demo', 'places', r.name) where id = r.id;
  end loop;
  for r in select id, name from demo.trails loop
    update demo.trails set slug = public.next_unique_slug('demo', 'trails', r.name) where id = r.id;
  end loop;
  for r in select id, name from demo.trips loop
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
