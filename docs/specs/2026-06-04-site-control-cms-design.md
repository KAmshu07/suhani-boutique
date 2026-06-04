# Site Control (CMS) — Design Spec

- **Date:** 2026-06-04
- **Status:** Design — for review
- **Repo:** `suhani-boutique`
- **Depends on:** Admin Foundation (done) — `docs/specs/2026-06-04-admin-foundation-design.md`

## 1. Goal

Build the admin screens where Mom edits the public site, and finish wiring the remaining
public sections to read from the database so her edits go live. The Foundation already wired
the Services section and the booking/contact lead capture; this phase adds the editing UI and
DB-backs the rest of the site.

## 2. Decided: "Smart trilingual" editing

- **Language-agnostic fields** (price, image, hours, phone, address, visibility, display order,
  category, rating) → a **single input**, edited once.
- **Text fields** (service name/description, testimonial quote, announcement message, About
  heading/story, business name) → a **`LocalizedInput`**: three boxes (English / Hindi /
  Chhattisgarhi), English emphasized; Hindi/CG optional. Blanks fall back to English on the
  public site (via the existing `getLocalizedField`).

## 3. Editable content (full scope)

| Content | Fields | Public section to DB-back |
|---|---|---|
| **Gallery** | image (upload), category, alt, order, visible, delete | `Gallery.tsx` |
| **Services** | name*, description*, price, icon, order, visible | already wired (Foundation) |
| **Announcement** | active toggle, message* | new `AnnouncementBanner` on the public site |
| **Business info** | name*, phone, whatsapp, email, address, hours | `Footer`, `Contact`, `BookingForm`, `JsonLd` |
| **Hero** | image (upload) | `Hero.tsx` |
| **Testimonials** | customer_name, service, quote*, rating, order, visible, delete | `Testimonials.tsx` |
| **About** | heading*, story*, stat numbers | `About.tsx` |

`*` = trilingual text (`LocalizedInput`). Everything else is single-input.

## 4. Build order (each increment is shippable)

**v1 — the high-value core (this plan):**
1. **Admin framework** — section nav inside the `/admin` dashboard (in-page tabs, mobile-first),
   plus the three reusable pieces: `LocalizedInput`, `ImageUpload`, and admin data helpers.
2. **Gallery editor** + DB-back the public `Gallery` section. *(her real photos — highest value)*
3. **Announcement banner** editor + the public banner. *(the "closed today" notice)*
4. **Services editor**. *(prices; public side already reads the DB)*

**v2 — the rest (follow-up plan):** Business info editor (+ wire Footer/Contact/Booking/JsonLd/Hero),
Testimonials editor (+ wire Testimonials), About editor (+ wire About).

This split ships the things Mom changes most, first. The spec covers the whole vision; the plan
delivers v1, then v2.

## 5. Architecture

- **Single `/admin` route** (unchanged) — the `Dashboard` gains an in-page section switcher
  (state, not nested routes — keeps GitHub Pages happy). Sections render their editor.
- **`src/components/admin/`** — `LocalizedInput`, `ImageUpload`, the section nav, and one editor
  component per content type. Small, focused files.
- **`src/lib/admin/`** — write helpers (one module per content type or a thin generic): read-all
  (including hidden rows, via the authenticated client), create/update/delete, and `upsertSetting`.
  RLS enforces that only the admin can write; no server code needed.
- **Public sections** — each reads via the Foundation pattern: `useLiveContent(fetcher, fallback)`
  + `getLocalizedField`, with the static `data/*.ts` as fallback. A new `getSettings()`-backed
  hook feeds business info / about / hero / announcement.

## 6. Images (Supabase Storage)

- Upload to the `site-images` bucket (created + admin-policied in the Foundation).
  `supabase.storage.from('site-images').upload(path, file)` → `getPublicUrl` → store the URL in
  `gallery_images.url` (or `settings.hero.image_url`).
- Path convention: `gallery/<timestamp>-<rand>.<ext>`, `hero/<...>`. (Generate the suffix in the
  browser at upload time.)
- Client constraints: image MIME types only, max ~5 MB, with a friendly error.
- `next.config.ts` → add the Supabase Storage hostname (`riyviuoixhazwekcptzq.supabase.co`) to
  `images.remotePatterns` so `next/image` accepts the uploaded URLs. (Images already `unoptimized`.)

## 7. Settings shapes (lock now to avoid churn)

- `business_info` — as seeded (name, phone, whatsappNumber, email, address{...}, hours{time},
  experience, coordinates, mapsUrl, mapEmbedSrc, whatsappGreeting{en,hi,cg}, fullAddress).
- `announcement` — `{ active: boolean, message: {en,hi,cg} }`.
- `hero` — `{ image_url: string }`.
- `about` — `{ heading: {en,hi,cg}, story: {en,hi,cg}, stats: { experience: string, customers: string, specialties: string } }`
  (seeded during the About increment from the current `translations` + `About.tsx`).

## 8. Admin UX

- **Mobile-first** — Mom edits from her phone. Big tap targets; image upload uses the phone's
  native file/camera picker; one section visible at a time on small screens.
- **Save model** — explicit Save per item; on success, refetch that section (simpler and correct
  vs optimistic updates). Show a small "Saved" confirmation and surface errors plainly.
- **Visibility over deletion** — prefer an is_visible toggle ("show/hide") over delete for
  services; allow delete for gallery images and testimonials (with a confirm).

## 9. Security

- All writes go through the authenticated client; **RLS already restricts every write to the
  admin role** (verified in the Foundation). Storage writes are admin-only by policy. Nothing new
  to secure server-side. The admin UI is already role-gated.

## 10. Verification (per increment)

- `npm run build` green; `npm test` green.
- Manual: log in as admin → edit an item → confirm it changes on the public site; upload an image
  → confirm it appears. Confirm a non-admin/anon still cannot write (RLS).

## 11. Risks & mitigations

- **Image upload failures** (size/format/network) — client-side validation + clear errors; the
  public site keeps its last value / fallback.
- **Hydration** — public sections keep rendering the static fallback first, swap post-mount
  (unchanged Foundation pattern).
- **Admin i18n** — the admin UI itself stays English for now (Mom-facing localization is a small
  follow-up; not blocking).
- **Scope creep** — v1 is fixed to gallery/announcement/services; v2 is explicitly separate.

## 12. Out of scope

Order Book (next sub-project), customer login, automated notifications.
