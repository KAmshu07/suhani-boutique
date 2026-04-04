"use client";

import { useTranslation } from "@/lib/i18n";
import { useScrollAnimation } from "@/lib/use-scroll-animation";
import { SECTION_ID } from "@/data/constants";

export default function About() {
  const { language } = useTranslation();
  const { ref, isVisible } = useScrollAnimation();

  const heading =
    language === "hi"
      ? "हमारी कहानी"
      : language === "cg"
        ? "हमर कहानी"
        : "Our Story";

  const story =
    language === "hi"
      ? "20 से अधिक वर्षों की टेलरिंग विशेषज्ञता के साथ, सुहानी बुटीक बिहार से रायपुर के दिल तक बेहतरीन सिलाई की कला लाता है। हम जो भी कपड़ा बनाते हैं, वह समर्पण, सटीकता और शिल्प के प्रति प्रेम की कहानी कहता है।"
      : language === "cg"
        ? "20 से जादा बरस के टेलरिंग अनुभव के साथ, सुहानी बुटीक बिहार ले रायपुर के दिल तक बढ़िया सिलाई के कला लाथे। हमन जऊन भी कपड़ा बनाथन, वो समर्पण, सटीकता अउ शिल्प के प्रेम के कहानी कहिथे।"
        : "With over 20 years of tailoring expertise, Suhani Boutique brings the art of fine stitching from Bihar to the heart of Raipur. Every piece we create tells a story of dedication, precision, and love for the craft. From bridal lehengas to everyday alterations, we treat every garment with the same care and attention to detail.";

  const stats = [
    {
      value: "20+",
      label:
        language === "hi"
          ? "वर्षों का अनुभव"
          : language === "cg"
            ? "बरस के अनुभव"
            : "Years Experience",
    },
    {
      value: "1000+",
      label:
        language === "hi"
          ? "खुश ग्राहक"
          : language === "cg"
            ? "खुश ग्राहक"
            : "Happy Customers",
    },
    {
      value: "6",
      label:
        language === "hi"
          ? "विशेषताएं"
          : language === "cg"
            ? "विशेषता मन"
            : "Specialties",
    },
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
              Photo Coming Soon
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
            {heading}
          </h2>
          <div className="w-16 h-px bg-gold mt-4 mb-8" />
          <p className="text-brown-light leading-relaxed">{story}</p>

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
