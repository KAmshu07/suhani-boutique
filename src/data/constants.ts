// ─── Order Statuses ──────────────────────────────────────────────
export const ORDER_STATUS = {
  BOOKED: "booked",
  CONSULTED: "consulted",
  MEASURED: "measured",
  FABRIC_SELECTED: "fabric_selected",
  IN_PROGRESS: "in_progress",
  READY_FOR_FITTING: "ready_for_fitting",
  ALTERATIONS: "alterations",
  COMPLETED: "completed",
  DELIVERED: "delivered",
} as const;

// ─── Payment Methods ─────────────────────────────────────────────
export const PAYMENT_METHOD = {
  CASH: "cash",
  UPI: "upi",
} as const;

// ─── Payment Statuses ────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PARTIAL: "partial",
  PAID: "paid",
} as const;

// ─── User Roles ──────────────────────────────────────────────────
export const USER_ROLE = {
  CUSTOMER: "customer",
  ADMIN: "admin",
} as const;

// ─── Supported Languages ─────────────────────────────────────────
export const LANGUAGE = {
  EN: "en",
  HI: "hi",
  CG: "cg",
} as const;

export const LANGUAGE_LABELS = {
  en: "EN",
  hi: "HI",
  cg: "CG",
} as const;

export const DEFAULT_LANGUAGE = LANGUAGE.EN;
export const LANGUAGE_STORAGE_KEY = "suhani-boutique-lang";

// ─── Service Categories ──────────────────────────────────────────
export const SERVICE_CATEGORY = {
  CUSTOM_STITCHING: "custom_stitching",
  ALTERATIONS: "alterations",
  BRIDAL_WEAR: "bridal_wear",
  FABRIC_SALES: "fabric_sales",
  READY_MADE: "ready_made",
  ACCESSORIES: "accessories",
} as const;

// ─── Appointment Statuses ────────────────────────────────────────
export const APPOINTMENT_STATUS = {
  REQUESTED: "requested",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

// ─── Gallery Categories ──────────────────────────────────────────
export const GALLERY_CATEGORY = {
  ALL: "all",
  BRIDAL: "bridal",
  FESTIVAL: "festival",
  DAILY: "daily",
  ALTERATIONS: "alterations",
  FABRIC: "fabric",
} as const;

// ─── Section IDs ─────────────────────────────────────────────────
export const SECTION_ID = {
  HOME: "home",
  SERVICES: "services",
  GALLERY: "gallery",
  ABOUT: "about",
  TESTIMONIALS: "testimonials",
  BOOKING: "booking",
  CONTACT: "contact",
} as const;

// ─── Navigation Links ────────────────────────────────────────────
export const NAV_LINKS = [
  { key: "nav.home", id: "home" },
  { key: "nav.services", id: "services" },
  { key: "nav.gallery", id: "gallery" },
  { key: "nav.about", id: "about" },
  { key: "nav.book", id: "booking" },
  { key: "nav.contact", id: "contact" },
] as const;

export const SUPPORTED_LANGUAGES = [LANGUAGE.EN, LANGUAGE.HI, LANGUAGE.CG] as const;

// ─── Animation Durations (ms) ────────────────────────────────────
export const ANIMATION = {
  HERO_FADE_IN: 2000,
  HERO_INITIAL_DELAY: 100,
  SECTION_FADE_IN: 600,
  CARD_STAGGER: 100,
  GALLERY_HOVER_SCALE: 1.03,
  NAV_TRANSITION: 300,
  WHATSAPP_BOUNCE_DELAY: 2000,
  TESTIMONIAL_INTERVAL: 5000,
  TESTIMONIAL_FADE: 300,
} as const;

// ─── Scroll Thresholds ───────────────────────────────────────────
export const SCROLL = {
  NAV_SOLID_THRESHOLD: 100,
  BACK_TO_TOP_THRESHOLD: 500,
  OBSERVER_THRESHOLD: 0.15,
} as const;

// ─── External URLs ───────────────────────────────────────────────
export const EXTERNAL = {
  WHATSAPP_BASE: "https://wa.me",
} as const;
