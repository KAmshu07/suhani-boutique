"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useScrollAnimation } from "@/lib/use-scroll-animation";
import { SECTION_ID, GALLERY_CATEGORY, ANIMATION } from "@/data/constants";
import { galleryItems, galleryCategoryLabels } from "@/data/gallery";

const categories = [
  GALLERY_CATEGORY.ALL,
  GALLERY_CATEGORY.BRIDAL,
  GALLERY_CATEGORY.FESTIVAL,
  GALLERY_CATEGORY.DAILY,
  GALLERY_CATEGORY.ALTERATIONS,
  GALLERY_CATEGORY.FABRIC,
] as const;

export default function Gallery() {
  const { t, language } = useTranslation();
  const { ref, isVisible } = useScrollAnimation();
  const [activeCategory, setActiveCategory] = useState<string>(GALLERY_CATEGORY.ALL);

  const filtered =
    activeCategory === GALLERY_CATEGORY.ALL
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <section id={SECTION_ID.GALLERY} className="bg-cream py-20 md:py-28 px-6">
      <div
        ref={ref}
        className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Section heading */}
        <h2 className="font-heading text-3xl md:text-4xl font-semibold uppercase tracking-widest text-brown text-center">
          {t("nav.gallery")}
        </h2>
        <div className="w-16 h-px bg-gold mx-auto mt-4 mb-12" />

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => {
            const label =
              galleryCategoryLabels[category as keyof typeof galleryCategoryLabels]?.[
                language as keyof (typeof galleryCategoryLabels)["all"]
              ] ?? category;
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 font-heading uppercase tracking-wider text-xs transition-colors ${
                  isActive
                    ? "bg-gold text-cream"
                    : "bg-cream-alt text-brown hover:bg-gold/20"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {filtered.map((item, index) => {
            const categoryLabel =
              galleryCategoryLabels[item.category as keyof typeof galleryCategoryLabels]?.[
                language as keyof (typeof galleryCategoryLabels)["all"]
              ] ?? item.category;

            return (
              <div
                key={item.id}
                className={`aspect-square relative overflow-hidden group transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * ANIMATION.CARD_STAGGER}ms` }}
              >
                {/* Woven texture placeholder */}
                <div
                  className="absolute inset-0 bg-cream-alt group-hover:scale-[1.03] transition-transform duration-300"
                  style={{
                    backgroundImage: `linear-gradient(${index * 30}deg, #F5F0E8 25%, transparent 25%, transparent 50%, #F5F0E8 50%, #F5F0E8 75%, transparent 75%, transparent)`,
                    backgroundSize: "20px 20px",
                  }}
                />

                {/* "Coming Soon" placeholder text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-heading uppercase tracking-widest text-brown-light/40 text-sm">
                    Coming Soon
                  </span>
                </div>

                {/* Hover overlay with category label */}
                <div className="absolute inset-0 bg-brown/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-cream font-heading uppercase tracking-widest text-xs">
                    {categoryLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
