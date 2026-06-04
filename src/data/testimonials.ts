// ─── Testimonial Data ────────────────────────────────────────────
// Zero imports. Zero functions.
// Real reviews only — no fabricated quotes. Empty until real customer
// reviews are collected (with permission). The Testimonials section
// auto-hides while this is empty, and will be managed from the admin
// panel (Supabase) in a later phase.

export const testimonials: {
  id: string;
  name: { en: string; hi: string; cg: string };
  service: { en: string; hi: string; cg: string };
  quote: { en: string; hi: string; cg: string };
  rating: number;
}[] = [];
