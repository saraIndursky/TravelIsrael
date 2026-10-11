import Link from "next/link";

const footerLinks = {
  product: [
    { href: "/trips", label: "טיולים" },
    { href: "/places", label: "מקומות" },
    { href: "/trails", label: "מסלולים" },
    { href: "/wizard", label: "תכנון" },
  ],
  company: [
    { href: "/about", label: "אודות" },
    { href: "/contact", label: "יצירת קשר" },
  ],
  support: [
    { href: "/help", label: "עזרה" },
    { href: "/terms", label: "תנאי שימוש" },
    { href: "/privacy", label: "מדיניות פרטיות" },
  ],
};

export function Footer() {
  return (
    <footer id="contact" data-site-footer className="border-t border-border/60 bg-white mt-auto">
      <div className="ti-container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xl font-semibold text-gray-900 mb-4">TravelIsrael</div>
            <p className="text-sm text-gray-600 leading-relaxed">פלטפורמה לתכנון טיולים יומיים בישראל</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">המוצר</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">החברה</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">תמיכה</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          © TravelIsrael 2026 כל הזכויות שמורות.
        </p>
      </div>
    </footer>
  );
}
