import type { Metadata } from "next";
import Link from "next/link";
import { TextPage, TextSection } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "מדיניות פרטיות — TravelIsrael",
  description: "איזה מידע האתר אוסף, למה, ועם מי הוא משותף.",
};

const processors: Array<{ name: string; purpose: string }> = [
  { name: "Supabase", purpose: "אחסון הנתונים, ההתחברות ותמונות שהועלו" },
  { name: "Vercel", purpose: "אירוח האתר ואנליטיקס שימוש (ללא זיהוי אישי)" },
  { name: "Google (Gemini)", purpose: "עוזר ה-AI: הטקסט שאתם כותבים בצ'אט ופרטי הטופס נשלחים לעיבוד" },
  { name: "Google (התחברות)", purpose: "התחברות עם חשבון Google, אם בחרתם בה" },
  { name: "Resend", purpose: "שליחת מיילים מהאתר (ברוכים הבאים, אישור תוכן, איפוס סיסמה)" },
  { name: "OpenStreetMap", purpose: "תצוגת המפות" },
  { name: "Wikimedia Commons", purpose: "תמונות מהארץ שמוצגות באתר" },
];

export default function PrivacyPage() {
  return (
    <TextPage
      title="מדיניות פרטיות"
      intro="אנחנו אוספים רק את המידע שנחוץ להפעלת האתר."
      updated="אוקטובר 2026"
    >
      <TextSection title="איזה מידע נאסף">
        <ul className="list-disc space-y-1 pr-6">
          <li>פרטי חשבון: שם, כתובת אימייל וסיסמה (הסיסמה נשמרת מוצפנת על ידי שירות ההתחברות, ואיננו רואים אותה).</li>
          <li>תוכן שיצרתם: טיולים, מקומות, מסלולים, תגובות, דירוגים, תמונות, מועדפים ודיווחים.</li>
          <li>העדפות: הגדרות התראות והעדפות האשף.</li>
          <li>פניות שנשלחו בטופס יצירת הקשר: שם, אימייל והודעה.</li>
          <li>נתוני שימוש כלליים (אילו עמודים נצפו ופעולות כמו יצירת טיול), ללא זיהוי אישי.</li>
        </ul>
      </TextSection>

      <TextSection title="למה משתמשים במידע">
        <p>להפעלת האתר והחשבון, להצגת התוכן שאתם יוצרים, לשליחת התראות ומיילים הקשורים לפעילות שלכם, למענה לפניות, ולשיפור האתר.</p>
      </TextSection>

      <TextSection title="עם מי המידע משותף">
        <p>איננו מוכרים מידע אישי. כדי להפעיל את האתר אנו משתמשים בשירותים חיצוניים:</p>
        <ul className="space-y-1 pr-6">
          {processors.map((processor) => (
            <li key={processor.name} className="list-disc">
              <span className="font-medium">{processor.name}</span> – {processor.purpose}
            </li>
          ))}
        </ul>
      </TextSection>

      <TextSection title="מה גלוי לאחרים">
        <p>תוכן שפורסם ואושר (טיולים, מקומות, מסלולים, תגובות, דירוגים ותמונות) גלוי לכל מבקר, בצירוף שם היוצר. כתובת האימייל שלכם אינה מוצגת למשתמשים אחרים.</p>
      </TextSection>

      <TextSection title="עוגיות וזיהוי">
        <p>האתר משתמש בעוגיות ובאחסון מקומי הנחוצים להתחברות ולזכירת ההעדפות שלכם. אין שימוש בעוגיות פרסום.</p>
      </TextSection>

      <TextSection title="הזכויות שלכם">
        <p>
          אפשר לבקש לעיין במידע שנשמר עליכם, לתקן אותו או למחוק אותו. לפנייה:{" "}
          <Link href="/contact" className="text-blue-700 underline">צרו קשר</Link>.
        </p>
      </TextSection>

      <TextSection title="אבטחה">
        <p>הנתונים נשמרים במסד נתונים עם הרשאות ברמת השורה, ומפתחות שירות נשמרים בצד השרת בלבד. אף מערכת אינה חסינה לחלוטין, אך אנו פועלים להגן על המידע.</p>
      </TextSection>

      <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
        מסמך זה הוא נוסח כללי שנכתב לפרויקט לימודי. לפני שימוש מסחרי מומלץ להתייעץ עם איש מקצוע.
      </p>
    </TextPage>
  );
}
