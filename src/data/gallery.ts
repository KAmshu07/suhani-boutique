// ─── Gallery Items ───────────────────────────────────────────────
// Zero imports. Zero functions. Each item is a placeholder until real photos arrive.
// To add real photos: drop image in public/gallery/, update src path here.

export const galleryItems = [
  { id: "g1", category: "bridal", alt: "Bridal lehenga with intricate embroidery" },
  { id: "g2", category: "bridal", alt: "Wedding saree with gold zari work" },
  { id: "g3", category: "festival", alt: "Festive anarkali suit" },
  { id: "g4", category: "festival", alt: "Embroidered kurta set for celebrations" },
  { id: "g5", category: "daily", alt: "Elegant daily wear salwar kameez" },
  { id: "g6", category: "daily", alt: "Cotton kurti with modern cut" },
  { id: "g7", category: "alterations", alt: "Perfectly altered blouse fitting" },
  { id: "g8", category: "alterations", alt: "Dress alteration with precision" },
  { id: "g9", category: "fabric", alt: "Premium silk fabric collection" },
  { id: "g10", category: "fabric", alt: "Designer fabric selection" },
  { id: "g11", category: "bridal", alt: "Custom bridal dupatta with embellishments" },
  { id: "g12", category: "festival", alt: "Designer saree for special occasions" },
] as const;

export const galleryCategoryLabels = {
  all: { en: "All", hi: "सभी", cg: "सब्बो" },
  bridal: { en: "Bridal", hi: "ब्राइडल", cg: "दुलहिन" },
  festival: { en: "Festival", hi: "त्योहार", cg: "तिहार" },
  daily: { en: "Daily", hi: "दैनिक", cg: "रोजाना" },
  alterations: { en: "Alterations", hi: "अल्टरेशन", cg: "अल्टरेशन" },
  fabric: { en: "Fabric", hi: "कपड़ा", cg: "कपड़ा" },
} as const;
