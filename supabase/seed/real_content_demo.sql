-- TravelIsrael: real Israeli photos (Wikimedia Commons) and new demo content, schema demo.
-- Generated; safe to review. Run inside a transaction.
begin;

-- 1. Replace stock photos with verified Wikimedia Commons photos of the actual location
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Landscape_in_Timna_Park_%2812%29.JPG/1280px-Landscape_in_Timna_Park_%2812%29.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='פארק תמנע';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Eilat_Dolphin_Reef_%283%29.jpg/1280px-Eilat_Dolphin_Reef_%283%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='ריף הדולפינים';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/133077_achziv_beach_-_natural_coves_PikiWiki_Israel.jpg/1280px-133077_achziv_beach_-_natural_coves_PikiWiki_Israel.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='חוף אכזיב';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Rosh_HaNikra_grottoes_%281%29.jpg/1280px-Rosh_HaNikra_grottoes_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='ראש הנקרה';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/125695_acre-old_city_PikiWiki_Israel.jpg/1280px-125695_acre-old_city_PikiWiki_Israel.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='שוק העיר העתיקה — עכו';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Ashkelon_National_Park_%285616112114%29.jpg/1280px-Ashkelon_National_Park_%285616112114%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='גן לאומי אשקלון';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/ISR-2015-Caesarea-Caesarea_Maritima-Herodian_Amphitheater_01.jpg/1280px-ISR-2015-Caesarea-Caesarea_Maritima-Herodian_Amphitheater_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='גן לאומי קיסריה';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/PikiWiki_Israel_39704_Gaash_beach.JPG/1280px-PikiWiki_Israel_39704_Gaash_beach.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='חוף געש';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Habonim-Dor_Beach.jpg/1280px-Habonim-Dor_Beach.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='חוף הבונים';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/NahalAlexander.jpg/1280px-NahalAlexander.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='נחל אלכסנדר';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/ISR-2016-Masada-Roman_fortress_01.jpg/1280px-ISR-2016-Masada-Roman_fortress_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='מצדה';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Ein_Gedi_nature_reserve_%2820%29_%285364688023%29.jpg/1280px-Ein_Gedi_nature_reserve_%2820%29_%285364688023%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='שמורת עין גדי';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/BloomfieldScienceMuseumJerusalemJan052023_01.jpg/1280px-BloomfieldScienceMuseumJerusalemJan052023_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='מוזיאון המדע בלומפילד';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Israel_Museum%2C_Jerusalem_P1110162_%285887775723%29.jpg/1280px-Israel_Museum%2C_Jerusalem_P1110162_%285887775723%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='מוזיאון ישראל';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/Mahane_Yehuda_Market_%285101386538%29.jpg/1280px-Mahane_Yehuda_Market_%285101386538%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='שוק מחנה יהודה';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Bahai_Garden_in_Haifa_Israel.jpg/1280px-Bahai_Garden_in_Haifa_Israel.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='גני הבהאיים';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Old_Jaffa%2C_August_2014_11.jpg/1280px-Old_Jaffa%2C_August_2014_11.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='יפו העתיקה';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Tel_Aviv_Museum_of_Art_-_Israel%2C_March_2024_11.jpg/1280px-Tel_Aviv_Museum_of_Art_-_Israel%2C_March_2024_11.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='מוזיאון תל אביב';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Avshalom_stalactite_cave_%2831%29.jpg/1280px-Avshalom_stalactite_cave_%2831%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='מערת הנטיפים';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/OLD_JAFFA_PORT.jpg/1280px-OLD_JAFFA_PORT.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='נמל יפו';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Israel_Tel_Aviv_-_Azrieli_towers.jpg/1280px-Israel_Tel_Aviv_-_Azrieli_towers.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='קניון עזריאלי';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Carmel_Market%2C_2019_%2807%29.jpg/1280px-Carmel_Market%2C_2019_%2807%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='שוק הכרמל';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Beit_Guvrin_National_Park_%2825287787596%29.jpg/1280px-Beit_Guvrin_National_Park_%2825287787596%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='גן לאומי בית גוברין';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg/1280px-ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='מכתש רמון';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/143796_the_ancient_theater_of_beit_shean_PikiWiki_Israel.jpg/1280px-143796_the_ancient_theater_of_beit_shean_PikiWiki_Israel.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='בית שאן העתיקה';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Nimrod_castle_%2829%29.jpg/1280px-Nimrod_castle_%2829%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='מצודת נמרוד';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/PikiWiki_Israel_78315_tel_afek_national_park.jpg/1280px-PikiWiki_Israel_78315_tel_afek_national_park.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='שמורת טבע עין אפק';
update demo.places set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Lookout_and_Visitors_Center_in_Mitzpe_Ramon_%2840691%29.jpg/1280px-Lookout_and_Visitors_Center_in_Mitzpe_Ramon_%2840691%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='מצפה כוכבים רמון';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Timna_Valley%2C_Solomon%27s_Pillars.jpg/1280px-Timna_Valley%2C_Solomon%27s_Pillars.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='מסלול נחל תמנע';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Kziv_stream.JPG/1280px-Kziv_stream.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='נחל כזיב';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Amud_stream.JPG/1280px-Amud_stream.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='נחל עמוד';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Ein-Prat-to-Ein-Mabua-690.jpg/1280px-Ein-Prat-to-Ein-Mabua-690.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='נחל פרת';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Tel_Aviv_Promenade_panoramics.jpg/1280px-Tel_Aviv_Promenade_panoramics.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='טיילת חוף תל אביב';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Israel_Ben_Shemen_Forest_%288115567667%29.jpg/1280px-Israel_Ben_Shemen_Forest_%288115567667%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='יער בן שמן';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Ayalon_River_in_Lod_December_2020_%281%29.jpg/1280px-Ayalon_River_in_Lod_December_2020_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='נחל איילון';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Nahal-besor-suspension-bridge-b.jpg/1280px-Nahal-besor-suspension-bridge-b.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='נחל הבשור באופניים';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Bridge_at_Makhtesh_Ramon_%2840582%29.jpg/1280px-Bridge_at_Makhtesh_Ramon_%2840582%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='שביל הפרסה — מכתש רמון';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Mount-Arbel-189.jpg/1280px-Mount-Arbel-189.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='הר ארבל';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Northern_slope_of_Mount_Meron.jpg/1280px-Northern_slope_of_Mount_Meron.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='מסלול הר מירון';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Zavitan_River_brook.jpg/1280px-Zavitan_River_brook.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='נחל זויתן';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/%D7%A0%D7%97%D7%9C_%D7%99%D7%94%D7%95%D7%93%D7%99%D7%99%D7%94-%D7%96%D7%95%D7%95%D7%99%D7%AA%D7%9F2.jpg/1280px-%D7%A0%D7%97%D7%9C_%D7%99%D7%94%D7%95%D7%93%D7%99%D7%99%D7%94-%D7%96%D7%95%D7%95%D7%99%D7%AA%D7%9F2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='נחל יהודייה';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Mount_Meron_-_Al-Jarmaq_-_Israel_National_Trail_09.jpg/1280px-Mount_Meron_-_Al-Jarmaq_-_Israel_National_Trail_09.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='שביל ישראל — קטע הגליל';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Ein_Gedi_nature_reserve_%2815%29_%285365296044%29.jpg/1280px-Ein_Gedi_nature_reserve_%2815%29_%285365296044%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='נחל דוד';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Timna_Valley%2C_Solomon%27s_Pillars.jpg/1280px-Timna_Valley%2C_Solomon%27s_Pillars.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='מסלול נחל תמנע';
update demo.trails set image_url='https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/The_Banias_Waterfall_%D7%9E%D7%A4%D7%9C%D7%99_%D7%94%D7%91%D7%A0%D7%99%D7%90%D7%A1.jpg/1280px-The_Banias_Waterfall_%D7%9E%D7%A4%D7%9C%D7%99_%D7%94%D7%91%D7%A0%D7%99%D7%90%D7%A1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail' where name='שביל הגולן — בניאס';

-- 2. New places
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'הכותל המערבי', 'אתר התפילה וההיסטוריה המרכזי בעיר העתיקה, פתוח לכל מבקר.', 'הכותל המערבי הוא קטע מקיר התמך של הר הבית, ואחד האתרים המרכזיים בעיר העתיקה בירושלים. הרחבה פתוחה לביקור ולתפילה, ובכניסה יש להקפיד על לבוש צנוע. כדאי לשלב את הביקור עם סיור ברובע היהודי ובעיר העתיקה.', 'העיר העתיקה, ירושלים', 31.7767, 35.2345, 'ירושלים', 'אתר מורשת', 4, array['דת','היסטוריה','תרבות','חינם']::text[], 60, 0, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Western_wall_and_its_square%2C_jerusalem.jpg/1280px-Western_wall_and_its_square%2C_jerusalem.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='Sara Cohen'), 'approved', public.next_unique_slug('demo','places','הכותל המערבי')
where not exists (select 1 from demo.places where name='הכותל המערבי');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'מגדל דוד', 'מוזיאון לתולדות ירושלים בתוך המצודה העתיקה ליד שער יפו.', 'מגדל דוד הוא מצודה עתיקה סמוך לשער יפו, ובתוכה פועל מוזיאון שמציג את תולדות ירושלים לאורך התקופות. מהחומות ומראש המגדל נשקפת תצפית יפה על העיר העתיקה והעיר החדשה. מחיר הכניסה משוער.', 'שער יפו, העיר העתיקה, ירושלים', 31.7767, 35.2278, 'ירושלים', 'מוזיאון', 3, array['היסטוריה','תרבות','נוף']::text[], 120, 40, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Jerusalem-Tower-of-David-0568.jpg/1280px-Jerusalem-Tower-of-David-0568.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='Admin Admin'), 'approved', public.next_unique_slug('demo','places','מגדל דוד')
where not exists (select 1 from demo.places where name='מגדל דוד');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'יד ושם', 'המרכז העולמי להנצחת השואה, בהר הזיכרון.', 'יד ושם הוא מרכז ההנצחה הלאומי לשואה, בהר הזיכרון בירושלים. המתחם כולל מוזיאון היסטורי, אולם השמות, שדרת חסידי אומות העולם ואנדרטאות. הכניסה חופשית, ומומלץ להקצות זמן מספיק לביקור.', 'הר הזיכרון, ירושלים', 31.7746, 35.1757, 'ירושלים', 'מוזיאון', 5, array['היסטוריה','תרבות','חינם']::text[], 180, 0, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Yad_Vashem_View.jpg/1280px-Yad_Vashem_View.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='josh'), 'approved', public.next_unique_slug('demo','places','יד ושם')
where not exists (select 1 from demo.places where name='יד ושם');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'העיר העתיקה בצפת', 'סמטאות אבן, בתי כנסת ורובע האמנים בעיר ההררית בגליל העליון.', 'צפת היא עיר הררית בגליל העליון, והעיר העתיקה שלה ידועה בסמטאות האבן, בבתי הכנסת העתיקים וברובע האמנים. הטיילות בין הסמטאות עולות ויורדות, ולכן הנגישות מוגבלת. מקום טוב לצילום ולהליכה רגועה.', 'העיר העתיקה, צפת', 32.9646, 35.496, 'גליל', 'עיר עתיקה', 2, array['היסטוריה','תרבות','צילום','חינם']::text[], 150, 0, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Safed_The_Old_City_and_the_Alleys_Avney_Moreshet_12691ccf.jpg/1280px-Safed_The_Old_City_and_the_Alleys_Avney_Moreshet_12691ccf.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='Sara Cohen'), 'approved', public.next_unique_slug('demo','places','העיר העתיקה בצפת')
where not exists (select 1 from demo.places where name='העיר העתיקה בצפת');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'תל דן', 'שמורת טבע עם נחלי מים זורמים, צל ושרידי העיר העתיקה דן.', 'שמורת תל דן נמצאת בצפון הארץ ומוזנת ממעיינות נחל הדן. בשמורה שבילים מוצלים לאורך מים זורמים, ובתוכה שרידי העיר הכנענית והישראלית דן. מתאימה למשפחות ולמטיילים שרוצים טבע ירוק. מחיר הכניסה משוער.', 'שמורת תל דן, הגליל העליון', 33.2487, 35.6525, 'צפון', 'פארק', 3, array['טבע','מים','משפחות','ארכיאולוגיה']::text[], 180, 30, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/119511_nahal_dan-tel_el_kadi_reserve_PikiWiki_Israel.jpg/1280px-119511_nahal_dan-tel_el_kadi_reserve_PikiWiki_Israel.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='Admin Admin'), 'approved', public.next_unique_slug('demo','places','תל דן')
where not exists (select 1 from demo.places where name='תל דן');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'נמל תל אביב', 'טיילת על הים עם חנויות ובתי קפה בצפון העיר.', 'נמל תל אביב הוא אזור טיילת על שפת הים בצפון העיר, עם מדרחוב, בתי קפה, חנויות ומקום לשבת ליד המים. הגישה נוחה והמקום מתאים לטיול רגוע עם משפחה או חברים, בעיקר לקראת שקיעה.', 'נמל תל אביב, תל אביב-יפו', 32.0975, 34.774, 'מרכז', 'נמל', 5, array['ים','אוכל','משפחות','חינם']::text[], 120, 0, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Tel_Aviv_Port_Lowshot.jpg/1280px-Tel_Aviv_Port_Lowshot.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='josh'), 'approved', public.next_unique_slug('demo','places','נמל תל אביב')
where not exists (select 1 from demo.places where name='נמל תל אביב');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'נווה צדק', 'שכונה היסטורית עם בתים שמורים, גלריות ובתי קפה.', 'נווה צדק היא השכונה היהודית הראשונה שהוקמה מחוץ ליפו, בשנת 1887. כיום היא מוכרת בבתיה הנמוכים והשמורים, בגלריות ובבתי הקפה, ואפשר לטייל בה ברגל בנחת.', 'שכונת נווה צדק, תל אביב-יפו', 32.0617, 34.7676, 'מרכז', 'אתר מורשת', 4, array['תרבות','אוכל','אמנות','צילום','חינם']::text[], 120, 0, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Neve_Tzedek_Tel_Aviv_%282%29.jpg/1280px-Neve_Tzedek_Tel_Aviv_%282%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='Sara Cohen'), 'approved', public.next_unique_slug('demo','places','נווה צדק')
where not exists (select 1 from demo.places where name='נווה צדק');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'טבריה והכנרת', 'העיר על שפת הכנרת, עם טיילת, שוק ואתרים עתיקים.', 'טבריה שוכנת על שפת הכנרת, האגם הגדול בישראל. בעיר טיילת לאורך המים, מסעדות ושוק, וכן אתרים היסטוריים ודתיים. אפשר לשלב הליכה על הטיילת עם שייט או רחצה בחופים הסמוכים.', 'טיילת טבריה, טבריה', 32.7922, 35.5312, 'גליל', 'אחר', 4, array['נוף','מים','היסטוריה','משפחות','חינם']::text[], 150, 0, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Sea_of_Galilee_and_Tiberias.jpg/1280px-Sea_of_Galilee_and_Tiberias.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='Admin Admin'), 'approved', public.next_unique_slug('demo','places','טבריה והכנרת')
where not exists (select 1 from demo.places where name='טבריה והכנרת');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'תל מגידו', 'תל עתיק עם שכבות יישוב לאורך אלפי שנים, אתר מורשת עולמית.', 'תל מגידו הוא תל ארכיאולוגי בעמק יזרעאל ובו שכבות יישוב מתקופות רבות. האתר הוכר כאתר מורשת עולמית של אונסק"ו. אפשר לראות שרידי שערים, מקדשים ומערכת מים, ולהתרשם מהנוף של העמק. מחיר הכניסה משוער.', 'גן לאומי מגידו, עמק יזרעאל', 32.5851, 35.1844, 'צפון', 'גן לאומי', 3, array['ארכיאולוגיה','היסטוריה','נוף']::text[], 120, 30, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/20191028_120303_Tel_Megiddo_Israel_anagoria.JPG/1280px-20191028_120303_Tel_Megiddo_Israel_anagoria.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='josh'), 'approved', public.next_unique_slug('demo','places','תל מגידו')
where not exists (select 1 from demo.places where name='תל מגידו');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'המושבה הגרמנית בחיפה', 'שכונה היסטורית עם בתים ישנים ושדרה ירוקה למרגלות הגנים הבהאיים.', 'המושבה הגרמנית בחיפה הוקמה בשנת 1868 על ידי הטמפלרים. היום זו שדרה מטופחת עם בתים היסטוריים, מסעדות ובתי קפה, סמוך לגנים הבהאיים. הטיול בה מתאים לכל המשפחה והנגישות טובה.', 'שדרות בן גוריון, חיפה', 32.8127, 34.9871, 'כרמל', 'אתר מורשת', 5, array['היסטוריה','אוכל','תרבות','צילום','חינם']::text[], 120, 0, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Haifa%2C_German_Colony_%28001%29.JPG/1280px-Haifa%2C_German_Colony_%28001%29.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='Sara Cohen'), 'approved', public.next_unique_slug('demo','places','המושבה הגרמנית בחיפה')
where not exists (select 1 from demo.places where name='המושבה הגרמנית בחיפה');
insert into demo.places (name, short_description, full_description, address, lat, lng, region, place_type, accessibility, tags, avg_duration_minutes, estimated_price, image_url, created_by, status, slug)
select 'חוף עין בוקק', 'חוף ציבורי לרחצה בים המלח, עם מקלחות ומתקנים.', 'חוף עין בוקק הוא אחד מחופי הרחצה הציבוריים בים המלח, עם מדרגות כניסה, מקלחות ומתקנים. הצפה במים המלוחים היא חוויה מיוחדת. כדאי להימנע ממגע המים בעיניים ולשתות הרבה מים בקיץ.', 'עין בוקק, ים המלח', 31.2, 35.3636, 'ים המלח', 'חוף', 4, array['ים','נוף','חינם','משפחות']::text[], 150, 0, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/20211122_Beach_at_the_Dead_Sea%2C_Ein_Bokek%2C_Israel_anagoria.jpg/1280px-20211122_Beach_at_the_Dead_Sea%2C_Ein_Bokek%2C_Israel_anagoria.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='Admin Admin'), 'approved', public.next_unique_slug('demo','places','חוף עין בוקק')
where not exists (select 1 from demo.places where name='חוף עין בוקק');

-- 3. New trails
insert into demo.trails (name, short_description, full_description, region, trail_type, length_km, duration_minutes, difficulty, accessibility, tags, estimated_price, start_lat, start_lng, end_lat, end_lng, waypoints, image_url, created_by, status, slug)
select 'נחל עין עבדת', 'קניון עם בריכות מים, מפלון ופסי נוף בלב הנגב.', 'מסלול הליכה בקניון עין עבדת בנגב, לאורך נחל עם בריכות מים ומצוקי קניון. חלק מהמסלול כולל סולמות וקטעים תלולים, ולכן נדרשת כושר בינוני. מומלץ להגיע בבוקר ולהצטייד במים וכובע. הקואורדינטות והמרחק משוערים.', 'נגב', 'הליכה', 4.5, 180, 'medium'::difficulty, 2, array['טבע','מים','הליכה','נוף']::text[], 28, 30.7935, 34.768, 30.8113, 34.7782, '[{"name":"כניסה תחתונה","lat":30.7935,"lng":34.768},{"name":"בריכות המים","lat":30.7990,"lng":34.7710}]'::jsonb, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Israel-2013-Ein_Avdat_02.jpg/1280px-Israel-2013-Ein_Avdat_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='Admin Admin'), 'approved', public.next_unique_slug('demo','trails','נחל עין עבדת')
where not exists (select 1 from demo.trails where name='נחל עין עבדת');
insert into demo.trails (name, short_description, full_description, region, trail_type, length_km, duration_minutes, difficulty, accessibility, tags, estimated_price, start_lat, start_lng, end_lat, end_lng, waypoints, image_url, created_by, status, slug)
select 'טיילת האס בירושלים', 'טיילת נוחה עם תצפית פנורמית על העיר העתיקה והר הבית.', 'טיילת האס (טיילת שרובר) היא טיילת נוחה בדרום ירושלים עם תצפית פנורמית על העיר העתיקה. המסלול שטוח ומתאים לעגלות ולכיסאות גלגלים, והשקיעה כאן יפה במיוחד. המרחק משוער.', 'ירושלים', 'הליכה', 2, 60, 'easy'::difficulty, 5, array['נוף','צילום','משפחות','חינם']::text[], 0, 31.7478, 35.2255, 31.7428, 35.2318, '[{"name":"תצפית על העיר העתיקה","lat":31.7460,"lng":35.2285}]'::jsonb, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/South_Jerusalem_Armon_Hanatziv_Haas_Promenade.jpg/1280px-South_Jerusalem_Armon_Hanatziv_Haas_Promenade.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', (select id from demo.profiles where name='josh'), 'approved', public.next_unique_slug('demo','trails','טיילת האס בירושלים')
where not exists (select 1 from demo.trails where name='טיילת האס בירושלים');

-- 4. New trips (approved) with stations
with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'ירושלים העתיקה ברגל', 'מהכותל אל מגדל דוד ואל השוק: יום בלב ירושלים.', 'יום הליכה בירושלים: מתחילים בכותל המערבי, ממשיכים למגדל דוד ומסיימים בשוק מחנה יהודה לארוחה ולאווירה. מתאים למי שאוהב היסטוריה ושווקים.', '', '{}'::text[], array['היסטוריה','דת','תרבות','אוכל']::text[], (select id from demo.profiles where name='Admin Admin'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','ירושלים העתיקה ברגל')
  where not exists (select 1 from demo.trips where name='ירושלים העתיקה ברגל')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'הכותל המערבי', null), (1, 'place', 'מגדל דוד', 'walking'), (2, 'place', 'שוק מחנה יהודה', 'walking')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'ירושלים: זיכרון, מדע ותרבות', 'יד ושם, מוזיאון ישראל ומוזיאון המדע ביום אחד.', 'יום מוזיאונים בירושלים: יד ושם, מוזיאון ישראל ומוזיאון המדע בלומפילד. מתאים לימים חמים או גשומים ולמשפחות עם ילדים גדולים.', '', '{}'::text[], array['תרבות','היסטוריה','משפחות']::text[], (select id from demo.profiles where name='josh'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','ירושלים: זיכרון, מדע ותרבות')
  where not exists (select 1 from demo.trips where name='ירושלים: זיכרון, מדע ותרבות')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'יד ושם', null), (1, 'place', 'מוזיאון ישראל', 'car'), (2, 'place', 'מוזיאון המדע בלומפילד', 'car')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'תל אביב מהנמל ליפו', 'טיילת, נווה צדק ויפו העתיקה לאורך חוף הים.', 'טיול נוח לאורך חוף תל אביב: מנמל תל אביב ברגל על הטיילת, דרך נווה צדק ועד יפו העתיקה. הרבה בתי קפה, ים ונוף, והכול נגיש.', '', '{}'::text[], array['ים','אוכל','תרבות','משפחות']::text[], (select id from demo.profiles where name='Sara Cohen'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','תל אביב מהנמל ליפו')
  where not exists (select 1 from demo.trips where name='תל אביב מהנמל ליפו')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'נמל תל אביב', null), (1, 'trail', 'טיילת חוף תל אביב', 'walking'), (2, 'place', 'נווה צדק', 'walking'), (3, 'place', 'יפו העתיקה', 'walking')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'צפון רחוק: תל דן, בניאס ונמרוד', 'מים זורמים, מפל ומצודה בצפון הרחוק.', 'טיול בצפון הרחוק: תל דן עם נחלי המים, שביל בניאס ומצודת נמרוד עם הנוף לחרמון. מתאים לקיץ ולמשפחות שאוהבות טבע.', '', '{}'::text[], array['טבע','מים','היסטוריה','משפחות']::text[], (select id from demo.profiles where name='Admin Admin'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','צפון רחוק: תל דן, בניאס ונמרוד')
  where not exists (select 1 from demo.trips where name='צפון רחוק: תל דן, בניאס ונמרוד')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'תל דן', null), (1, 'trail', 'שביל הגולן — בניאס', 'car'), (2, 'place', 'מצודת נמרוד', 'car')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'כנרת ועמק יזרעאל', 'טבריה, בית שאן ומגידו: ארכיאולוגיה ונוף.', 'מסלול נסיעה בין הכנרת לעמקים: טבריה על שפת האגם, בית שאן העתיקה עם התיאטרון הרומי ותל מגידו. למחפשי ארכיאולוגיה ונוף.', '', '{}'::text[], array['נוף','ארכיאולוגיה','היסטוריה']::text[], (select id from demo.profiles where name='josh'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','כנרת ועמק יזרעאל')
  where not exists (select 1 from demo.trips where name='כנרת ועמק יזרעאל')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'טבריה והכנרת', null), (1, 'place', 'בית שאן העתיקה', 'car'), (2, 'place', 'תל מגידו', 'car')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'עכו, אכזיב וראש הנקרה', 'מהעיר העתיקה בעכו אל החוף והגרוטות בראש הנקרה.', 'טיול בגליל המערבי: שוק העיר העתיקה בעכו, חוף אכזיב וראש הנקרה עם המערות הימיות. שילוב של היסטוריה, ים ונוף.', '', '{}'::text[], array['ים','היסטוריה','נוף']::text[], (select id from demo.profiles where name='Sara Cohen'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','עכו, אכזיב וראש הנקרה')
  where not exists (select 1 from demo.trips where name='עכו, אכזיב וראש הנקרה')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'שוק העיר העתיקה — עכו', null), (1, 'place', 'חוף אכזיב', 'car'), (2, 'place', 'ראש הנקרה', 'car')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'חיפה והכרמל בטעם אחר', 'גנים בהאיים ומושבה גרמנית: חיפה ביום רגוע.', 'יום בחיפה: הגנים הבהאיים עם הנוף אל הים והמפרץ, והמושבה הגרמנית עם הבתים ההיסטוריים ובתי הקפה. נגיש ונוח לכל המשפחה.', '', '{}'::text[], array['תרבות','אוכל','צילום','היסטוריה']::text[], (select id from demo.profiles where name='Admin Admin'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','חיפה והכרמל בטעם אחר')
  where not exists (select 1 from demo.trips where name='חיפה והכרמל בטעם אחר')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'גני הבהאיים', null), (1, 'place', 'המושבה הגרמנית בחיפה', 'car')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'מדבר יהודה והמלח', 'מצדה, עין גדי וצפייה בים המלח.', 'טיול למדבר יהודה: מצדה עם הנוף למדבר, שמורת עין גדי עם המעיינות והחי, וסיום בחוף עין בוקק בים המלח. כדאי לצאת מוקדם ולהצטייד במים.', '', '{}'::text[], array['מדבר','ים','נוף','היסטוריה']::text[], (select id from demo.profiles where name='josh'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','מדבר יהודה והמלח')
  where not exists (select 1 from demo.trips where name='מדבר יהודה והמלח')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'מצדה', null), (1, 'place', 'שמורת עין גדי', 'car'), (2, 'place', 'חוף עין בוקק', 'car')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'נגב: מכתש רמון ועין עבדת', 'מכתש מרשים וקניון עם מים בלב הנגב.', 'יום בנגב: מכתש רמון עם התצפיות, וקניון עין עבדת עם הבריכות. מסלול למי שאוהב מדבר ונוף. הקניון דורש כושר בינוני.', '', '{}'::text[], array['מדבר','טבע','הליכה','נוף']::text[], (select id from demo.profiles where name='Sara Cohen'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','נגב: מכתש רמון ועין עבדת')
  where not exists (select 1 from demo.trips where name='נגב: מכתש רמון ועין עבדת')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'מכתש רמון', null), (1, 'trail', 'נחל עין עבדת', 'car')) as v(ord, typ, nm, mode);

with t as (
  insert into demo.trips (name, short_description, full_description, main_image, gallery_images, tags, created_by, status, region, accessibility, slug)
  select 'קיסריה ודור: ארכיאולוגיה וים', 'אמפיתיאטרון עתיק וחוף שמורה בחוף הכרמל.', 'יום בחוף הכרמל: גן לאומי קיסריה עם האמפיתיאטרון ההרודיאני, ואחריו חוף דור-הבונים לרחצה ולמנוחה. נגיש ומתאים למשפחות.', '', '{}'::text[], array['ארכיאולוגיה','ים','משפחות']::text[], (select id from demo.profiles where name='Admin Admin'), 'approved', 'מרכז', 3, public.next_unique_slug('demo','trips','קיסריה ודור: ארכיאולוגיה וים')
  where not exists (select 1 from demo.trips where name='קיסריה ודור: ארכיאולוגיה וים')
  returning id
)
insert into demo.trip_stations (trip_id, order_index, station_type, place_id, trail_id, travel_mode)
select t.id, v.ord, v.typ::station_type,
  (select id from demo.places where name=v.nm and v.typ='place'),
  (select id from demo.trails where name=v.nm and v.typ='trail'),
  v.mode::travel_mode
from t, (values (0, 'place', 'גן לאומי קיסריה', null), (1, 'place', 'חוף הבונים', 'car')) as v(ord, typ, nm, mode);

-- 5. Derive totals, region, difficulty and photos from each trip's stations
with st as (
  select s.trip_id, s.order_index,
    coalesce(p.name, tr.name) as nm,
    coalesce(p.avg_duration_minutes, tr.duration_minutes, 0) as dur,
    coalesce(tr.length_km, 0) as km,
    coalesce(p.estimated_price, tr.estimated_price, 0) as price,
    coalesce(p.accessibility, tr.accessibility, 3) as acc,
    coalesce(p.region, tr.region) as region,
    tr.difficulty as diff,
    coalesce(p.image_url, tr.image_url) as image
  from demo.trip_stations s
  left join demo.places p on p.id = s.place_id
  left join demo.trails tr on tr.id = s.trail_id
), agg as (
  select trip_id,
    sum(dur) as dur, sum(km) as km, sum(price) as price, min(acc) as acc, count(*) as n,
    (array_agg(region order by order_index))[1] as region,
    case when bool_or(diff = 'hard') then 'hard' when bool_or(diff = 'medium') then 'medium' else 'easy' end as diff,
    (array_agg(image order by order_index))[1] as main_image,
    (array(select distinct on (i) i from unnest(array_agg(image order by order_index)) i limit 4)) as gallery
  from st group by trip_id
)
update demo.trips t set
  total_duration_minutes = a.dur, total_distance_km = a.km, estimated_price = a.price,
  accessibility = a.acc, station_count = a.n, region = a.region, difficulty = a.diff::difficulty,
  main_image = a.main_image, gallery_images = a.gallery
from agg a
where t.id = a.trip_id and t.name in ('ירושלים העתיקה ברגל','ירושלים: זיכרון, מדע ותרבות','תל אביב מהנמל ליפו','צפון רחוק: תל דן, בניאס ונמרוד','כנרת ועמק יזרעאל','עכו, אכזיב וראש הנקרה','חיפה והכרמל בטעם אחר','מדבר יהודה והמלח','נגב: מכתש רמון ועין עבדת','קיסריה ודור: ארכיאולוגיה וים');

-- Existing trips: only refresh the cover photo/gallery from their first stations
with st as (
  select s.trip_id, s.order_index, coalesce(p.image_url, tr.image_url) as image
  from demo.trip_stations s
  left join demo.places p on p.id = s.place_id
  left join demo.trails tr on tr.id = s.trail_id
), agg as (
  select trip_id, (array_agg(image order by order_index))[1] as main_image
  from st group by trip_id
)
update demo.trips t set main_image = a.main_image from agg a
where t.id = a.trip_id and t.name not in ('ירושלים העתיקה ברגל','ירושלים: זיכרון, מדע ותרבות','תל אביב מהנמל ליפו','צפון רחוק: תל דן, בניאס ונמרוד','כנרת ועמק יזרעאל','עכו, אכזיב וראש הנקרה','חיפה והכרמל בטעם אחר','מדבר יהודה והמלח','נגב: מכתש רמון ועין עבדת','קיסריה ודור: ארכיאולוגיה וים') and a.main_image like 'https://upload.wikimedia.org/%';

commit;
