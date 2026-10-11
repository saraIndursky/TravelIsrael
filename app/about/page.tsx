import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Compass,
  Heart,
  Map,
  MapPin,
  Mountain,
  Route,
  Search,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/layout/static-page";
import { getHomeStatsServer, type HomeStats } from "@/lib/data/server/stats";

export const metadata: Metadata = {
  title: "אודות — TravelIsrael",
  description: "הכירו את TravelIsrael: פלטפורמה לגילוי, תכנון ושיתוף טיולים בישראל.",
};

const HERO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg/1920px-ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg";

const features = [
  { icon: Search, title: "חיפוש וסינון מתקדם", description: "טיולים, מקומות ומסלולים לפי אזור, רמת קושי, נגישות, משך ומחיר." },
  { icon: Sparkles, title: "אשף התאמה אישית", description: "עונים על כמה שאלות ומקבלים טיולים מדורגים לפי מידת ההתאמה אליכם." },
  { icon: Map, title: "בניית טיול מותאם אישית", description: "מרכיבים טיול מתחנות, והמערכת מחשבת אוטומטית זמן, מרחק ומחיר." },
  { icon: MapPin, title: "מפות ומסלולים", description: "כל מקום ומסלול על מפה, ואפשר לייבא מסלול מקובץ GPX." },
  { icon: Bot, title: "עוזר AI בעברית", description: "מילוי מהיר של פרטי מקום, מסלול או טיול בעזרת עוזר חכם, בלי לוותר על השליטה בתוכן." },
  { icon: Users, title: "קהילה ותוכן מאושר", description: "כל משתמש יכול להוסיף תוכן, ומנהל בודק ומאשר אותו לפני שהוא מתפרסם." },
  { icon: Heart, title: "מועדפים והתראות", description: "שומרים טיולים שאהבתם, ומקבלים התראות על אישורים, תגובות ודירוגים." },
  { icon: User, title: "אזור אישי", description: "מנהלים את הטיולים, המקומות והמסלולים שיצרתם במקום אחד." },
];

const benefits = [
  "מערכת נוחה ופשוטה לשימוש",
  "תוכן שנבדק ואושר לפני פרסום",
  "התאמה אישית של הטיול",
  "חוויית משתמש מודרנית בעברית",
];

async function loadStats(): Promise<HomeStats | null> {
  try {
    return await getHomeStatsServer();
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const stats = await loadStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <PageHero
        icon={Compass}
        badge="אודות הפרויקט"
        title="המקום שבו כל טיול"
        highlight="מתחיל להתגשם"
        description="ברוכים הבאים לפלטפורמת הטיולים שלנו – המקום שבו כל אחד יכול לגלות, לתכנן וליצור טיולים מותאמים אישית בקלות ובנוחות."
        imageUrl={HERO_IMAGE}
      />

      <div className="mx-auto max-w-5xl px-6 py-20">
        {stats && (
          <section className="mb-20" aria-label="האתר במספרים">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { value: stats.tripsCount, label: "טיולים מאושרים" },
                { value: stats.placesCount, label: "מקומות לביקור" },
                { value: stats.usersCount, label: "מטיילים בקהילה" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                  <div className="text-4xl font-light text-gray-900">{item.value.toLocaleString("he-IL")}</div>
                  <div className="mt-1 text-sm text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-24">
          <SectionHeading title="מי אנחנו" />
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-12">
            <div className="flex flex-col items-start gap-8 md:flex-row">
              <div className="flex-shrink-0">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-600 to-gray-900 shadow-lg">
                  <Mountain className="h-10 w-10 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="flex-1">
                <p className="mb-4 text-lg leading-relaxed text-gray-700">
                  האתר נבנה מתוך <span className="font-semibold text-gray-800">אהבה לטיולים</span> ורצון להנגיש לכל אחד את האפשרות לתכנן יום טיול מושלם בישראל.
                </p>
                <p className="mb-4 text-lg leading-relaxed text-gray-700">
                  המערכת משלבת מידע על מסלולים ומקומות, ומאפשרת ליצור חוויות ייחודיות לפי העדפות אישיות.
                </p>
                <p className="border-r-4 border-gray-300 pr-4 italic leading-relaxed text-gray-600">
                  הפרויקט נבנה כחלק מתהליך למידה והתפתחות בעולם הפיתוח – עם מטרה ברורה להפוך את החוויה של תכנון טיולים למשהו פשוט, נגיש ומהנה.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-24">
          <SectionHeading title="מה אפשר לעשות באתר" subtitle="כל האפשרויות שהפלטפורמה מציעה" centered />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6 text-gray-900" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="leading-relaxed text-gray-600">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-600 to-gray-900 p-8 text-white shadow-xl md:p-12">
            <div className="absolute inset-0 opacity-10" aria-hidden="true">
              <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white" />
              <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-white" />
            </div>
            <div className="relative">
              <div className="mb-6 flex items-center gap-3">
                <Route className="h-8 w-8" aria-hidden="true" />
                <h2 className="text-3xl font-light md:text-4xl">החזון שלנו</h2>
              </div>
              <p className="mb-6 text-xl leading-relaxed text-white/95 md:text-2xl">אנחנו מאמינים שטיול טוב מתחיל בתכנון חכם.</p>
              <p className="text-lg leading-relaxed text-white/90">
                המטרה שלנו היא להפוך את תהליך התכנון לפשוט, נגיש ומהנה – כך שכל אחד יוכל לצאת לטיול שמתאים בדיוק לו. בין אם אתם מטיילים מנוסים או מחפשים השראה ראשונית, הפלטפורמה שלנו כאן כדי ללוות אתכם בכל שלב.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-24">
          <SectionHeading title="למה לבחור בנו" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 transition-all hover:border-gray-300">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-gray-900" aria-hidden="true" />
                <span className="font-medium text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="relative overflow-hidden rounded-3xl bg-gray-900 p-8 text-center shadow-2xl md:p-12">
            <div className="relative">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-500 to-gray-700 shadow-lg">
                <Compass className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h2 className="mb-4 text-3xl font-light text-white md:text-4xl">מוכנים להתחיל?</h2>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">הצטרפו אלינו וגלו עולם של טיולים חדשים – הכול במקום אחד.</p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/trips"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-700 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:from-gray-600 hover:to-gray-800 hover:shadow-xl"
                >
                  בואו לחקור טיולים
                  <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  יצירת קשר
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
