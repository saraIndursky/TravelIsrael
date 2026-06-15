import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative h-screen flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=1080&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-light text-white mb-6 leading-tight">
            תכנון טיולים
            <br />
            במבט אחד
          </h1>
          <p className="text-xl text-white/90 mb-12 font-light leading-relaxed">
            גלו מסלולים מתוכננים, מקומות מומלצים וטיולים
            <br />
            שמתאימים בדיוק לצרכים שלכם
          </p>

          <div className="flex flex-col gap-4">
            <Link
              href="/wizard"
              className="group inline-flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 max-w-[220px] rounded-md text-sm font-medium hover:bg-gray-50 transition-all"
            >
              מצא לי טיול
              <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/trips/create"
              className="group inline-flex items-center justify-center gap-3 bg-white/60 text-gray-800 px-8 py-4 max-w-[220px] rounded-md text-sm font-medium border border-gray-300 hover:bg-white hover:text-gray-900 transition-all"
            >
              תכנן טיול אישי
              <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
