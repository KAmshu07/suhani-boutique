import { translations } from "@/data/translations";
import type { Localized } from "@/lib/localized";

export type AboutContent = {
  heading: Partial<Localized>;
  story: Partial<Localized>;
  stats: { experience: string; customers: string; specialties: string };
  image_url: string;
};

// Current About content, used as the fallback for both the public section and the
// editor (the `about` setting is not seeded, so this is the starting point).
export const ABOUT_DEFAULTS: AboutContent = {
  heading: {
    en: translations.en["about.heading"],
    hi: translations.hi["about.heading"],
    cg: translations.cg["about.heading"],
  },
  story: {
    en: translations.en["about.story"],
    hi: translations.hi["about.story"],
    cg: translations.cg["about.story"],
  },
  stats: { experience: "20+", customers: "1000+", specialties: "6" },
  image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
};
