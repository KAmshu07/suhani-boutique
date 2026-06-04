# Admin Foundation — Design Spec

- **Date:** 2026-06-04
- **Status:** Design approved; revised after a 5-dimension adversarial review
- **Repo:** `suhani-boutique` (Next.js 16, static export, GitHub Pages)
- **Author:** Claude (with Amritanshu)

## 1. Context & Goal

The public site is live at `kamshu07.github.io/suhani-boutique/`. We now build the admin
system as three sub-projects on a shared base:

1. **Foundation** (this spec) — Supabase wiring, the database schema for **content + customers +
   lead capture**, security rules, admin login, and the bridge that lets the public site read its
   content from the database.
2. **Site Control (CMS)** — screens where Mom edits site content.
3. **Order Book** — customers' orders, garments, payments, status lifecycle.

**Build order:** Foundation → Site Control → Order Book.

> **Scope decision (from review):** The **orders / order_items / payments** schema is intentionally
> **NOT** built in the Foundation. Real tailoring needs multiple garments per order and a payment
> ledger (advance/balance); designing that half-way now would force migration rework. The Foundation
> establishes the **customer identity** and content; the Order Book phase designs orders properly on
> top of it. Section 16 records the intended forward-compatible shape so nothing we build now blocks it.

## 2. Inherited principles (non-negotiable)

- Data 100% separate from logic; `data/` has zero imports/functions. Logic in `lib/`.
- Centralize string literals/enums in `data/constants.ts`; the DB mirrors these exact values.
- Extend existing code; never create parallel implementations.
- Static-export friendly — everything works on GitHub Pages (no Node server at runtime).
- **Security is RLS-first.** The browser uses the *publishable* (public) key; Row Level Security is
  the real guard. No secret keys ship to the client.

## 3. Architecture overview

```
Public static site (GitHub Pages)
  ├─ reads published content ───────────►  Supabase Postgres (RLS: public SELECT where is_visible)
  └─ writes booking/contact leads ──────►  Supabase Postgres (RLS: anon INSERT-only on booking_requests)

/admin (client-rendered SPA)
  └─ auth + read/write (admin via RLS) ─►  Supabase Auth + Postgres + Storage
```

- Public pages: statically exported HTML with baked default content (SEO + instant paint), then a
  client-side refresh from Supabase so Mom's edits appear live.
- Admin: a single client-rendered `/admin` route; sub-areas are in-page tabs (no nested URL routes).
- Secret-requiring work (future automated WhatsApp/SMS) → Supabase Edge Functions, never the client.

## 4. Customer identity (keystone)

- **Phone number is the unique identity** (`customers.phone` UNIQUE NOT NULL).
- A customer record accumulates history (name, notes, later: orders/measurements).
- **Forward-compatible with future customer login:** `customers.auth_user_id uuid` (nullable, FK to
  `auth.users`). Unused now; lets phone-OTP customer login link to the existing record with no rework.

## 5. Data model — Foundation tables

Enums = `text` columns with `CHECK` constraints mirroring `data/constants.ts` exactly.
All ids `uuid default gen_random_uuid()`. All tables: `created_at timestamptz default now()`;
mutable tables also `updated_at timestamptz default now()` maintained by a shared trigger (§7).

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | `id` PK = `auth.users.id`, `role` ('customer'\|'admin' default 'customer'), `name`, `phone` | auto-created by trigger on signup |
| `customers` | `phone` UNIQUE NOT NULL, `name`, `notes`, `auth_user_id` (nullable FK) | the customer record |
| `booking_requests` | `name`, `phone`, `service_slug`, `requested_date`, `message`, `status` ('new'\|'contacted'\|'archived' default 'new') | captures public form leads |
| `services` | `slug` UNIQUE, `name jsonb {en,hi,cg}`, `description jsonb`, `price text`, `image_url`, `display_order int`, `is_visible bool default true` | CMS content; `price` is a display string ("From ₹500") |
| `gallery_images` | `storage_path`, `url`, `category` (CHECK ∈ GALLERY_CATEGORY), `alt`, `display_order int`, `is_visible bool default true` | images in Storage |
| `testimonials` | `customer_name`, `service` (text), `quote jsonb {en,hi,cg}`, `rating int CHECK 1..5`, `is_visible bool default true`, `display_order int` | empty until real reviews |
| `settings` | `key text PK`, `value jsonb`, `updated_at` | singletons: `business_info`, `about`, `hero`, `announcement` |

Indexes: `customers.phone` (unique), `booking_requests.status`, `services.slug` (unique),
`settings.key` (PK), `*.display_order`.

**Deletes:** hard-delete for now (small data, single operator). A `deleted_at` soft-delete column is
noted as a future option for `customers` once Order Book history exists (§16); not in Foundation.

**`settings` is publicly readable** — store ONLY non-secret business metadata. **Never** put API
keys, tokens, or payment credentials in `settings` (they would be world-readable). Enforced by review.

## 6. Security (RLS) — concrete patterns

RLS **enabled on every table**; default deny. Helper function, hardened against `search_path`
injection and recursion (it is `SECURITY DEFINER`, so its internal `profiles` read bypasses RLS — no
recursion with profiles policies):

```sql
create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;
```

Policies:
- **Public content (anon + authenticated):** `SELECT` on `services`/`gallery_images`/`testimonials`
  where `is_visible = true`; `SELECT` on `settings` (all rows).
- **`booking_requests`:** `INSERT` allowed for `anon` (public form submits leads) with
  `WITH CHECK (true)`; `SELECT/UPDATE/DELETE` admin-only. (Spam is low-stakes; rate-limit/captcha is a
  future hardening, noted in §15.)
- **`customers`:** admin-only for all operations (`USING is_admin()` / `WITH CHECK is_admin()`).
- **`profiles`:** `SELECT`/`UPDATE` own row (`auth.uid() = id`); admins `SELECT` all (`is_admin()`).
  Role is **not** self-elevatable — the own-row `UPDATE` policy uses
  `WITH CHECK (auth.uid() = id AND role = (select role from public.profiles where id = auth.uid()))`,
  so a non-admin cannot change their own `role`.
- **Content write (`services`/`gallery_images`/`testimonials`/`settings`):** all of
  `INSERT/UPDATE/DELETE` gated by `is_admin()`.
- **Storage** (`site-images` bucket): public read; write/delete only for admins. Storage policies
  reference the profiles table directly (they cannot call `is_admin()` the same way):
  ```sql
  -- on storage.objects, for INSERT/UPDATE/DELETE where bucket_id = 'site-images':
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') )
  ```

## 7. Profiles auto-provision + updated_at trigger

- **Auto-create profile on signup** (resolves the admin user↔profile FK ordering): a trigger on
  `auth.users` inserts a `profiles` row (`id`, `role='customer'`) for every new auth user. Mom's
  profile is then promoted with `update profiles set role='admin' where id = '<her uuid>'`.
  ```sql
  create function public.handle_new_user() returns trigger
    language plpgsql security definer set search_path = public as $$
    begin insert into public.profiles (id, role) values (new.id, 'customer')
      on conflict (id) do nothing; return new; end $$;
  create trigger on_auth_user_created after insert on auth.users
    for each row execute function public.handle_new_user();
  ```
- **`updated_at` trigger** (shared) on mutable tables (`profiles`, `customers`, `services`,
  `gallery_images`, `testimonials`, `settings`, `booking_requests`):
  `before update ... set new.updated_at = now()`.

## 8. Authentication

- Supabase Auth, **email + password**. Mom's auth user is created first (needs her email, **B2**);
  the trigger creates her profile; we promote it to `role='admin'`.
- Session persistence + token refresh handled by `supabase-js` (localStorage). She logs in once.
- `/admin` is client-gated (login vs dashboard); data is protected by RLS regardless.

## 9. Supabase client & environment

- Add dependency `@supabase/supabase-js`.
- `lib/supabase.ts` (top-level `"use client"`): a **singleton** browser client from
  `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Import only from client
  components (never Server Components) so it never evaluates during static prerender.
- `.env.local` (gitignored) for local dev.
- **CI:** add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the
  `deploy.yml` build env (same block as `NEXT_PUBLIC_BASE_PATH`). Publishable key is public-safe.

## 10. Content delivery (decision A) — concrete architecture

- `lib/content.ts`: `getServices()`, `getGallery()`, `getTestimonials()`, `getSettings()` (each
  queries Supabase via the singleton client, returns rows with **all** language values intact).
- `lib/use-content.ts`: a hook per content type (or one `useContent`) that:
  1. **Initial state = the `data/*.ts` static default** (so SSR/export output matches first client
     render → no hydration mismatch; the language baseline is `DEFAULT_LANGUAGE` exactly like the
     existing `i18n` `getServerSnapshot`).
  2. **Fetches from Supabase in a post-mount `useEffect`** and swaps state. Fetch runs **once per
     mount**, not per render and not per language toggle (content holds all languages).
  3. Returns `{ data, isLoading, error }`. On error, **stays on the baked defaults silently**
     (best-effort; `console.warn` under a debug flag). Reasonable fetch timeout (~5s) then fall back.
- **Trilingual content vs UI strings (clear boundary):**
  - **UI labels** (nav, buttons, form labels) stay in `data/translations.ts`, accessed via `t(key)`.
  - **CMS content** (service names, descriptions, testimonials) comes from DB `jsonb {en,hi,cg}`,
    accessed via a helper `getLocalizedField(value, language)` (in `lib/`). Components do
    `getLocalizedField(service.name, language)` instead of `t('services.' + key)`.
  - During Site Control wiring, the `services.*` *name* entries in `translations.ts` are retired in
    favour of DB content; UI labels remain.
- **`data/*.ts` lifecycle:** it is the **seed source** AND the **last-known-good static fallback
  snapshot** — *not* a live mirror. After Mom edits, the DB is the source of truth; the baked
  fallback may be stale if Supabase is unreachable (acceptable for a static site). To stay usable as
  a fallback, `data/*.ts` shapes must match the DB shape (e.g., service price as a display string).

## 11. Static export + admin SPA on GitHub Pages

- Single `/admin` route (`"use client"`); login/dashboard/CMS/orders are in-page view state, not
  nested routes — avoids GitHub Pages deep-link 404s. First paint renders the login view (no auth
  access at build time); auth state is restored from localStorage after hydration.
- `output: 'export'` and env-driven `basePath` (`/suhani-boutique`) already configured; admin links
  must respect `basePath`.
- A "back to admin home" affordance compensates for the single-route (no deep-link) constraint.

## 12. Migrations, seed & the RLS/ordering gotchas

- Schema as version-controlled migrations under `supabase/migrations/*.sql` (run `supabase init` +
  `supabase link <ref>` once to create `supabase/config.toml`).
- **Seeding runs as the `postgres` role** — both the Supabase dashboard SQL editor and applied
  migrations execute with privileges that **bypass RLS**, so seed `INSERT`s are **not** blocked.
  (Never seed using the anon client.)
- **Idempotent seed:** every seed insert uses `ON CONFLICT (<unique>) DO NOTHING` (e.g.
  `services.slug`, `settings.key`) so re-running is safe.
- **Seed fidelity:** seed `services` (6, from `data/services.ts`), `settings`
  (`business_info`/`about`/`hero`/`announcement`) so the live site looks identical after switch-over.
  `gallery_images`: seed the **current 9 Unsplash items** (same URLs/categories/alt) so the gallery is
  unchanged until Mom uploads real photos. `testimonials`: none (empty, matches current).

## 13. Build sequence (Foundation)

1. Add `@supabase/supabase-js`; author `lib/supabase.ts` (singleton client); add `.env.local` and the
   two `NEXT_PUBLIC_SUPABASE_*` vars to `deploy.yml`. *(no blocker)*
2. `supabase init` + author migrations (schema + CHECKs + `is_admin()` + triggers + RLS policies +
   storage bucket/policies) and an idempotent seed file. *(no blocker)*
3. **Create Mom's auth user** (needs **B2** email) → note her UUID. *(blocker B2)*
4. **Apply migrations + seed** to Supabase via CLI link or dashboard paste; then promote Mom's
   profile to `role='admin'`. *(blocker B1)*
5. Create the `site-images` Storage bucket + policies. *(B1)*
6. `lib/content.ts` + `lib/use-content.ts` + `getLocalizedField`; wire **one** public section
   (Services) to read from the DB as proof, keeping the static fallback. *(after 1–4)*
7. Wire the public **booking + contact forms** to also persist a `booking_requests` row (anon
   INSERT) in addition to opening WhatsApp — lead capture, no lost data.
8. `/admin` route: login form + authenticated empty dashboard shell.
9. **Verify** (§14).

## 14. Verification (must pass before "done")

- `npm run build` green (static export produces `out/`).
- Login works; session persists across refresh.
- **RLS proof (anon/publishable key):** `select * from customers` and `from profiles` → 0 rows;
  `select * from services where is_visible` → rows; `from settings` → rows; anon `insert into
  booking_requests` → succeeds; anon `insert into services` → blocked.
- A booking-form submission creates a `booking_requests` row and still opens WhatsApp.
- Public Services section renders DB content (and falls back to defaults if Supabase is blocked).

## 15. Risks & mitigations

- **Trilingual editing UX** (Mom editing 3 languages/field) — addressed in Site Control design.
- **Client-fetch flash / SEO** — Google indexes the EN static snapshot; live edits show to users but
  not crawlers until rebuild. Mitigate: pre-populate gallery/testimonials before launch; Alternative
  B (rebuild-on-publish) is the future upgrade. Documented expectation, not a blocker.
- **`booking_requests` spam** (anon INSERT) — low stakes; add captcha/rate-limit later if abused.
- **Static-export auth deep-linking** — mitigated by the single `/admin` route.
- **Role self-escalation** — prevented by the `WITH CHECK` role-equality policy (§6).
- **Future customer phone-OTP login** will need Supabase redirect URLs registered **with basePath**
  (`…/suhani-boutique/…`) — noted for the Customer Login phase.

## 16. Forward-compatible shapes (designed later, must not be blocked now)

- **Order Book:** `orders` (header: customer_id, order_date, due_date, status, notes) → has many
  `order_items` (garment_type, description, price, measurements jsonb, status, due/delivered dates).
  `payments` ledger (order_id, amount, method cash|upi, received_date, notes); `orders.amount_paid`
  derived from it. `order_status_history` for the status timeline + WhatsApp-sent record. Order's
  service reference is a **loose** `service_slug` (snapshot the name onto the item) so Mom can edit/
  delete services without breaking historical orders.
- **Customer login:** flip `customers.auth_user_id`, add customer-scoped RLS (`SELECT` own
  orders/customer where `auth_user_id = auth.uid()`), and phone-OTP auth.
- **`booking_requests` → order:** Mom converts a lead into a customer + order in one action.

## 17. Out of scope (later sub-projects)

CMS edit screens, order/customer management UI, measurements UI, payments UI, WhatsApp click-to-send,
customer login, automated notifications.

## 18. Blockers requiring the user

- **B1 — Supabase DB access** to apply migrations/seed: link the Supabase CLI (`supabase login` +
  DB password entered locally, never shared) **or** paste generated SQL into the dashboard SQL editor.
- **B2 — Mom's admin email** (dedicated Gmail / her own / the temporary one).
- **Parallel (not a blocker):** real photos / services / prices.
