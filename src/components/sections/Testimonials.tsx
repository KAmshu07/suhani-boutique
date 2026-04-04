"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useScrollAnimation } from "@/lib/use-scroll-animation";
import { SECTION_ID, ANIMATION } from "@/data/constants";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  const { language } = useTranslation();
  const { ref, isVisible } = useScrollAnimation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const heading =
    language === "hi"
      ? "हमारे ग्राहक क्या कहते हैं"
      : language === "cg"
        ? "हमर ग्राहक का कहिथें"
        : "What Our Clients Say";

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
        setFade(true);
      }, 300);
    }, ANIMATION.TESTIMONIAL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  function goTo(index: number) {
    if (index === activeIndex) return;
    setFade(false);
    setTimeout(() => {
      setActiveIndex(index);
      setFade(true);
    }, 300);
  }

  const current = testimonials[activeIndex];

  return (
    <section id={SECTION_ID.TESTIMONIALS} className="bg-cream py-20 md:py-28 px-6">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold uppercase tracking-widest text-brown">
            {heading}
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-4" />
        </div>

        {/* Testimonial display */}
        <div className="max-w-3xl mx-auto text-center py-12">
          <div
            className="transition-opacity duration-300"
            style={{ opacity: fade ? 1 : 0 }}
          >
            {/* Decorative quote mark */}
            <div className="font-heading text-6xl text-gold/30 leading-none select-none">
              &ldquo;
            </div>

            <p className="text-lg md:text-xl text-brown leading-relaxed italic">
              {current.quote[language]}
            </p>

            <div className="font-heading text-sm uppercase tracking-widest text-brown mt-6 font-semibold">
              {current.name[language]}
            </div>
            <div className="text-sm text-brown-light mt-1">
              {current.service[language]}
            </div>

            {/* Star rating */}
            <div className="text-gold text-sm mt-3">
              {Array.from({ length: current.rating }, (_, i) => (
                <span key={i}>&#9733;</span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center gap-3 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Testimonial ${index + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === activeIndex ? "bg-gold" : "bg-brown-light/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
