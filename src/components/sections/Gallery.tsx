"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/use-scroll-animation";
import { SECTION_ID, GALLERY_CATEGORY } from "@/data/constants";
import { galleryItems, galleryCategoryLabels } from "@/data/gallery";
import { getGallery } from "@/lib/content";
import { useLiveContent } from "@/lib/use-content";

const categories = [
  GALLERY_CATEGORY.ALL,
  GALLERY_CATEGORY.BRIDAL,
  GALLERY_CATEGORY.FESTIVAL,
  GALLERY_CATEGORY.DAILY,
  GALLERY_CATEGORY.ALTERATIONS,
  GALLERY_CATEGORY.FABRIC,
] as const;

// Static fallback shaped like DB rows (url instead of src).
const GALLERY_FALLBACK = galleryItems.map((i) => ({
  id: i.id,
  category: i.category as string,
  url: i.src,
  alt: i.alt,
}));

export default function Gallery() {
  const { t, language } = useTranslation();
  const ref = useScrollReveal();
  const [activeCategory, setActiveCategory] = useState<string>(GALLERY_CATEGORY.ALL);
  const { data: items } = useLiveContent(getGallery, GALLERY_FALLBACK);

  const filtered =
    activeCategory === GALLERY_CATEGORY.ALL
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <section id={SECTION_ID.GALLERY} className="bg-cream py-20 md:py-28 px-6">
      <div ref={ref} className="scroll-reveal">
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
                aria-pressed={isActive}
                className={`px-5 py-2.5 font-heading uppercase tracking-wider text-xs transition-colors ${
                  isActive ? "bg-gold text-cream" : "bg-cream-alt text-brown hover:bg-gold/20"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {filtered.map((item) => {
            const categoryLabel =
              galleryCategoryLabels[item.category as keyof typeof galleryCategoryLabels]?.[
                language as keyof (typeof galleryCategoryLabels)["all"]
              ] ?? item.category;
            return (
              <div key={item.id} className="stagger-child aspect-square relative overflow-hidden group">
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
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
