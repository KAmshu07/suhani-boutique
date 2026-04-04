"use client";

import { useTranslation } from "@/lib/i18n";
import { useScrollAnimation } from "@/lib/use-scroll-animation";
import { SECTION_ID } from "@/data/constants";

export default function About() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollAnimation();

  const stats = [
    { value: "20+", label: t("about.stat.experience") },
    { value: "1000+", label: t("about.stat.customers") },
    { value: "6", label: t("about.stat.specialties") },
  ];

  return (
    <section id={SECTION_ID.ABOUT} className="bg-cream-alt py-20 md:py-28 px-6">
      <div
        ref={ref}
        className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center"
      >
        {/* Left column: placeholder image */}
        <div
          className={`aspect-[3/4] bg-cream relative overflow-hidden border-l-4 border-gold transition-all duration-700 ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-8"
          }`}
        >
          {/* Subtle fabric weave pattern */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232C1810' fill-opacity='1'%3E%3Cpath d='M0 0h10v10H0zM10 10h10v10H10z' fill-opacity='.3'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading uppercase tracking-widest text-brown-light/30 text-sm">
              {t("about.photoPlaceholder")}
            </span>
          </div>
        </div>

        {/* Right column: text content */}
        <div
          className={`transition-all duration-700 ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-8"
          }`}
        >
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
