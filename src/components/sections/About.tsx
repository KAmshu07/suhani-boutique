"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/use-scroll-animation";
import { SECTION_ID } from "@/data/constants";
import { getSettings } from "@/lib/content";
import { useLiveContent } from "@/lib/use-content";
import { getLocalizedField } from "@/lib/localized";
import { ABOUT_DEFAULTS, type AboutContent } from "@/lib/about-defaults";

async function fetchAbout(): Promise<AboutContent> {
  const s = await getSettings();
  return (s.about as AboutContent) ?? ABOUT_DEFAULTS;
}

export default function About() {
  const { t, language } = useTranslation();
  const ref = useScrollReveal();
  const { data: about } = useLiveContent(fetchAbout, ABOUT_DEFAULTS);

  const stats = [
    { value: about.stats?.experience ?? "", label: t("about.stat.experience") },
    { value: about.stats?.customers ?? "", label: t("about.stat.customers") },
    { value: about.stats?.specialties ?? "", label: t("about.stat.specialties") },
  ];

  return (
    <section id={SECTION_ID.ABOUT} className="bg-cream-alt px-6 py-20 md:py-28">
      <div
        ref={ref}
        className="scroll-reveal mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16"
      >
        {/* Image with an offset gold frame for editorial depth */}
        <div className="stagger-child relative">
          <div
            aria-hidden="true"
            className="absolute -bottom-4 -right-4 hidden h-full w-full border border-gold/60 md:block"
          />
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={about.image_url}
              alt="Suhani Boutique workspace"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Text content */}
        <div className="stagger-child">
          <h2 className="font-heading text-3xl font-semibold uppercase tracking-widest text-brown">
            {getLocalizedField(about.heading, language)}
          </h2>
          <div className="mt-4 mb-8 h-px w-16 bg-gold" />
          <p className="leading-relaxed text-brown-light md:text-lg">
            {getLocalizedField(about.story, language)}
          </p>

          {/* Stats */}
          <div className="mt-10 flex border-t border-brown-light/15 pt-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`flex-1 ${i > 0 ? "border-l border-brown-light/15 pl-5 md:pl-6" : ""}`}>
                <div className="font-heading text-3xl font-bold text-gold md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-brown-light">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
