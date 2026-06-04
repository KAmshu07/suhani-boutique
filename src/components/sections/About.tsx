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
    <section id={SECTION_ID.ABOUT} className="bg-cream-alt py-20 md:py-28 px-6">
      <div
        ref={ref}
        className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center"
      >
        {/* Left column: about image */}
        <div className="aspect-[3/4] relative overflow-hidden border-l-4 border-gold">
          <Image
            src={about.image_url}
            alt="Suhani Boutique workspace"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Right column: text content */}
        <div>
          <h2 className="font-heading text-3xl font-semibold uppercase tracking-widest text-brown">
            {getLocalizedField(about.heading, language)}
          </h2>
          <div className="w-16 h-px bg-gold mt-4 mb-8" />
          <p className="text-brown-light leading-relaxed">{getLocalizedField(about.story, language)}</p>

          {/* Stats */}
          <div className="mt-10 flex gap-8 md:gap-12">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-3xl font-bold text-gold">{stat.value}</div>
                <div className="text-sm text-brown-light mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
