import type { Metadata } from "next";
import { Clock, HeartHandshake, Mail, MessageCircle, Sparkles, Zap } from "lucide-react";
import { ContactForm } from "@/components/features/contact/contact-form";
import { PageHero, SectionHeading } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "צור קשר — TravelIsrael",
  description: "שאלה, הצעה או בעיה? כתבו לנו ונחזור אליכם בהקדם.",
};

const HERO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Bahai_Garden_in_Haifa_Israel.jpg/1920px-Bahai_Garden_in_Haifa_Israel.jpg";

const assurances = [
  { icon: HeartHandshake, text: "כל פנייה נקראת באופן אישי" },
  { icon: Zap, text: "תגובה מהירה ומקצועית" },
  { icon: Sparkles, text: "משוב שלכם משפר את האתר" },
];

export default function ContactPage() {
  // Shown only when the site owner has configured a public address (see .env.example).
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  const methods = [
    ...(contactEmail
      ? [
          {
            icon: Mail,
            title: "אימייל",
            description: contactEmail,
            detail: "שלחו לנו הודעה ונחזור אליכם בהקדם",
            href: `mailto:${contactEmail}`,
          },
        ]
      : []),
    {
      icon: MessageCircle,
      title: "טופס פנייה",
      description: "מלאו את הטופס למטה",
      detail: "הדרך הכי נוחה לקבל תשובה מפורטת",
    },
    {
      icon: Clock,
      title: "זמן תגובה",
      description: "בהקדם האפשרי",
      detail: "אנחנו משתדלים לענות במהירות על כל פנייה",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <PageHero
        icon={Mail}
        badge="צור קשר"
        title="רוצים ליצור איתנו קשר?"
        highlight="אנחנו כאן כדי לעזור"
        description="בין אם יש לכם שאלה, הצעה או צורך בעזרה – נשמח לשמוע מכם ולחזור אליכם בהקדם."
        imageUrl={HERO_IMAGE}
      />

      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {assurances.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-600 to-gray-900">
                <Icon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-gray-700">{text}</span>
            </div>
          ))}
        </div>

        <section className="mb-20">
          <SectionHeading title="אפשרויות יצירת קשר" subtitle="בחרו את הדרך הנוחה לכם ביותר" centered />
          <div className={`grid grid-cols-1 gap-6 ${methods.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            {methods.map((method) => {
              const Icon = method.icon;
              const content = (
                <>
                  <div className="mb-4">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gray-600 to-gray-900 shadow-lg transition-transform group-hover:scale-110">
                      <Icon className="h-7 w-7 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{method.title}</h3>
                  <p className="mb-2 font-medium text-gray-700" dir={method.href ? "ltr" : undefined}>
                    {method.description}
                  </p>
                  <p className="text-sm text-gray-500">{method.detail}</p>
                </>
              );
              const className =
                "group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg";
              return method.href ? (
                <a key={method.title} href={method.href} className={className}>
                  {content}
                </a>
              ) : (
                <div key={method.title} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        </section>

        <section id="form" className="mb-20 scroll-mt-24">
          <SectionHeading title="טופס פנייה" />
          <ContactForm />
        </section>

        <section>
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-600 to-gray-900">
                <HeartHandshake className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">המחויבות שלנו אליכם</h3>
                <p className="mb-3 leading-relaxed text-gray-700">
                  חשוב לנו להעניק לכם חוויית שימוש מצוינת, ולכן כל פנייה נקראת ומטופלת ברצינות. אנחנו משתדלים להגיב בצורה המקיפה ביותר.
                </p>
                <p className="italic text-gray-600">
                  האתר שלנו נבנה בשבילכם, וכל משוב, שאלה או הצעה עוזרים לנו להשתפר ולהפוך את הפלטפורמה למקום טוב יותר לכולם.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
