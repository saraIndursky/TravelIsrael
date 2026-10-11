import type { Metadata } from "next";
import Link from "next/link";
import { TextPage } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "עזרה ושאלות נפוצות — TravelIsrael",
  description: "תשובות לשאלות נפוצות: איך מוצאים טיול, מוסיפים תוכן, ולמה תוכן ממתין לאישור.",
};

const faqs: Array<{ question: string; answer: React.ReactNode }> = [
  {
    question: "איך מוצאים טיול שמתאים לי?",
    answer: (
      <>
        אפשר לדפדף בדף <Link href="/trips" className="text-blue-700 underline">הטיולים</Link> ולסנן לפי אזור, קושי, נגישות, משך ומחיר, או להשתמש ב
        <Link href="/wizard" className="text-blue-700 underline">אשף ההתאמה</Link>: עונים על כמה שאלות ומקבלים טיולים מדורגים לפי מידת ההתאמה.
      </>
    ),
  },
  {
    question: "איך יוצרים טיול, מקום או מסלול?",
    answer: (
      <>
        אחרי התחברות, לוחצים על &quot;הוסף טיול&quot;, &quot;הוסף מקום&quot; או &quot;הוסף מסלול&quot; בעמוד הרלוונטי. טיול נבנה מתחנות (מקומות ומסלולים קיימים), ובטפסי מקום ומסלול אפשר להיעזר בעוזר ה-AI למילוי הפרטים.
      </>
    ),
  },
  {
    question: "למה התוכן שהוספתי ממתין לאישור?",
    answer:
      "כדי לשמור על איכות ודיוק, כל תוכן חדש נבדק על ידי מנהל לפני שהוא מתפרסם לכולם. עד האישור התוכן נראה רק לך ולמנהלים, ותקבלו התראה כשהוא יאושר או יידחה.",
  },
  {
    question: "מה קורה אם התוכן שלי נדחה?",
    answer:
      "הדחייה מגיעה עם סיבה. אפשר לערוך את התוכן, לתקן לפי הסיבה ולשלוח שוב לאישור מהאזור האישי שלכם.",
  },
  {
    question: "לא מצאתי סוג או אזור מתאים. מה עושים?",
    answer:
      'בוחרים "אחר" ברשימה וכותבים את הסוג או האזור החדש (באזור חדש בוחרים גם באיזה אזור הוא נמצא). אחרי שהמנהל יאשר את התוכן, הסוג או האזור יתווספו לרשימה לכולם.',
  },
  {
    question: "איך עובד עוזר ה-AI?",
    answer:
      "העוזר מציע ערכים לשדות בטופס לפי מה שכתבתם. שום דבר לא משתנה בטופס בלי שתאשרו, ותמיד כדאי לוודא ידנית פרטים כמו כתובת, קואורדינטות ומחירים.",
  },
  {
    question: "איך מדווחים על מידע שגוי?",
    answer:
      "בדפי המקומות, המסלולים והטיולים יש אפשרות לדווח על בעיה, אי-דיוק או עדכון. הדיווח מגיע למנהלים לטיפול, ותקבלו עדכון כשהוא טופל.",
  },
  {
    question: "שכחתי סיסמה",
    answer: (
      <>
        אפשר לאפס אותה בעמוד <Link href="/forgot-password" className="text-blue-700 underline">שחזור סיסמה</Link>. נשלח אליכם קישור לאיפוס במייל.
      </>
    ),
  },
  {
    question: "איך משנים אילו התראות אני מקבל?",
    answer: (
      <>
        בעמוד <Link href="/profile#notifications" className="text-blue-700 underline">האזור האישי</Link> יש סעיף הגדרות התראות, שבו בוחרים אילו התראות לקבל ואם להשמיע צליל.
      </>
    ),
  },
];

export default function HelpPage() {
  return (
    <TextPage title="עזרה ושאלות נפוצות" intro="לא מצאתם תשובה? אפשר תמיד לפנות אלינו.">
      <div className="divide-y divide-gray-100">
        {faqs.map(({ question, answer }) => (
          <details key={question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-gray-900">
              {question}
              <span className="text-xl text-gray-500 transition-transform group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-gray-700">{answer}</p>
          </details>
        ))}
      </div>
      <p className="border-t border-gray-100 pt-6 text-gray-700">
        עדיין צריכים עזרה? <Link href="/contact" className="font-medium text-blue-700 underline">כתבו לנו</Link>.
      </p>
    </TextPage>
  );
}
