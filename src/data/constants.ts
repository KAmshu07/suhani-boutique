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

// ─── Admin Button Classes (centralized; WCAG ≥4.5:1) ─────────────
// Shared by every admin control so contrast/sizing live in one place.
// cream-on-brown / brown-on-gold clear 4.5:1; the old `bg-gold text-cream`
// (2.53:1) is retired. min-h-[44px] meets the touch-target floor.
export const ADMIN_BTN = {
  PRIMARY:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-brown px-5 py-3 text-base font-medium text-cream transition-colors hover:bg-gold-hover disabled:opacity-50 min-h-[44px]",
  SECONDARY:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-brown-light/30 px-5 py-3 text-base font-medium text-brown transition-colors hover:border-gold disabled:opacity-50 min-h-[44px]",
  DANGER:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 min-h-[44px]",
} as const;

// Shared admin input/select/textarea field class (centralized like ADMIN_BTN so
// legibility/contrast live in one place). Add `w-full` at the call site as needed.
export const ADMIN_FIELD =
  "bg-cream-alt border border-brown-light/20 px-3 py-2 text-base text-brown rounded focus:border-gold focus:outline-none";

// ─── Order stage sequence (single ordering source) ───────────────
// The 9 statuses in lifecycle order. Display labels come from
// translations.ts `status.*`; this is the one place the ORDER is defined.
export const ORDER_STAGE_SEQUENCE = [
  ORDER_STATUS.BOOKED,
  ORDER_STATUS.CONSULTED,
  ORDER_STATUS.MEASURED,
  ORDER_STATUS.FABRIC_SELECTED,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.READY_FOR_FITTING,
  ORDER_STATUS.ALTERATIONS,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.DELIVERED,
] as const;
