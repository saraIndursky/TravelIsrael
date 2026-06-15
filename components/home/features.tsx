import { Calendar, MapPin, Star } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "מאגר מקומות",
    description: "מאות מקומות מומלצים מכל רחבי הארץ עם פרטים מלאים",
  },
  {
    icon: Calendar,
    title: "תכנון חכם",
    description: "בנו מסלול יומי מותאם לזמן ולצרכים שלכם",
  },
  {
    icon: Star,
    title: "דירוגים אמיתיים",
    description: "ביקורות והמלצות מקהילת המשתמשים",
  },
];

export function HomeFeatures() {
  return (
    <section id="about" className="bg-white py-16 md:py-24">
      <div className="ti-container">
        <div className="mx-auto mb-14 max-w-2xl text-center space-y-4">
          <h2 className="ti-section-title">תכנון פשוט ומדויק</h2>
          <p className="text-muted-foreground leading-relaxed">
            כלי התכנון שלנו מאפשר לכם לבנות מסלול טיול מותאם אישית בקלות, עם כל המידע החשוב במקום אחד
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center space-y-4">
              <div className="ti-icon-circle">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
