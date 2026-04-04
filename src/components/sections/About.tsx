"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/use-scroll-animation";
import { SECTION_ID } from "@/data/constants";

export default function About() {
  const { t } = useTranslation();
  const ref = useScrollReveal();

  const stats = [
    { value: "20+", label: t("about.stat.experience") },
    { value: "1000+", label: t("about.stat.customers") },
    { value: "6", label: t("about.stat.specialties") },
  ];

  return (
    <section id={SECTION_ID.ABOUT} className="bg-cream-alt py-20 md:py-28 px-6">
      <div
        ref={ref}
        className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center"
      >
        {/* Left column: about image */}
        <div
          className="aspect-[3/4] relative overflow-hidden border-l-4 border-gold"
        >
          <Image
            src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"
            alt="Suhani Boutique workspace"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Right column: text content */}
        <div>
          <h2 className="font-heading text-3xl font-semibold uppercase tracking-widest text-brown">
            {t("about.heading")}
          </h2>
          <div className="w-16 h-px bg-gold mt-4 mb-8" />
          <p className="text-brown-light leading-relaxed">{t("about.story")}</p>

          {/* Stats */}
          <div className="mt-10 flex gap-8 md:gap-12">
            {stats.map((stat) => (
              <div key={stat.value}>
                <div className="font-heading text-3xl font-bold text-gold">
                  {stat.value}
                </div>
                <div className="text-sm text-brown-light mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
