"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/use-scroll-animation";
import { SECTION_ID, GALLERY_CATEGORY } from "@/data/constants";
import { galleryItems, galleryCategoryLabels } from "@/data/gallery";
import { getGallery } from "@/lib/content";
import { useLiveContent } from "@/lib/use-content";
import Lightbox from "@/components/Lightbox";

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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { data: items } = useLiveContent(getGallery, GALLERY_FALLBACK);

  const filtered =
    activeCategory === GALLERY_CATEGORY.ALL
      ? items
      : items.filter((item) => item.category === activeCategory);

  function selectCategory(category: string) {
    setLightboxIndex(null); // closing any open viewer keeps the index valid
    setActiveCategory(category);
  }

  const labelFor = (category: string) =>
    galleryCategoryLabels[category as keyof typeof galleryCategoryLabels]?.[
      language as keyof (typeof galleryCategoryLabels)["all"]
    ] ?? category;

  return (
    <section id={SECTION_ID.GALLERY} className="bg-cream py-20 md:py-28 px-6">
      <div ref={ref} className="scroll-reveal">
        <h2 className="text-center font-heading text-3xl md:text-4xl font-semibold uppercase tracking-widest text-brown">
          {t("nav.gallery")}
        </h2>
        <div className="mx-auto mt-4 mb-12 h-px w-16 bg-gold" />

        {/* Filter tabs */}
        <div className="mb-12 flex flex-wrap justify-center gap-2.5">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => selectCategory(category)}
                aria-pressed={isActive}
                className={`rounded-full px-5 py-2.5 font-heading text-xs uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-brown text-cream"
                    : "bg-cream-alt text-brown hover:bg-gold/15"
                }`}
              >
                {labelFor(category)}
              </button>
            );
          })}
        </div>

        {/* Gallery grid — portrait tiles suit garment photography */}
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setLightboxIndex(i)}
              aria-label={item.alt || labelFor(item.category)}
              className="stagger-child group relative aspect-[3/4] overflow-hidden bg-cream-alt"
            >
              <Image
                src={item.url}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Editorial caption: always-on gradient foot, label reveals on hover/focus */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brown/80 via-brown/20 to-transparent p-3 pt-10">
                <span className="block translate-y-1 font-heading text-[11px] uppercase tracking-widest text-cream opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {labelFor(item.category)}
                </span>
              </div>
              {/* Thin gold frame on hover */}
              <span className="pointer-events-none absolute inset-0 ring-0 ring-inset ring-gold transition-all duration-300 group-hover:ring-2" />
            </button>
          ))}
        </div>
      </div>

      <Lightbox items={filtered} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onIndexChange={setLightboxIndex} />
    </section>
  );
}
