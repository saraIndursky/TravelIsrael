-- Community demo content (schema demo): ratings, comments, community photos, favorites,
-- views and reports. Comments and photos enter the admin moderation queue via the existing
-- triggers; recent ones stay unseen so they show up as pending review.
begin;

create temp table _users on commit drop as
  select row_number() over (order by created_at, name) as rn, id, role::text as role from demo.profiles;

create temp table _ent on commit drop as
  select 'trip'::public.entity_type as t, id, created_by as owner, name from demo.trips where status = 'approved'
  union all select 'place'::public.entity_type, id, created_by, name from demo.places where status = 'approved'
  union all select 'trail'::public.entity_type, id, created_by, name from demo.trails where status = 'approved';

-- 1. ratings: every item has its own quality tier, so averages differ between items
with pair as (
  select u.id as uid, e.t, e.id as eid,
    abs(hashtext(u.id::text || e.id::text || 'sel')) % 100 as sel,
    abs(hashtext(u.id::text || e.id::text || 'sc')) % 100 as sc,
    abs(hashtext(e.id::text || 'tier')) % 4 as tier,
    abs(hashtext(u.id::text || e.id::text || 'age')) % 90 as age_days,
    abs(hashtext(u.id::text || e.id::text || 'hr')) % 24 as age_hours
  from _users u cross join _ent e where u.id <> e.owner
)
insert into demo.ratings (user_id, entity_type, entity_id, score, created_at)
select uid, t, eid,
  (case when sc < 18 + tier * 12 then 5 when sc < 52 + tier * 8 then 4 when sc < 78 + tier * 5 then 3 when sc < 92 then 2 else 1 end)::smallint,
  now() - make_interval(days => age_days, hours => age_hours)
from pair where sel < 72
on conflict (user_id, entity_type, entity_id) do nothing;

-- 2. comments
with pools as (
  select array['טיול מעולה, עשינו אותו עם הילדים וכולם נהנו.','מסלול מאורגן היטב. כדאי להתחיל מוקדם כדי להספיק הכול.','התחנות קרובות זו לזו וזה חוסך המון זמן נסיעה.','יפה מאוד, אבל חם בקיץ. מומלץ לקחת מים וכובע.','משך הטיול קצת אופטימי, לקח לנו יותר זמן.','מתאים מאוד לסוף שבוע, נחזור בטוח.','הנוף מדהים ויש מקומות טובים לעצור ולאכול בדרך.','היה צפוף בשבת, כדאי לבוא באמצע השבוע.','חיפשנו טיול ליום אחד וזה בדיוק מה שהיה צריך.','תודה על ההמלצה! הוספנו תחנה לקפה באמצע.','הגענו עם עגלה וזה היה אפשרי ברובו.','לא כל התחנות נגישות, כדאי לבדוק לפני שיוצאים.','אהבתי את השילוב בין היסטוריה לטבע.','מחיר סביר לכל המשפחה, יצאנו מרוצים.','תכנון חכם של סדר התחנות, מומלץ לעקוב אחריו.','היינו בחורף והמקומות היו ירוקים ושקטים.']::text[] as trip_pool, array['מקום יפה ושקט, שווה ביקור.','הכניסה מסודרת והצוות נחמד.','כדאי להגיע בבוקר, אחר הצהריים עמוס.','יש חניה קרובה, אבל היא מתמלאת מהר.','מתאים לילדים, הם נהנו מאוד.','אחד המקומות היפים שביקרתי בהם בארץ.','חבל שאין מספיק צל בקיץ.','השילוט ברור ועוזר להתמצא.','הצילומים כאן יוצאים מדהים בשקיעה.','המחיר קצת גבוה, אבל שווה את זה.','הנגישות סבירה, יש קטעים עם מדרגות.','קיבלנו הסבר מעניין ומפורט, למדנו הרבה.','חזרנו כאן בפעם השנייה ועדיין נהנינו.','תיאור המקום באתר מדויק, בדיוק כמו שמצאנו.']::text[] as place_pool, array['מסלול מהנה, הסימון ברור לכל אורכו.','קשה יותר ממה שחשבתי, כדאי להצטייד במים.','מצוין לרכיבה, רוב המסלול מישורי.','הגענו בחורף והיה ירוק ויפה.','יש קטעים חלקלקים אחרי גשם, כדאי נעליים טובות.','מתאים להליכה משפחתית רגועה.','לקח לנו פחות זמן מהמצוין.','נוף מהמם בשיא העלייה.','אין הרבה צל, מומלץ לצאת מוקדם.','הילדים התעייפו בסוף אבל נהנו.','מסלול נקי ומסודר, ראינו משפחות רבות.','כדאי להתחיל מהנקודה המסומנת ולא מהחניה השנייה.']::text[] as trail_pool
), pair as (
  select u.id as uid, e.t, e.id as eid,
    abs(hashtext(u.id::text || e.id::text || 'cm')) % 100 as sel,
    abs(hashtext(u.id::text || e.id::text || 'ct')) as idx,
    abs(hashtext(u.id::text || e.id::text || 'cd')) % 45 as age_days,
    abs(hashtext(u.id::text || e.id::text || 'ch')) % 24 as age_hours
  from _users u cross join _ent e where u.id <> e.owner
)
insert into demo.comments (user_id, entity_type, entity_id, content, created_at)
select p.uid, p.t, p.eid,
  case p.t
    when 'trip' then pools.trip_pool[1 + p.idx % array_length(pools.trip_pool, 1)]
    when 'place' then pools.place_pool[1 + p.idx % array_length(pools.place_pool, 1)]
    else pools.trail_pool[1 + p.idx % array_length(pools.trail_pool, 1)]
  end,
  now() - make_interval(days => p.age_days, hours => p.age_hours)
from pair p cross join pools
where p.sel < 22;

-- 3. community photos on places and trails (alternative real views of the same location)
create temp table _photos(name text, url text) on commit drop;
insert into _photos(name, url) values
  ('פארק תמנע', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Landscape_in_Timna_Park_%2812%29.JPG/1280px-Landscape_in_Timna_Park_%2812%29.JPG'),
  ('פארק תמנע', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Erez_ben_Yosef_on_Site_34_at_Timna_Valley.jpg/1280px-Erez_ben_Yosef_on_Site_34_at_Timna_Valley.jpg'),
  ('ריף הדולפינים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Eilat_Dolphin_Reef_%284%29.jpg/1280px-Eilat_Dolphin_Reef_%284%29.jpg'),
  ('ריף הדולפינים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Eilat_Dolphin_Reef_%282%29.jpg/1280px-Eilat_Dolphin_Reef_%282%29.jpg'),
  ('חוף אכזיב', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/%D7%A4%D7%A1%D7%9C_%D7%99%D7%9D_%D7%91%D7%97%D7%95%D7%A3_%D7%90%D7%9B%D7%96%D7%99%D7%91_achziv_beach.jpg/1280px-%D7%A4%D7%A1%D7%9C_%D7%99%D7%9D_%D7%91%D7%97%D7%95%D7%A3_%D7%90%D7%9B%D7%96%D7%99%D7%91_achziv_beach.jpg'),
  ('חוף אכזיב', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/PikiWiki_Israel_4360_immigrant_monument_achziv.jpg/1280px-PikiWiki_Israel_4360_immigrant_monument_achziv.jpg'),
  ('ראש הנקרה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Rosh_HaNikra_Grottoes_2.jpg/1280px-Rosh_HaNikra_Grottoes_2.jpg'),
  ('ראש הנקרה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Rosh_HaNikra_Grottoes_3.jpg/1280px-Rosh_HaNikra_Grottoes_3.jpg'),
  ('שוק העיר העתיקה — עכו', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/125695_acre-old_city_PikiWiki_Israel.jpg/1280px-125695_acre-old_city_PikiWiki_Israel.jpg'),
  ('שוק העיר העתיקה — עכו', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/125692_acre-old_city_PikiWiki_Israel.jpg/1280px-125692_acre-old_city_PikiWiki_Israel.jpg'),
  ('גן לאומי אשקלון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Mosaic_floor_at_Ashkelon.jpg/1280px-Mosaic_floor_at_Ashkelon.jpg'),
  ('גן לאומי אשקלון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ashkelon_National_Park_%285616112114%29.jpg/1280px-Ashkelon_National_Park_%285616112114%29.jpg'),
  ('גן לאומי קיסריה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/ISR-2015-Caesarea-Caesarea_Maritima-Herodian_Amphitheater_02.jpg/1280px-ISR-2015-Caesarea-Caesarea_Maritima-Herodian_Amphitheater_02.jpg'),
  ('גן לאומי קיסריה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Caesarea_maritima_BW_2.JPG/1280px-Caesarea_maritima_BW_2.JPG'),
  ('חוף געש', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/PikiWiki_Israel_37321_Horses_-_Gaash_beach.jpg/1280px-PikiWiki_Israel_37321_Horses_-_Gaash_beach.jpg'),
  ('חוף געש', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/GaashFreeNearBeach.jpg/1280px-GaashFreeNearBeach.jpg'),
  ('חוף הבונים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Dor_HaBonim_Beach.jpg/1280px-Dor_HaBonim_Beach.jpg'),
  ('חוף הבונים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Habonim-Dor_Beach_-_2021.jpg/1280px-Habonim-Dor_Beach_-_2021.jpg'),
  ('נחל אלכסנדר', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/ALEXANDER_STREAM.jpg/1280px-ALEXANDER_STREAM.jpg'),
  ('נחל אלכסנדר', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/9-0200-10_Nahal_Alexander%2C_24-12-15_-_547.jpg/1280px-9-0200-10_Nahal_Alexander%2C_24-12-15_-_547.jpg'),
  ('מצדה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/ISR-2016-Masada-Roman_fortress_01.jpg/1280px-ISR-2016-Masada-Roman_fortress_01.jpg'),
  ('מצדה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/ISR-2016-Masada_03.jpg/1280px-ISR-2016-Masada_03.jpg'),
  ('שמורת עין גדי', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Ein_Gedi_nature_reserve_%2820%29_%285364688023%29.jpg/1280px-Ein_Gedi_nature_reserve_%2820%29_%285364688023%29.jpg'),
  ('שמורת עין גדי', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Two_Nubian_Ibexes%2C_Ein_Gedi_nature_reserve%2C_The_Judean_desert%2C_Israel.jpg/1280px-Two_Nubian_Ibexes%2C_Ein_Gedi_nature_reserve%2C_The_Judean_desert%2C_Israel.jpg'),
  ('מוזיאון המדע בלומפילד', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Bloomfield_Science_Museum_Jerusalem_%283428390011%29.jpg/1280px-Bloomfield_Science_Museum_Jerusalem_%283428390011%29.jpg'),
  ('מוזיאון המדע בלומפילד', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Bloomfield_Science_Museum_Jerusalem_%283429136580%29.jpg/1280px-Bloomfield_Science_Museum_Jerusalem_%283429136580%29.jpg'),
  ('מוזיאון ישראל', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Peter_Paul_Rubens%2C_The_Death_of_Adonis%2C_ca._1614._The_Israel_Museum%2C_Jerusalem.jpg/1280px-Peter_Paul_Rubens%2C_The_Death_of_Adonis%2C_ca._1614._The_Israel_Museum%2C_Jerusalem.jpg'),
  ('מוזיאון ישראל', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Jerusalem_Israel_Museum_flags.jpg/1280px-Jerusalem_Israel_Museum_flags.jpg'),
  ('שוק מחנה יהודה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Mahane_Yehuda_Market_%285101386538%29.jpg/1280px-Mahane_Yehuda_Market_%285101386538%29.jpg'),
  ('שוק מחנה יהודה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Mahane_Yehuda_Market_closed_in_coronavirus_outbreak.jpg/1280px-Mahane_Yehuda_Market_closed_in_coronavirus_outbreak.jpg'),
  ('גני הבהאיים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Israel_-_Haifa_-_Bahai_Gardens_004.jpg/1280px-Israel_-_Haifa_-_Bahai_Gardens_004.jpg'),
  ('גני הבהאיים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Bahai_gardens_in_haifa-other.jpg/1280px-Bahai_gardens_in_haifa-other.jpg'),
  ('יפו העתיקה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Old_Jaffa%2C_August_2014_11.jpg/1280px-Old_Jaffa%2C_August_2014_11.jpg'),
  ('יפו העתיקה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Old_Jaffa%2C_August_2014_01.jpg/1280px-Old_Jaffa%2C_August_2014_01.jpg'),
  ('מוזיאון תל אביב', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Tel_Aviv_Museum_of_Art_-_Israel%2C_March_2024_11.jpg/1280px-Tel_Aviv_Museum_of_Art_-_Israel%2C_March_2024_11.jpg'),
  ('מוזיאון תל אביב', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Tel_Aviv_Museum_of_Art_-_Israel%2C_March_2024_37.jpg/1280px-Tel_Aviv_Museum_of_Art_-_Israel%2C_March_2024_37.jpg'),
  ('מערת הנטיפים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Avshalom_stalactite_cave_%2831%29.jpg/1280px-Avshalom_stalactite_cave_%2831%29.jpg'),
  ('מערת הנטיפים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Avshalom_stalactite_cave_%2815%29.jpg/1280px-Avshalom_stalactite_cave_%2815%29.jpg'),
  ('נמל יפו', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/OLD_JAFFA_PORT.jpg/1280px-OLD_JAFFA_PORT.jpg'),
  ('נמל יפו', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/PikiWiki_Israel_55621_jaffa_port_postcards.jpg/1280px-PikiWiki_Israel_55621_jaffa_port_postcards.jpg'),
  ('קניון עזריאלי', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Israel_Tel_Aviv_6.jpg/1280px-Israel_Tel_Aviv_6.jpg'),
  ('קניון עזריאלי', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Azrieli_Towers_Tel_Aviv_westward_view.jpg/1280px-Azrieli_Towers_Tel_Aviv_westward_view.jpg'),
  ('שוק הכרמל', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Carmel_Market_Tel_Aviv_Yafo_-_1.jpg/1280px-Carmel_Market_Tel_Aviv_Yafo_-_1.jpg'),
  ('שוק הכרמל', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Carmel_Market_Tel_Aviv_Yafo_-_2.jpg/1280px-Carmel_Market_Tel_Aviv_Yafo_-_2.jpg'),
  ('גן לאומי בית גוברין', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Old_building_in_Beit_Guvrin_National_Park_%2825240834513%29.jpg/1280px-Old_building_in_Beit_Guvrin_National_Park_%2825240834513%29.jpg'),
  ('גן לאומי בית גוברין', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Beit_Guvrin_National_Park-6184564814.jpg/1280px-Beit_Guvrin_National_Park-6184564814.jpg'),
  ('מכתש רמון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg/1280px-ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg'),
  ('מכתש רמון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/ISR-2013-Makhtesh_Ramon-Near_Makhtesh_Ramon_%28looking_in%29.jpg/1280px-ISR-2013-Makhtesh_Ramon-Near_Makhtesh_Ramon_%28looking_in%29.jpg'),
  ('מצפה כוכבים רמון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Houses_in_the_marble_neighborhood%2C_Mitzpe_Ramon%2C_Israel.jpg/1280px-Houses_in_the_marble_neighborhood%2C_Mitzpe_Ramon%2C_Israel.jpg'),
  ('מצפה כוכבים רמון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Camel_Lookout_in_Mitzpe_Ramon_%2840685%29a.jpg/1280px-Camel_Lookout_in_Mitzpe_Ramon_%2840685%29a.jpg'),
  ('בית שאן העתיקה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Beit-Shean-national-park-3-31916.jpg/1280px-Beit-Shean-national-park-3-31916.jpg'),
  ('בית שאן העתיקה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Beit-Shean-national-park-3-32222.jpg/1280px-Beit-Shean-national-park-3-32222.jpg'),
  ('מצודת נמרוד', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Nimrod_castle_%2829%29.jpg/1280px-Nimrod_castle_%2829%29.jpg'),
  ('מצודת נמרוד', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nimrod_castle_%2852%29.jpg/1280px-Nimrod_castle_%2852%29.jpg'),
  ('שמורת טבע עין אפק', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Yarkon-Tel-Afek-1607.jpg/1280px-Yarkon-Tel-Afek-1607.jpg'),
  ('שמורת טבע עין אפק', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/108839_tel_afek_-_yarkon_national_park_PikiWiki_Israel.jpg/1280px-108839_tel_afek_-_yarkon_national_park_PikiWiki_Israel.jpg'),
  ('מוזיאון הטבע אילת', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Eilat-coral-beach-reserve-b.JPG/1280px-Eilat-coral-beach-reserve-b.JPG'),
  ('מוזיאון הטבע אילת', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Eilat-coral-beach-reserve-c.JPG/1280px-Eilat-coral-beach-reserve-c.JPG'),
  ('נחל כזיב', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Kziv_stream_area.JPG/1280px-Kziv_stream_area.JPG'),
  ('נחל כזיב', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Kziv_stream.JPG/1280px-Kziv_stream.JPG'),
  ('נחל עמוד', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Nahal_Amud_panorama_%28cylindrical%2C_90_deg._width%29.jpg/1280px-Nahal_Amud_panorama_%28cylindrical%2C_90_deg._width%29.jpg'),
  ('נחל עמוד', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Nahal_Amud_Trails_-_panoramio_%283%29.jpg/1280px-Nahal_Amud_Trails_-_panoramio_%283%29.jpg'),
  ('שביל ישראל — קטע הגליל', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/PikiWiki_Israel_15067_Geography_of_Israel.jpg/1280px-PikiWiki_Israel_15067_Geography_of_Israel.jpg'),
  ('שביל ישראל — קטע הגליל', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/PikiWiki_Israel_15085_Zipori_Forest.jpg/1280px-PikiWiki_Israel_15085_Zipori_Forest.jpg'),
  ('נחל פרת', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Ein-Prat-to-Ein-Mabua-711.jpg/1280px-Ein-Prat-to-Ein-Mabua-711.jpg'),
  ('נחל פרת', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ein-Prat-to-Ein-Mabua-670.jpg/1280px-Ein-Prat-to-Ein-Mabua-670.jpg'),
  ('נחל דוד', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Ein-Gedi_Sanctuary_8282.jpg/1280px-Ein-Gedi_Sanctuary_8282.jpg'),
  ('נחל דוד', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Ein-Gedi_Sanctuary_D03.jpg/1280px-Ein-Gedi_Sanctuary_D03.jpg'),
  ('טיילת חוף תל אביב', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Tel_Aviv_Tayelet-Strand-Promenade_Beach_%2834257299744%29.jpg/1280px-Tel_Aviv_Tayelet-Strand-Promenade_Beach_%2834257299744%29.jpg'),
  ('טיילת חוף תל אביב', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/PikiWiki_Israel_51691_tel_aviv_beach_promenade.jpg/1280px-PikiWiki_Israel_51691_tel_aviv_beach_promenade.jpg'),
  ('יער בן שמן', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/PikiWiki_Israel_29288_Winter_Blossom_Ben-Shemen_forest.JPG/1280px-PikiWiki_Israel_29288_Winter_Blossom_Ben-Shemen_forest.JPG'),
  ('יער בן שמן', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/PikiWiki_Israel_29282_Winter_Blossom_Ben-Shemen_forest.JPG/1280px-PikiWiki_Israel_29282_Winter_Blossom_Ben-Shemen_forest.JPG'),
  ('נחל איילון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ayalon_River_in_Lod_December_2020_%282%29.jpg/1280px-Ayalon_River_in_Lod_December_2020_%282%29.jpg'),
  ('נחל איילון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Ayalon_River_Graffiti_10.jpg/1280px-Ayalon_River_Graffiti_10.jpg'),
  ('נחל הבשור באופניים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Nahal-besor-tzeelim-tower.JPG/1280px-Nahal-besor-tzeelim-tower.JPG'),
  ('נחל הבשור באופניים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Nahal-besor-revuva-well.jpg/1280px-Nahal-besor-revuva-well.jpg'),
  ('שביל הפרסה — מכתש רמון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Scary_bridge_falling_apart_at_Makhtesh_Ramon_%2840594%29.jpg/1280px-Scary_bridge_falling_apart_at_Makhtesh_Ramon_%2840594%29.jpg'),
  ('שביל הפרסה — מכתש רמון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Lookout_and_Visitors_Center_in_Mitzpe_Ramon_%2840691%29.jpg/1280px-Lookout_and_Visitors_Center_in_Mitzpe_Ramon_%2840691%29.jpg'),
  ('הר ארבל', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Arrbel_panorama.jpg/1280px-Arrbel_panorama.jpg'),
  ('הר ארבל', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/View_from_Mount_Arbel.JPG/1280px-View_from_Mount_Arbel.JPG'),
  ('מסלול הר מירון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Mount_Meron_-_Al-Jarmaq_-_Israel_National_Trail_09.jpg/1280px-Mount_Meron_-_Al-Jarmaq_-_Israel_National_Trail_09.jpg'),
  ('מסלול הר מירון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Mount_Meron_-_Al-Jarmaq_-_Israel_National_Trail_16.jpg/1280px-Mount_Meron_-_Al-Jarmaq_-_Israel_National_Trail_16.jpg'),
  ('נחל זויתן', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Pool_below_Upper_Zavitan_Fall.jpg/1280px-Pool_below_Upper_Zavitan_Fall.jpg'),
  ('נחל זויתן', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Zavitan_River_Hexagons.jpg/1280px-Zavitan_River_Hexagons.jpg'),
  ('נחל יהודייה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/%D7%A0%D7%97%D7%9C_%D7%99%D7%94%D7%95%D7%93%D7%99%D7%99%D7%94-%D7%96%D7%95%D7%95%D7%99%D7%AA%D7%9F4.jpg/1280px-%D7%A0%D7%97%D7%9C_%D7%99%D7%94%D7%95%D7%93%D7%99%D7%99%D7%94-%D7%96%D7%95%D7%95%D7%99%D7%AA%D7%9F4.jpg'),
  ('נחל יהודייה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/%D7%A0%D7%97%D7%9C_%D7%99%D7%94%D7%95%D7%93%D7%99%D7%99%D7%94-%D7%96%D7%95%D7%95%D7%99%D7%AA%D7%9F3.jpg/1280px-%D7%A0%D7%97%D7%9C_%D7%99%D7%94%D7%95%D7%93%D7%99%D7%99%D7%94-%D7%96%D7%95%D7%95%D7%99%D7%AA%D7%9F3.jpg'),
  ('שביל הגולן — בניאס', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/The_Banias_Waterfall_%D7%9E%D7%A4%D7%9C%D7%99_%D7%94%D7%91%D7%A0%D7%99%D7%90%D7%A1.jpg/1280px-The_Banias_Waterfall_%D7%9E%D7%A4%D7%9C%D7%99_%D7%94%D7%91%D7%A0%D7%99%D7%90%D7%A1.jpg'),
  ('שביל הגולן — בניאס', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Banias_Spring_Cliff_Pan%27s_Cave.JPG/1280px-Banias_Spring_Cliff_Pan%27s_Cave.JPG'),
  ('מסלול נחל תמנע', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Landscape_in_Timna_Park_%2812%29.JPG/1280px-Landscape_in_Timna_Park_%2812%29.JPG'),
  ('מסלול נחל תמנע', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Erez_ben_Yosef_on_Site_34_at_Timna_Valley.jpg/1280px-Erez_ben_Yosef_on_Site_34_at_Timna_Valley.jpg'),
  ('הכותל המערבי', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Western_wall_and_its_square%2C_jerusalem.jpg/1280px-Western_wall_and_its_square%2C_jerusalem.jpg'),
  ('הכותל המערבי', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Western_Wall_at_night_%2820063%29.jpg/1280px-Western_Wall_at_night_%2820063%29.jpg'),
  ('מגדל דוד', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Jerusalem-Tower-of-David-0568.jpg/1280px-Jerusalem-Tower-of-David-0568.jpg'),
  ('מגדל דוד', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Jerusalem-Tower-of-David-0710.jpg/1280px-Jerusalem-Tower-of-David-0710.jpg'),
  ('יד ושם', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/ISR-2015-Jerusalem-Yad_Vashem-Wagon_monument_01.jpg/1280px-ISR-2015-Jerusalem-Yad_Vashem-Wagon_monument_01.jpg'),
  ('יד ושם', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Yad_Vashem_%28Prism_Skylight%29_2008.jpg/1280px-Yad_Vashem_%28Prism_Skylight%29_2008.jpg'),
  ('העיר העתיקה בצפת', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Safed_old_city_gate.jpg/1280px-Safed_old_city_gate.jpg'),
  ('העיר העתיקה בצפת', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/PikiWiki_Israel_68531_old_safed_above_alley.jpg/1280px-PikiWiki_Israel_68531_old_safed_above_alley.jpg'),
  ('תל דן', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/119514_nahal_dan-tel_el_kadi_reserve_PikiWiki_Israel.jpg/1280px-119514_nahal_dan-tel_el_kadi_reserve_PikiWiki_Israel.jpg'),
  ('תל דן', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/119511_nahal_dan-tel_el_kadi_reserve_PikiWiki_Israel.jpg/1280px-119511_nahal_dan-tel_el_kadi_reserve_PikiWiki_Israel.jpg'),
  ('נחל עין עבדת', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ISR-2013-Ein_Avdat-Palm_trees.jpg/1280px-ISR-2013-Ein_Avdat-Palm_trees.jpg'),
  ('נחל עין עבדת', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Avdat_Schlucht_Ein_Avdat_19.JPG/1280px-Avdat_Schlucht_Ein_Avdat_19.JPG'),
  ('נמל תל אביב', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Namal_tel_aviv.JPG/1280px-Namal_tel_aviv.JPG'),
  ('נמל תל אביב', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Tel_Aviv_Port_Caffe.jpg/1280px-Tel_Aviv_Port_Caffe.jpg'),
  ('נווה צדק', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Neve_Tzedek_Tel_Aviv_%283%29.jpg/1280px-Neve_Tzedek_Tel_Aviv_%283%29.jpg'),
  ('נווה צדק', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Neve_Tzedek_Tel_Aviv_%284%29.jpg/1280px-Neve_Tzedek_Tel_Aviv_%284%29.jpg'),
  ('טבריה והכנרת', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Sea_of_Galilee_Tiberias_Ginosar_200704.JPG/1280px-Sea_of_Galilee_Tiberias_Ginosar_200704.JPG'),
  ('טבריה והכנרת', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Tiberias_from_Route_767_%2802%29.jpg/1280px-Tiberias_from_Route_767_%2802%29.jpg'),
  ('תל מגידו', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/20191028_120303_Tel_Megiddo_Israel_anagoria.JPG/1280px-20191028_120303_Tel_Megiddo_Israel_anagoria.JPG'),
  ('תל מגידו', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Ruins_atop_Tel_Megiddo_with_circular_altar-like_shrine_and_a_series_of_temples_on_top_of_the_other_dating_from_the_early_bronze-age_through_the_iron-age_periods%2C_Tel_Meggido%2C_Israel_%2819888642855%29.jpg/1280px-thumbnail.jpg'),
  ('המושבה הגרמנית בחיפה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/German_Colony%2C_Haifa_-_Christmas_decorations.jpg/1280px-German_Colony%2C_Haifa_-_Christmas_decorations.jpg'),
  ('המושבה הגרמנית בחיפה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Haifa%2C_German_Colony_%28001%29.JPG/1280px-Haifa%2C_German_Colony_%28001%29.JPG'),
  ('חוף עין בוקק', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Ein_Bokek._Dead_Sea._Israel._05.jpg/1280px-Ein_Bokek._Dead_Sea._Israel._05.jpg'),
  ('חוף עין בוקק', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Ein_Bokek._Dead_Sea._Israel._06.jpg/1280px-Ein_Bokek._Dead_Sea._Israel._06.jpg'),
  ('טיילת האס בירושלים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Jerusalem_Haas_Promenade_Belvedere_Hanoucca.jpg/1280px-Jerusalem_Haas_Promenade_Belvedere_Hanoucca.jpg'),
  ('טיילת האס בירושלים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/View_from_Tayelet_during_Snow_04.jpg/1280px-View_from_Tayelet_during_Snow_04.jpg'),
  ('נחל דן', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Israel_National_Trail_part_1DSCN4266.JPG/1280px-Israel_National_Trail_part_1DSCN4266.JPG'),
  ('הר תבור', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Mount_of_transfiguration_is.JPG/1280px-Mount_of_transfiguration_is.JPG'),
  ('הר תבור', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/ISRAEL%2C_Mount_Tabor_%2815%29.JPG/1280px-ISRAEL%2C_Mount_Tabor_%2815%29.JPG'),
  ('שמורת נחל מערות', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Nahal-Mearot-2-38.jpg/1280px-Nahal-Mearot-2-38.jpg'),
  ('שמורת נחל מערות', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Nahal-mearot-finger-cliff.JPG/1280px-Nahal-mearot-finger-cliff.JPG'),
  ('זכרון יעקב — המושבה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Zikhron_Ya%27akov%2C_22_February_2026_02.jpg/1280px-Zikhron_Ya%27akov%2C_22_February_2026_02.jpg'),
  ('זכרון יעקב — המושבה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Zikhron_Ya%27akov%2C_22_February_2026_01.jpg/1280px-Zikhron_Ya%27akov%2C_22_February_2026_01.jpg'),
  ('פארק הירקון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Aphek_Yarkon_park_271012_08.jpg/1280px-Aphek_Yarkon_park_271012_08.jpg'),
  ('פארק הירקון', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Tel_Aviv_Yarkon_Park_2024.jpg/1280px-Tel_Aviv_Yarkon_Park_2024.jpg'),
  ('חוף האלמוגים באילת', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Eilat-coral-beach-reserve-b.JPG/1280px-Eilat-coral-beach-reserve-b.JPG'),
  ('חוף האלמוגים באילת', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Eilat-coral-beach-reserve-c.JPG/1280px-Eilat-coral-beach-reserve-c.JPG'),
  ('הר הזיתים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Jerusalem_panorama_from_Mount_of_Olives_07112018.jpg/1280px-Jerusalem_panorama_from_Mount_of_Olives_07112018.jpg'),
  ('הר הזיתים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Panorama_Jerozolimy.jpg/1280px-Panorama_Jerozolimy.jpg'),
  ('עיר דוד', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Old_City_Walls_and_Tower_of_David_in_Jerusalem_%282019%29_01.jpg/1280px-Old_City_Walls_and_Tower_of_David_in_Jerusalem_%282019%29_01.jpg'),
  ('עיר דוד', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/City_of_David%2C_Jerusalem_P1110594_%285921766547%29.jpg/1280px-City_of_David%2C_Jerusalem_P1110594_%285921766547%29.jpg'),
  ('הר הרצל', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/114933_the_herzl_center_on_mount_herzl_jerusalem_PikiWiki_Israel.jpg/1280px-114933_the_herzl_center_on_mount_herzl_jerusalem_PikiWiki_Israel.jpg'),
  ('הר הרצל', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Mount_Herzl_light_rail_stop%2C_Jerusalem_%282%29.jpg/1280px-Mount_Herzl_light_rail_stop%2C_Jerusalem_%282%29.jpg'),
  ('כיכר דיזנגוף', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Dizengoff_Square_Tel_Aviv_Lowshot.jpg/1280px-Dizengoff_Square_Tel_Aviv_Lowshot.jpg'),
  ('כיכר דיזנגוף', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Tel_Aviv_120326_Dizengoff_03.jpg/1280px-Tel_Aviv_120326_Dizengoff_03.jpg'),
  ('שוק לוינסקי', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/PikiWiki_Israel_9176_Levinsky_market_in_Tel_Aviv.JPG/1280px-PikiWiki_Israel_9176_Levinsky_market_in_Tel_Aviv.JPG'),
  ('שוק לוינסקי', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/PikiWiki_Israel_9955_levinsky_market_in_tel_aviv.jpg/1280px-PikiWiki_Israel_9955_levinsky_market_in_tel_aviv.jpg'),
  ('מרינה הרצליה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/150611_herzliya_marina_PikiWiki_Israel.jpg/1280px-150611_herzliya_marina_PikiWiki_Israel.jpg'),
  ('מרינה הרצליה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/150609_herzliya_marina_PikiWiki_Israel.jpg/1280px-150609_herzliya_marina_PikiWiki_Israel.jpg'),
  ('אגמון החולה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Agamon_HaHula_%E2%80%93_Hula_Valley.jpg/1280px-Agamon_HaHula_%E2%80%93_Hula_Valley.jpg'),
  ('אגמון החולה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/View_of_Agamon_Hula.JPG/1280px-View_of_Agamon_Hula.JPG'),
  ('שמורת גמלא', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Griffon_vulture_at_Gamla_nature_reserve.jpg/1280px-Griffon_vulture_at_Gamla_nature_reserve.jpg'),
  ('שמורת גמלא', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Gamla_Nature_reserve_%282%29.JPG/1280px-Gamla_Nature_reserve_%282%29.JPG'),
  ('כפר קצרין העתיק', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Katzrin_ancient_village_and_synagogue.jpg/1280px-Katzrin_ancient_village_and_synagogue.jpg'),
  ('כפר קצרין העתיק', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Column_capitals._Synagogue._Katzrin_ancient_village._03.JPG/1280px-Column_capitals._Synagogue._Katzrin_ancient_village._03.JPG'),
  ('מסלול חומות העיר העתיקה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Old_City_Walls_and_Tower_of_David_in_Jerusalem_%282019%29_01.jpg/1280px-Old_City_Walls_and_Tower_of_David_in_Jerusalem_%282019%29_01.jpg'),
  ('מסלול חומות העיר העתיקה', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Old_City_Walls_of_Jerusalem_near_Zion_Gate%2C_showing_a_portion_of_the_Ramparts_Walk_southern_section.jpg/1280px-Old_City_Walls_of_Jerusalem_near_Zion_Gate%2C_showing_a_portion_of_the_Ramparts_Walk_southern_section.jpg'),
  ('טיילת יפו—בת ים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/94768_bat_yam_promenade_beach_PikiWiki_Israel.jpg/1280px-94768_bat_yam_promenade_beach_PikiWiki_Israel.jpg'),
  ('טיילת יפו—בת ים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/PikiWiki_Israel_11580_whale_in_bat_yam_promenade.jpg/1280px-PikiWiki_Israel_11580_whale_in_bat_yam_promenade.jpg'),
  ('שביל הירקון באופניים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Yarkon_River_in_the_Winter.jpg/1280px-Yarkon_River_in_the_Winter.jpg'),
  ('שביל הירקון באופניים', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Yarkon_River%2C_Ussishkin_Bridge.jpg/1280px-Yarkon_River%2C_Ussishkin_Bridge.jpg');

insert into demo.images (user_id, entity_type, entity_id, url, created_at)
select (select id from _users where rn = 1 + (h + case when (select id from _users where rn = 1 + h % (select count(*) from _users)) = e.id_owner then 1 else 0 end) % (select count(*) from _users)),
  e.t, e.id, ph.url, now() - make_interval(days => d, hours => hr)
from (
  select p.url, p.name, abs(hashtext(p.url)) as h, abs(hashtext(p.url || 'd')) % 60 as d, abs(hashtext(p.url || 'h')) % 24 as hr from _photos p
) ph
join (
  select 'place'::public.entity_type as t, id, created_by as id_owner, name, image_url from demo.places where status = 'approved'
  union all select 'trail'::public.entity_type, id, created_by, name, image_url from demo.trails where status = 'approved'
) e on e.name = ph.name
where ph.url <> e.image_url;

-- trips: reuse a community photo of the trip's first place
insert into demo.images (user_id, entity_type, entity_id, url, created_at)
select (select id from _users where id <> t.created_by order by hashtext(id::text || t.id::text) limit 1),
  'trip'::public.entity_type, t.id, img.url, now() - make_interval(days => abs(hashtext(t.id::text || 'ti')) % 40)
from demo.trips t
join lateral (select s.place_id from demo.trip_stations s where s.trip_id = t.id and s.place_id is not null order by s.order_index limit 1) fs on true
join lateral (select i.url from demo.images i where i.entity_type = 'place' and i.entity_id = fs.place_id order by i.id limit 1) img on true
where t.status = 'approved' and abs(hashtext(t.id::text || 'tim')) % 100 < 45;

-- 4. favorites
with pair as (
  select u.id as uid, e.t, e.id as eid, abs(hashtext(u.id::text || e.id::text || 'fv')) % 100 as sel,
    abs(hashtext(u.id::text || e.id::text || 'fd')) % 60 as age_days
  from _users u cross join _ent e where u.id <> e.owner
)
insert into demo.favorites (user_id, entity_type, entity_id, created_at)
select uid, t, eid, now() - make_interval(days => age_days) from pair where sel < 22
on conflict (user_id, entity_type, entity_id) do nothing;

-- 5. counters kept on trips: rating, favorites and views
update demo.trips t set
  avg_rating = coalesce((select round(avg(r.score)::numeric, 1) from demo.ratings r where r.entity_type = 'trip' and r.entity_id = t.id), 0),
  favorites_count = (select count(*) from demo.favorites f where f.entity_type = 'trip' and f.entity_id = t.id)
where t.status = 'approved';
update demo.trips t set views_count = 40 + abs(hashtext(t.id::text || 'v')) % 700 + t.favorites_count * 35 where t.status = 'approved';

-- 6. reports
with data(i, name, rtype, reason, status) as (values
  (0, 'מצדה', 'inaccuracy', 'שעות הפתיחה בקיץ שונות מהמפורט, השער נפתח מוקדם יותר.', 'pending'),
  (1, 'מכתש רמון', 'update', 'נוסף מרכז מבקרים חדש ליד התצפית, כדאי לעדכן את התיאור.', 'pending'),
  (2, 'מוזיאון ישראל', 'inaccuracy', 'מחיר הכניסה שונה מהמצוין באתר.', 'pending'),
  (3, 'שוק מחנה יהודה', 'problem', 'התמונה הראשית לא משקפת את מצב השוק כיום.', 'pending'),
  (4, 'נחל עמוד', 'problem', 'חלק מהמסלול סגור כרגע בגלל עבודות, כדאי להוסיף אזהרה.', 'pending'),
  (5, 'טיילת חוף תל אביב', 'update', 'נוספה חניה חדשה בקצה הצפוני של הטיילת.', 'pending'),
  (6, 'ראש הנקרה', 'inaccuracy', 'משך הביקור המשוער נמוך מדי בימי שיא.', 'pending'),
  (7, 'גן לאומי קיסריה', 'problem', 'הקואורדינטות מובילות לחניה אחרת מהכניסה הראשית.', 'pending'),
  (8, 'תל אביב מהנמל ליפו', 'inaccuracy', 'משך הטיול ארוך משמעותית מהמצוין.', 'pending'),
  (9, 'הר ארבל', 'update', 'השביל המסומן בכחול הוחלף והמסלול התעדכן בשטח.', 'pending'),
  (10, 'מערת הנטיפים', 'update', 'המערה סגורה לשיפוצים לתקופה, כדאי לציין זאת בתיאור.', 'resolved'),
  (11, 'חוף הבונים', 'inaccuracy', 'התיאור מציין שירותי הצלה בכל החוף, ובפועל יש רק בחלק ממנו.', 'resolved'),
  (12, 'מדבר יהודה והמלח', 'update', 'חוף עין בוקק שופץ והוספו מקלחות.', 'resolved'),
  (13, 'נחל זויתן', 'problem', 'קישור התמונה בדף המסלול לא נטען.', 'resolved'),
  (14, 'יפו העתיקה', 'problem', 'לדעתי הדף הזה לא שייך לאתר.', 'rejected'),
  (15, 'שמורת עין גדי', 'inaccuracy', 'לדעתי מחיר הכניסה גבוה מהמצוין.', 'rejected')
), target as (
  select d.*, e.t, e.id as eid, e.owner
  from data d join _ent e on e.name = d.name
)
insert into demo.reports (user_id, entity_type, entity_id, report_type, reason, status, created_at, resolved_at, resolved_by)
select (select id from _users where id <> t.owner order by hashtext(id::text || t.i::text) limit 1),
  t.t, t.eid, t.rtype::public.report_type, t.reason, t.status::public.report_status,
  now() - make_interval(days => case when t.status = 'pending' then t.i % 6 else 8 + t.i end, hours => (t.i * 5) % 24),
  case when t.status = 'pending' then null else now() - make_interval(days => 3 + t.i % 4) end,
  case when t.status = 'pending' then null else (select id from _users where role = 'admin' order by rn limit 1) end
from target t;

-- 7. moderation queue: keep the real timestamps, and mark everything older than 5 days as reviewed
update demo.moderation_queue q set created_at = c.created_at from demo.comments c where q.kind = 'comment' and q.source_id = c.id;
update demo.moderation_queue q set created_at = i.created_at from demo.images i where q.kind = 'gallery_image' and q.source_id = i.id;
update demo.moderation_queue set seen_at = created_at + interval '5 hours',
  seen_by = (select id from _users where role = 'admin' order by rn limit 1)
where seen_at is null and created_at < now() - interval '5 days';

commit;
