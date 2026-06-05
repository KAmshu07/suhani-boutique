"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { SECTION_ID } from "@/data/constants";
import { getSettings } from "@/lib/content";
import { useLiveContent } from "@/lib/use-content";
import { ArrowUpIcon } from "@/components/icons";

const HERO_DEFAULT = {
  image_url: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=1920&q=80",
};

async function fetchHero(): Promise<{ image_url: string }> {
  const s = await getSettings();
  return (s.hero as { image_url: string }) ?? HERO_DEFAULT;
}

export default function Hero() {
  const { t } = useTranslation();
  const { data: hero } = useLiveContent(fetchHero, HERO_DEFAULT);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
  function scrollDown() {
    window.scrollBy({ top: window.innerHeight - 48, behavior: "smooth" });
  }

  return (
    <section
      id={SECTION_ID.HOME}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brown"
    >
      {/* Full-viewport background image with a slow Ken-Burns drift */}
      <Image src={hero.image_url} alt="" fill priority className="hero-zoom object-cover" sizes="100vw" />

      {/* Layered scrims: base for legibility, top for the navbar, bottom for depth */}
      <div className="absolute inset-0 bg-brown/30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brown/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-brown/80 to-transparent" />

      {/* Subtle geometric pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232C1810' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* CSS animation handles fade-in — no JS state needed */}
      <div className="hero-content relative z-10 px-6 text-center">
        <div className="mx-auto mb-8 h-px w-16 bg-gold" />

        <h1 className="font-heading text-5xl font-bold uppercase tracking-[0.2em] text-cream md:text-7xl">
          {t("hero.title")}
        </h1>

        <p className="mt-4 font-heading text-lg font-light italic uppercase tracking-widest text-cream/70 md:text-xl">
          {t("hero.subtitle")}
        </p>

        <div className="mx-auto mt-8 h-px w-16 bg-gold" />

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => scrollTo(SECTION_ID.GALLERY)}
            className="rounded-none border-2 border-cream px-8 py-3 font-heading text-sm uppercase tracking-wider text-cream transition-colors hover:bg-cream hover:text-brown"
          >
            {t("nav.gallery")}
          </button>
          <button
            onClick={() => scrollTo(SECTION_ID.BOOKING)}
            className="rounded-none bg-gold px-8 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-brown transition-colors hover:bg-cream"
          >
            {t("hero.cta")}
          </button>
        </div>
      </div>

      {/* Scroll cue */}
      <button
        onClick={scrollDown}
        aria-label="Scroll down"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-cream/70 transition-colors hover:text-cream"
      >
        <ArrowUpIcon className="scroll-cue h-6 w-6 rotate-180" />
      </button>
    </section>
  );
}
