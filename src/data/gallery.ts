// ─── Gallery Items ───────────────────────────────────────────────
// Zero imports. Zero functions. Each item has an Unsplash stock photo.
// To replace with real photos: update src path to local /gallery/filename.webp

export const galleryItems = [
  {
    id: "g1",
    category: "bridal",
    src: "https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop&q=80",
    alt: "Bridal lehenga with intricate embroidery",
  },
  {
    id: "g2",
    category: "bridal",
    src: "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=600&h=800&fit=crop&q=80",
    alt: "Wedding saree with gold zari work",
  },
  {
    id: "g3",
    category: "festival",
    src: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop&q=80",
    alt: "Festive anarkali suit",
  },
  {
    id: "g4",
    category: "festival",
    src: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&h=800&fit=crop&q=80",
    alt: "Embroidered kurta set for celebrations",
  },
  {
    id: "g5",
    category: "daily",
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop&q=80",
    alt: "Elegant daily wear salwar kameez",
  },
  {
    id: "g6",
    category: "daily",
    src: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=800&fit=crop&q=80",
    alt: "Cotton kurti with modern cut",
  },
  {
    id: "g7",
    category: "alterations",
    src: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=800&fit=crop&q=80",
    alt: "Perfectly altered blouse fitting",
  },
  {
    id: "g8",
    category: "fabric",
    src: "https://images.unsplash.com/photo-1606937295547-bc0f668595b3?w=600&h=800&fit=crop&q=80",
    alt: "Premium silk fabric collection",
  },
  {
    id: "g9",
    category: "fabric",
    src: "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?w=600&h=800&fit=crop&q=80",
    alt: "Designer fabric selection",
  },
] as const;

export const galleryCategoryLabels = {
  all: { en: "All", hi: "सभी", cg: "सब्बो" },
  bridal: { en: "Bridal", hi: "ब्राइडल", cg: "दुलहिन" },
  festival: { en: "Festival", hi: "त्योहार", cg: "तिहार" },
  daily: { en: "Daily", hi: "दैनिक", cg: "रोजाना" },
  alterations: { en: "Alterations", hi: "अल्टरेशन", cg: "अल्टरेशन" },
  fabric: { en: "Fabric", hi: "कपड़ा", cg: "कपड़ा" },
} as const;
