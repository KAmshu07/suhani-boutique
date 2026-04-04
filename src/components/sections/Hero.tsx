"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { SECTION_ID } from "@/data/constants";

export default function Hero() {
  const { t } = useTranslation();

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id={SECTION_ID.HOME}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-cream-alt to-cream overflow-hidden"
    >
      {/* Full-viewport background image */}
      <Image
        src="https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=1920&q=80"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-brown/40" />

      {/* Subtle geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232C1810' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* CSS animation handles fade-in — no JS state needed */}
      <div className="hero-content relative z-10 text-center px-6">
        <div className="w-16 h-px bg-gold mx-auto mb-8" />

        <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase tracking-[0.2em] text-cream">
          {t("hero.title")}
        </h1>

        <p className="font-heading text-lg md:text-xl font-light italic uppercase tracking-widest text-cream/70 mt-4">
          {t("hero.subtitle")}
        </p>

        <div className="w-16 h-px bg-gold mx-auto mt-8" />

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => scrollTo(SECTION_ID.GALLERY)}
            className="border-2 border-cream text-cream hover:bg-cream hover:text-brown rounded-none px-8 py-3 font-heading uppercase tracking-wider text-sm transition-colors"
          >
            {t("nav.gallery")}
          </button>
          <button
            onClick={() => scrollTo(SECTION_ID.BOOKING)}
            className="bg-gold text-cream hover:bg-cream hover:text-brown rounded-none px-8 py-3 font-heading uppercase tracking-wider text-sm transition-colors"
          >
            {t("hero.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
