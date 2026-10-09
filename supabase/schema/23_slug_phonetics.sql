-- Phonetic English slugs: vav/yud as vowels, Israeli place-name spellings.
-- Recomputes existing slugs (UUID URLs still resolve).

create or replace function public.slugify_name(p_name text)
returns text
language plpgsql
immutable
as $$
declare
  t text;
  ch text;
  nxt text;
  mapped text;
  out_text text := '';
  i int;
  len int;
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
  t := replace(t, 'ים המלח', ' dead-sea ');
  t := replace(t, 'בתל אביב', ' in-tel-aviv ');
  t := replace(t, 'תל אביב', ' tel-aviv ');
  t := replace(t, 'עין גדי', ' ein-gedi ');
  t := replace(t, 'בירושלים', ' in-jerusalem ');
  t := replace(t, 'ירושלים', ' jerusalem ');
  t := replace(t, 'והערבה', ' vehaarava ');
  t := replace(t, 'אופניים', ' ophnayim ');
  t := replace(t, 'בשרון', ' basharon ');
  t := replace(t, 'בלומפילד', ' bloomfield ');
  t := replace(t, 'עזריאלי', ' azrieli ');
  t := replace(t, 'אלכסנדר', ' alexander ');
  t := replace(t, 'ההעתקים', ' haatakim ');
  t := replace(t, 'הנטיפים', ' hantifim ');
  t := replace(t, 'הדולפינים', ' dolphins ');
  t := replace(t, 'לחובבי', ' lechovevei ');
  t := replace(t, 'היסטוריה', ' historia ');
  t := replace(t, 'משפחתי', ' mishpachti ');
  t := replace(t, 'מכתשים', ' makhteshim ');
  t := replace(t, 'כוכבים', ' kochavim ');
  t := replace(t, 'מערבי', ' maaravi ');
  t := replace(t, 'העתיקה', ' haatika ');
  t := replace(t, 'הכרמל', ' ha-carmel ');
  t := replace(t, 'הגולן', ' ha-golan ');
  t := replace(t, 'הבונים', ' habonim ');
  t := replace(t, 'הבשור', ' habesor ');
  t := replace(t, 'השופט', ' hashofet ');
  t := replace(t, 'הסוסות', ' hasusot ');
  t := replace(t, 'בצפון', ' batsafon ');
  t := replace(t, 'בן שמן', ' ben-shemen ');
  t := replace(t, 'יהודייה', ' yehudiya ');
  t := replace(t, 'מוזיאון', ' museum ');
  t := replace(t, 'מסלולי', ' trails ');
  t := replace(t, 'שמורת', ' reserve ');
  t := replace(t, 'שמורה', ' reserve ');
  t := replace(t, 'מסלול', ' trail ');
  t := replace(t, 'קיסריה', ' caesarea ');
  t := replace(t, 'אשקלון', ' ashkelon ');
  t := replace(t, 'איילון', ' ayalon ');
  t := replace(t, 'בניאס', ' banias ');
  t := replace(t, 'נמרוד', ' nimrod ');
  t := replace(t, 'מחנה', ' machane ');
  t := replace(t, 'יהודה', ' yehuda ');
  t := replace(t, 'שרון', ' sharon ');
  t := replace(t, 'מצדה', ' masada ');
  t := replace(t, 'חיפה', ' haifa ');
  t := replace(t, 'אילת', ' eilat ');
  t := replace(t, 'כנרת', ' kinneret ');
  t := replace(t, 'גולן', ' golan ');
  t := replace(t, 'נגב', ' negev ');
  t := replace(t, 'גליל', ' galilee ');
  t := replace(t, 'כרמל', ' carmel ');
  t := replace(t, 'חרמון', ' hermon ');
  t := replace(t, 'ישראל', ' israel ');
  t := replace(t, 'מכתש', ' makhtesh ');
  t := replace(t, 'לאומי', ' leumi ');
  t := replace(t, 'תיכון', ' tikhon ');
  t := replace(t, 'מורשת', ' moreshet ');
  t := replace(t, 'הליכה', ' halicha ');
  t := replace(t, 'תרבות', ' tarbut ');
  t := replace(t, 'נגיש', ' nagish ');
  t := replace(t, 'טיילת', ' tayelet ');
  t := replace(t, 'מעיין', ' maayan ');
  t := replace(t, 'מערת', ' mearat ');
  t := replace(t, 'מערה', ' meara ');
  t := replace(t, 'מצודת', ' metzudat ');
  t := replace(t, 'מצודה', ' metzuda ');
  t := replace(t, 'מצוק', ' metzuk ');
  t := replace(t, 'מצפה', ' mitzpe ');
  t := replace(t, 'עתיקה', ' atika ');
  t := replace(t, 'העיר', ' hair ');
  t := replace(t, 'שבוע', ' shavua ');
  t := replace(t, 'צפון', ' tzafon ');
  t := replace(t, 'ירוק', ' yarok ');
  t := replace(t, 'קניון', ' canyon ');
  t := replace(t, 'פארק', ' park ');
  t := replace(t, 'דולפינים', ' dolphins ');
  t := replace(t, 'פרסה', ' horseshoe ');
  t := replace(t, 'קטע', ' section ');
  t := replace(t, 'מדבר', ' midbar ');
  t := replace(t, 'ערבה', ' arava ');
  t := replace(t, 'אתגר', ' etgar ');
  t := replace(t, 'ליום', ' day ');
  t := replace(t, 'טיול', ' trip ');
  t := replace(t, 'מקום', ' place ');
  t := replace(t, 'נמל', ' namal ');
  t := replace(t, 'עמק', ' emek ');
  t := replace(t, 'ירדן', ' jordan ');
  t := replace(t, 'מים', ' mayim ');
  t := replace(t, 'יער', ' yaar ');
  t := replace(t, 'שביל', ' shvil ');
  t := replace(t, 'מלא', ' male ');
  t := replace(t, 'יום', ' day ');
  t := replace(t, 'שוק', ' shuk ');
  t := replace(t, 'נחל', ' nahal ');
  t := replace(t, 'חוף', ' hof ');
  t := replace(t, 'בית', ' beit ');
  t := replace(t, 'כפר', ' kfar ');
  t := replace(t, 'עין', ' ein ');
  t := replace(t, 'מפל', ' waterfall ');
  t := replace(t, 'גני', ' ganei ');
  t := replace(t, 'גנות', ' ganot ');
  t := replace(t, 'גן', ' gan ');
  t := replace(t, 'בריכת', ' breichat ');
  t := replace(t, 'בריכה', ' breicha ');
  t := replace(t, 'טבע', ' teva ');
  t := replace(t, 'מדע', ' mada ');
  t := replace(t, 'וים', ' veyam ');
  t := replace(t, 'ים', ' yam ');
  t := replace(t, 'יפו', ' jaffa ');
  t := replace(t, 'עכו', ' acre ');
  t := replace(t, 'תמנע', ' timna ');
  t := replace(t, 'מירון', ' meron ');
  t := replace(t, 'רמון', ' ramon ');
  t := replace(t, 'ארבל', ' arbel ');
  t := replace(t, 'אכזיב', ' achziv ');
  t := replace(t, 'געש', ' gaash ');
  t := replace(t, 'דוד', ' david ');
  t := replace(t, 'כזיב', ' kaziv ');
  t := replace(t, 'זויתן', ' zavitan ');
  t := replace(t, 'עמוד', ' amud ');
  t := replace(t, 'פרת', ' prat ');
  t := replace(t, 'חצץ', ' chatsats ');
  t := replace(t, 'מורש', ' moresh ');
  t := replace(t, 'ריף', ' reef ');
  t := replace(t, 'תל', ' tel ');
  t := replace(t, 'הר', ' har ');
  t := replace(t, 'סוף', ' sof ');

  t := replace(t, ' ו ', ' ve ');
  t := replace(t, 'וו', 'v');
  t := replace(t, 'יי', 'ay');

  len := char_length(t);
  i := 1;
  while i <= len loop
    ch := substr(t, i, 1);
    nxt := case when i < len then substr(t, i + 1, 1) else '' end;
    if ch = 'א' and nxt = 'ו' then
      mapped := 'o';
      i := i + 2;
    elsif ch = 'ו' then
      mapped := 'o';
      i := i + 1;
    elsif ch = 'י' then
      mapped := 'i';
      i := i + 1;
    elsif ch in ('א', 'ע') then
      mapped := '';
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
