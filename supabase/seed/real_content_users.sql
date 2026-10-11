-- Content for the newest demo users (schema demo). Photos: Wikimedia Commons.
begin;

-- Places
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'הר הזיתים', 'תצפית פנורמית על העיר העתיקה והר הבית מהמזרח.', 'הר הזיתים נמצא ממזרח לעיר העתיקה בירושלים, ומשם נשקפת תצפית פנורמית על העיר, בעיקר יפה בשעות הבוקר והשקיעה. בהר בית עלמין עתיק ואתרים קדושים לשלוש הדתות. בשל המדרונות הנגישות בינונית.', 'הר הזיתים, ירושלים', 31.7788, 35.245, 'ירושלים', 'מצפה', 3, array['נוף','דת','היסטוריה','צילום','חינם']::text[], 90, 0, 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Sunset_over_Jerusalem_from_the_Mount_of_Olives_01.jpg/1280px-Sunset_over_Jerusalem_from_the_Mount_of_Olives_01.jpg', (select id from demo.profiles where name='Yosef Nachmany'), 'approved', public.next_unique_slug('demo','places','הר הזיתים')
where not exists (select 1 from demo.places where name='הר הזיתים');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'עיר דוד', 'אתר ארכיאולוגי מדרום להר הבית, עם מנהרות מים עתיקות.', 'עיר דוד היא אתר ארכיאולוגי מדרום להר הבית, ובו שרידי העיר העתיקה של ירושלים ומערכות מים קדומות. אפשר ללכת במנהרות המים, ולכן כדאי להצטייד בנעליים שמתאימות להרטבה. הנגישות מוגבלת, ומחיר הכניסה משוער.', 'עיר דוד, ירושלים', 31.7731, 35.2354, 'ירושלים', 'אתר מורשת', 2, array['ארכיאולוגיה','היסטוריה','מים']::text[], 150, 35, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/City_of_David%2C_Jerusalem_P1110594_%285921766547%29.jpg/1280px-City_of_David%2C_Jerusalem_P1110594_%285921766547%29.jpg', (select id from demo.profiles where name='Yosef Nachmany'), 'approved', public.next_unique_slug('demo','places','עיר דוד')
where not exists (select 1 from demo.places where name='עיר דוד');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'הר הרצל', 'בית העלמין הלאומי והמוזיאון על שם הרצל.', 'הר הרצל הוא אתר זיכרון לאומי בירושלים, ובו קברו של בנימין זאב הרצל, בית הקברות הצבאי והמרכז המתאר את חייו ופועלו. הכניסה חופשית, והתנהלות במקום דורשת כבוד לקדושת המקום.', 'הר הרצל, ירושלים', 31.7745, 35.1778, 'ירושלים', 'אתר מורשת', 4, array['היסטוריה','תרבות','חינם']::text[], 120, 0, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/114933_the_herzl_center_on_mount_herzl_jerusalem_PikiWiki_Israel.jpg/1280px-114933_the_herzl_center_on_mount_herzl_jerusalem_PikiWiki_Israel.jpg', (select id from demo.profiles where name='Yosef Nachmany'), 'approved', public.next_unique_slug('demo','places','הר הרצל')
where not exists (select 1 from demo.places where name='הר הרצל');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'כיכר דיזנגוף', 'כיכר מרכזית בלב העיר, מוכרת בזכות מזרקת האש והמים.', 'כיכר דיזנגוף היא אחת הכיכרות המוכרות בתל אביב, ובמרכזה מזרקת האש והמים של האמן יעקב אגם. סביבה בתי קפה וחנויות, והיא נגישה למעבר ברגל. מקום טוב להתחלת הליכה ברחובות העיר.', 'כיכר דיזנגוף, תל אביב-יפו', 32.0782, 34.774, 'מרכז', 'אחר', 5, array['תרבות','אוכל','אמנות','חינם']::text[], 60, 0, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Dizengoff_Square.jpg/1280px-Dizengoff_Square.jpg', (select id from demo.profiles where name='Daniel Lev'), 'approved', public.next_unique_slug('demo','places','כיכר דיזנגוף')
where not exists (select 1 from demo.places where name='כיכר דיזנגוף');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'שוק לוינסקי', 'שוק בדרום תל אביב, ידוע בתבלינים, באגוזים ובבשמים.', 'שוק לוינסקי הוא שוק ותיק בדרום תל אביב, שבו חנויות של תבלינים, אגוזים, פירות יבשים ובשמים, יחד עם מאפיות ובתי אוכל של עדות שונות. כדאי להגיע בבוקר ולטעום.', 'רחוב לוינסקי, תל אביב-יפו', 32.0576, 34.7714, 'מרכז', 'שוק', 4, array['אוכל','תרבות','צילום','חינם']::text[], 90, 0, 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Levinsky_Market_in_Tel_Aviv.jpg/1280px-Levinsky_Market_in_Tel_Aviv.jpg', (select id from demo.profiles where name='Daniel Lev'), 'approved', public.next_unique_slug('demo','places','שוק לוינסקי')
where not exists (select 1 from demo.places where name='שוק לוינסקי');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'מרינה הרצליה', 'מרינה עם סירות, מסעדות וטיילת על המים.', 'מרינה הרצליה היא נמל יאכטות עם טיילת, מסעדות ובתי קפה לצד המים. מקום רגוע להליכה, בעיקר לקראת שקיעה, והגישה נוחה לכל המשפחה.', 'המרינה, הרצליה', 32.1647, 34.7931, 'מרכז', 'נמל', 5, array['ים','אוכל','משפחות','חינם']::text[], 120, 0, 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/150611_herzliya_marina_PikiWiki_Israel.jpg/1280px-150611_herzliya_marina_PikiWiki_Israel.jpg', (select id from demo.profiles where name='Daniel Lev'), 'approved', public.next_unique_slug('demo','places','מרינה הרצליה')
where not exists (select 1 from demo.places where name='מרינה הרצליה');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'פארק אפולוניה', 'שרידי עיר עתיקה וצלבנית על צוק מעל הים.', 'פארק אפולוניה (ארסוף) הוא גן לאומי על צוק מעל הים בהרצליה, ובו שרידי יישוב עתיק ומבצר צלבני. נוף מרשים אל הים ומסלולי הליכה קצרים. מחיר הכניסה משוער.', 'גן לאומי אפולוניה, הרצליה', 32.2105, 34.8161, 'מרכז', 'גן לאומי', 3, array['ארכיאולוגיה','היסטוריה','ים','נוף']::text[], 120, 30, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/118578_apollonia_national_park_herzliya_PikiWiki_Israel.jpg/1280px-118578_apollonia_national_park_herzliya_PikiWiki_Israel.jpg', (select id from demo.profiles where name='Daniel Lev'), 'approved', public.next_unique_slug('demo','places','פארק אפולוניה')
where not exists (select 1 from demo.places where name='פארק אפולוניה');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'אגמון החולה', 'פארק ציפורים בעמק החולה, עם שבילים ואפשרות להשכרת אופניים.', 'אגמון החולה הוא פארק טבע בעמק החולה, מקום עצירה חשוב לציפורים נודדות, בעיקר בעונת הנדידה. אפשר לטייל בשבילים או להשכיר אופניים ועגלת גולף. מתאים למשפחות, והנגישות טובה. מחיר הכניסה משוער.', 'אגמון החולה, עמק החולה', 33.0997, 35.6044, 'צפון', 'פארק', 4, array['טבע','משפחות','נוף','צילום']::text[], 180, 50, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/View_of_Agamon_Hula.JPG/1280px-View_of_Agamon_Hula.JPG', (select id from demo.profiles where name='Chana Ben David'), 'approved', public.next_unique_slug('demo','places','אגמון החולה')
where not exists (select 1 from demo.places where name='אגמון החולה');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'שמורת גמלא', 'שמורת טבע בגולן עם עיר עתיקה, נשרים ומפל גבוה.', 'גמלא היא שמורת טבע ברמת הגולן, ובה שרידי עיר יהודית עתיקה שנלחמה בכוחות רומיים, וגם נשרים מקננים ומפל גבוה. הגישה למפל כוללת ירידה תלולה, ולכן הנגישות מוגבלת. מחיר הכניסה משוער.', 'שמורת הטבע גמלא, רמת הגולן', 32.9065, 35.7517, 'צפון', 'אחר', 2, array['טבע','היסטוריה','נוף','מים']::text[], 210, 30, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Gamla_Nature_reserve_%282%29.JPG/1280px-Gamla_Nature_reserve_%282%29.JPG', (select id from demo.profiles where name='Chana Ben David'), 'approved', public.next_unique_slug('demo','places','שמורת גמלא')
where not exists (select 1 from demo.places where name='שמורת גמלא');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'כפר קצרין העתיק', 'כפר יהודי עתיק בגולן עם בית כנסת ובתים משוחזרים.', 'בפארק הארכיאולוגי קצרין שוחזר כפר יהודי מהתקופה הביזנטית, כולל בית כנסת, בתים ובית בד. מתאים למשפחות עם ילדים שאוהבים לראות איך חיו פעם. מחיר הכניסה משוער.', 'הפארק הארכיאולוגי קצרין, רמת הגולן', 32.9909, 35.6927, 'צפון', 'אתר מורשת', 3, array['ארכיאולוגיה','היסטוריה','משפחות']::text[], 120, 30, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Katzrin_ancient_village_and_synagogue.jpg/1280px-Katzrin_ancient_village_and_synagogue.jpg', (select id from demo.profiles where name='Chana Ben David'), 'approved', public.next_unique_slug('demo','places','כפר קצרין העתיק')
where not exists (select 1 from demo.places where name='כפר קצרין העתיק');

-- Trail
insert into demo.trails (name, short_description, full_description, region, trail_type, length_km, duration_minutes, difficulty, accessibility, tags, estimated_price, start_lat, start_lng, end_lat, end_lng, waypoints, image_url, created_by, status, slug)
select 'נחל גמלא — מסלול המפל', 'מסלול ירידה אל המפל בשמורת גמלא, עם נוף לקניון ולנשרים.', 'מסלול הליכה בשמורת גמלא היורד אל מפל גמלא, אחד המפלים הגבוהים בארץ. המסלול כולל ירידה ועלייה תלולות, ולכן מתאים למי שכושרו טוב. כדאי להצטייד במים. האורך, המשך והקואורדינטות משוערים.', 'צפון', 'הליכה', 3.5, 180, 'medium'::difficulty, 2, array['טבע','מים','הליכה','נוף']::text[], 30, 32.9065, 35.7517, 32.9010, 35.7440, '[{"name":"כניסה לשמורה","lat":32.9065,"lng":35.7517}]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Gamla_Nature_reserve_%2811%29.JPG/1280px-Gamla_Nature_reserve_%2811%29.JPG', (select id from demo.profiles where name='Chana Ben David'), 'approved', public.next_unique_slug('demo','trails','נחל גמלא — מסלול המפל')
where not exists (select 1 from demo.trails where name='נחל גמלא — מסלול המפל');

-- Trips
with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'ירושלים הקדושה: הר הזיתים והעיר העתיקה', 'מהתצפית בהר הזיתים אל עיר דוד, הכותל ומגדל דוד.', 'טיול בירושלים בין אתרי מורשת: מתחילים בתצפית בהר הזיתים, יורדים לעיר דוד, ממשיכים לכותל המערבי ומסיימים במגדל דוד. מתאים לרגל ולמי שאוהב היסטוריה.', '', '{}'::text[], array['דת','היסטוריה','נוף','צילום']::text[], (select id from demo.profiles where name='Yosef Nachmany'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','ירושלים הקדושה: הר הזיתים והעיר העתיקה')
  where not exists (select 1 from demo.trips where name='ירושלים הקדושה: הר הזיתים והעיר העתיקה')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'הר הזיתים', null), (1, 'place', 'עיר דוד', 'car'), (2, 'place', 'הכותל המערבי', 'walking'), (3, 'place', 'מגדל דוד', 'walking')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'זיכרון ופסגות ירושלים', 'הר הרצל, יד ושם ומוזיאון ישראל ביום אחד.', 'יום זיכרון ותרבות בירושלים: הר הרצל, יד ושם ומוזיאון ישראל. הכניסה לשניים הראשונים חינם, והיום מתאים לכל מזג אוויר.', '', '{}'::text[], array['היסטוריה','תרבות','חינם']::text[], (select id from demo.profiles where name='Yosef Nachmany'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','זיכרון ופסגות ירושלים')
  where not exists (select 1 from demo.trips where name='זיכרון ופסגות ירושלים')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'הר הרצל', null), (1, 'place', 'יד ושם', 'car'), (2, 'place', 'מוזיאון ישראל', 'car')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'ירושלים בקצב איטי', 'טיילת האס, שוק מחנה יהודה ומוזיאון המדע.', 'יום ירושלמי רגוע: טיילת האס עם הנוף אל העיר העתיקה, שוק מחנה יהודה לארוחה, ומוזיאון המדע בלומפילד למי שרוצה פעילות לילדים.', '', '{}'::text[], array['נוף','אוכל','משפחות']::text[], (select id from demo.profiles where name='Yosef Nachmany'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','ירושלים בקצב איטי')
  where not exists (select 1 from demo.trips where name='ירושלים בקצב איטי')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'trail', 'טיילת האס בירושלים', null), (1, 'place', 'שוק מחנה יהודה', 'car'), (2, 'place', 'מוזיאון המדע בלומפילד', 'car')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'תל אביב האורבנית', 'מדיזנגוף לשווקים ולנווה צדק.', 'טיול עירוני בתל אביב: כיכר דיזנגוף, שוק לוינסקי, שוק הכרמל ונווה צדק. הרבה אוכל, צבעים וצילום, והכול מתאים להליכה.', '', '{}'::text[], array['תרבות','אוכל','צילום']::text[], (select id from demo.profiles where name='Daniel Lev'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','תל אביב האורבנית')
  where not exists (select 1 from demo.trips where name='תל אביב האורבנית')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'כיכר דיזנגוף', null), (1, 'place', 'שוק לוינסקי', 'car'), (2, 'place', 'שוק הכרמל', 'walking'), (3, 'place', 'נווה צדק', 'walking')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'הרצליה על המים', 'מרינה, צוק וחורבות צלבניות בהרצליה.', 'יום בהרצליה: טיילת במרינה, ואחר כך פארק אפולוניה עם השרידים העתיקים והנוף לים. אפשר להמשיך לגן לאומי קיסריה לסיום.', '', '{}'::text[], array['ים','ארכיאולוגיה','משפחות']::text[], (select id from demo.profiles where name='Daniel Lev'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','הרצליה על המים')
  where not exists (select 1 from demo.trips where name='הרצליה על המים')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'מרינה הרצליה', null), (1, 'place', 'פארק אפולוניה', 'car'), (2, 'place', 'גן לאומי קיסריה', 'car')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'אמנות ותרבות בתל אביב', 'מוזיאון, שכונה היסטורית ועיר עתיקה.', 'יום תרבות בתל אביב: מוזיאון תל אביב לאמנות, נווה צדק ויפו העתיקה. מסלול רגוע למי שאוהב אמנות והיסטוריה.', '', '{}'::text[], array['אמנות','תרבות','היסטוריה']::text[], (select id from demo.profiles where name='Daniel Lev'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','אמנות ותרבות בתל אביב')
  where not exists (select 1 from demo.trips where name='אמנות ותרבות בתל אביב')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'מוזיאון תל אביב', null), (1, 'place', 'נווה צדק', 'car'), (2, 'place', 'יפו העתיקה', 'walking')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'יום ספורטיבי בתל אביב', 'פארק, נמל וטיילת: יום בחוץ.', 'יום פעיל בתל אביב: פארק הירקון להליכה או לאופניים, נמל תל אביב לקפה, וטיילת החוף לסיום. כמעט הכול חינם.', '', '{}'::text[], array['טבע','ים','חינם']::text[], (select id from demo.profiles where name='Daniel Lev'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','יום ספורטיבי בתל אביב')
  where not exists (select 1 from demo.trips where name='יום ספורטיבי בתל אביב')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'פארק הירקון', null), (1, 'place', 'נמל תל אביב', 'car'), (2, 'trail', 'טיילת חוף תל אביב', 'walking')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'חולה וגולן: מים ועופות', 'אגמון החולה, תל דן ומפל הבניאס.', 'טיול בצפון הרחוק לאוהבי טבע: אגמון החולה עם הציפורים, תל דן עם המים הזורמים ושביל בניאס עם המפל. מתאים למשפחות.', '', '{}'::text[], array['טבע','מים','משפחות','נוף']::text[], (select id from demo.profiles where name='Chana Ben David'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','חולה וגולן: מים ועופות')
  where not exists (select 1 from demo.trips where name='חולה וגולן: מים ועופות')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'אגמון החולה', null), (1, 'place', 'תל דן', 'car'), (2, 'trail', 'שביל הגולן — בניאס', 'car')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'גולן היסטורי', 'קצרין, גמלא ומצודת נמרוד.', 'טיול בגולן בין אתרי עבר: הפארק הארכיאולוגי קצרין, שמורת גמלא עם המפל, ומצודת נמרוד עם הנוף. כדאי להתחיל מוקדם.', '', '{}'::text[], array['היסטוריה','ארכיאולוגיה','נוף']::text[], (select id from demo.profiles where name='Chana Ben David'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','גולן היסטורי')
  where not exists (select 1 from demo.trips where name='גולן היסטורי')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'כפר קצרין העתיק', null), (1, 'place', 'שמורת גמלא', 'car'), (2, 'trail', 'נחל גמלא — מסלול המפל', 'walking'), (3, 'place', 'מצודת נמרוד', 'car')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'הגליל התחתון והעמק', 'הר תבור, בית שערים ובית שאן.', 'טיול בגליל התחתון: הר תבור עם הנוף לעמק, בית שערים עם מערות הקבורה, ובית שאן העתיקה עם התיאטרון הרומי.', '', '{}'::text[], array['נוף','ארכיאולוגיה','היסטוריה']::text[], (select id from demo.profiles where name='Chana Ben David'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','הגליל התחתון והעמק')
  where not exists (select 1 from demo.trips where name='הגליל התחתון והעמק')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'הר תבור', null), (1, 'place', 'בית שערים', 'car'), (2, 'place', 'בית שאן העתיקה', 'car')) as v(ord, typ, nm, mode);

-- Derive totals, region, difficulty and photos from the stations
with st as (
  select s.trip_id, s.order_index,
    coalesce(p.avg_duration_minutes, tr.duration_minutes, 0) as dur, coalesce(tr.length_km, 0) as km,
    coalesce(p.estimated_price, tr.estimated_price, 0) as price, coalesce(p.accessibility, tr.accessibility, 3) as acc,
    coalesce(p.region, tr.region) as region, tr.difficulty as diff, coalesce(p.image_url, tr.image_url) as image
  from demo.trip_stations s left join demo.places p on p.id = s.place_id left join demo.trails tr on tr.id = s.trail_id
), agg as (
  select trip_id, sum(dur) as dur, sum(km) as km, sum(price) as price, min(acc) as acc, count(*) as n,
    (array_agg(region order by order_index))[1] as region,
    case when bool_or(diff = 'hard') then 'hard' when bool_or(diff = 'medium') then 'medium' else 'easy' end as diff,
    (array_agg(image order by order_index))[1] as main_image,
    (array(select distinct on (i) i from unnest(array_agg(image order by order_index)) i limit 4)) as gallery
  from st group by trip_id
)
update demo.trips t set region_id = null, total_duration_minutes = a.dur, total_distance_km = a.km, estimated_price = a.price,
  accessibility = a.acc, station_count = a.n, region = a.region, difficulty = a.diff::difficulty,
  main_image = a.main_image, gallery_images = a.gallery
from agg a where t.id = a.trip_id and t.name in ('ירושלים הקדושה: הר הזיתים והעיר העתיקה','זיכרון ופסגות ירושלים','ירושלים בקצב איטי','תל אביב האורבנית','הרצליה על המים','אמנות ותרבות בתל אביב','יום ספורטיבי בתל אביב','חולה וגולן: מים ועופות','גולן היסטורי','הגליל התחתון והעמק');

commit;
