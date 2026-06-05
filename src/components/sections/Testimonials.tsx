"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/use-scroll-animation";
import { SECTION_ID, ANIMATION } from "@/data/constants";
import { getTestimonials } from "@/lib/content";
import { useLiveContent } from "@/lib/use-content";
import { getLocalizedField, type Localized } from "@/lib/localized";

type Testimonial = {
  id: string;
  customer_name: string;
  service: string;
  quote: Partial<Localized>;
  rating: number;
};

const TESTIMONIAL_FALLBACK: Testimonial[] = [];

export default function Testimonials() {
  const { t, language } = useTranslation();
  const ref = useScrollReveal();
  const { data: items } = useLiveContent(getTestimonials, TESTIMONIAL_FALLBACK);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [paused, setPaused] = useState(false);

  // Auto-rotate (re-arms when reviews load from the DB).
  useEffect(() => {
    if (paused || items.length === 0) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % items.length);
        setFade(true);
      }, ANIMATION.TESTIMONIAL_FADE);
    }, ANIMATION.TESTIMONIAL_INTERVAL);
    return () => clearInterval(interval);
  }, [paused, items.length]);

  function goTo(index: number) {
    if (index === activeIndex) return;
    setPaused(true);
    setFade(false);
    setTimeout(() => {
      setActiveIndex(index);
      setFade(true);
    }, ANIMATION.TESTIMONIAL_FADE);
  }

  if (items.length === 0) return null;

  const list = items as Testimonial[];
  const current = list[activeIndex] ?? list[0];

  return (
    <section id={SECTION_ID.TESTIMONIALS} className="bg-cream py-20 md:py-28 px-6">
      <div ref={ref} className="scroll-reveal max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold uppercase tracking-widest text-brown">
            {t("testimonials.heading")}
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-4" />
        </div>

        {/* Testimonial display */}
        <div className="mx-auto mt-12 max-w-3xl">
          <div
            className="relative overflow-hidden rounded-lg border border-brown-light/10 bg-cream-alt px-8 py-12 text-center shadow-sm transition-opacity duration-300 md:px-12"
            style={{ opacity: fade ? 1 : 0 }}
          >
            <div className="pointer-events-none absolute left-5 top-2 select-none font-heading text-7xl leading-none text-gold/25">
              &ldquo;
            </div>

            <p className="relative text-lg italic leading-relaxed text-brown md:text-xl">
              {getLocalizedField(current.quote, language)}
            </p>

            <div className="mt-6 font-heading text-sm font-semibold uppercase tracking-widest text-brown">
              {current.customer_name}
            </div>
            <div className="mt-1 text-sm text-brown-light">{current.service}</div>

            {/* Star rating */}
            <div className="mt-3 text-sm text-gold" aria-label={`${current.rating} ${t("a11y.starRating")}`}>
              {Array.from({ length: current.rating }, (_, i) => (
                <span key={i}>&#9733;</span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center gap-3 mt-8">
          {list.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goTo(index)}
              aria-label={`Testimonial ${index + 1}`}
              className="p-3"
            >
              <span
                className={`block w-2 h-2 rounded-full transition-colors ${
                  index === activeIndex ? "bg-gold" : "bg-brown-light/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
