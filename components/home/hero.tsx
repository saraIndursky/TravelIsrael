import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toDisplayImageUrl } from "@/lib/utils/image-url";

// Timna Valley: red sandstone under a blue sky. The previous photo is archived in public/brand/archive/.
const HERO_IMAGE = toDisplayImageUrl(
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Nature_of_Israel_2018_03.jpg/1920px-Nature_of_Israel_2018_03.jpg"
);

export function HomeHero() {
  return (
    <section className="relative flex min-h-[100svh] items-start pt-24 pb-12 md:items-center">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55" />

      <div className="relative mx-auto w-full max-w-7xl px-6">
        <div className="max-w-2xl">
          <h1 className="mb-6 text-5xl font-light leading-tight text-white md:text-7xl">
            תכנון טיולים
            <br />
            במבט אחד
          </h1>
          <p className="mb-12 text-xl font-light leading-relaxed text-white/90">
            גלו מסלולים מתוכננים, מקומות מומלצים וטיולים
            <br />
            שמתאימים בדיוק לצרכים שלכם
          </p>

          <div className="flex flex-col gap-4">
            <Link
              href="/wizard"
              className="group inline-flex max-w-[220px] items-center justify-center gap-3 rounded-md bg-white px-8 py-4 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50"
            >
              מציאת טיול
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/trips/create"
              className="group inline-flex max-w-[220px] items-center justify-center gap-3 rounded-md border border-gray-300 bg-white/60 px-8 py-4 text-sm font-medium text-gray-800 transition-all hover:bg-white hover:text-gray-900"
            >
              תכנון טיול אישי
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
