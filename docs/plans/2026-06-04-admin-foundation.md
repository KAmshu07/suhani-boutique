# Admin Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Supabase backend (schema + security + auth + storage), make the public site read its content from the database, capture booking leads, and ship an admin login shell — the shared base for the CMS and Order Book.

**Architecture:** Static-exported Next.js talks to Supabase directly from the browser (publishable key), with Row Level Security as the real guard. Public content is fetched client-side over baked static defaults. A single `/admin` client route handles login.

**Tech Stack:** Next.js 16, `@supabase/supabase-js`, Supabase (Postgres + Auth + Storage), Tailwind v4, vitest (new, for pure-logic tests).

**Spec:** `docs/specs/2026-06-04-admin-foundation-design.md`

**Note on verification:** This repo has no test runner. We add `vitest` for pure-logic units (e.g. `getLocalizedField`). SQL/RLS and React-integration work are verified by `npm run build`, the RLS-proof queries in Task 12, and manual login checks — there is no DB available to unit-test against in CI.

**Blockers (user steps, Task 7):** B1 = Supabase CLI login + DB access; B2 = admin email `ritik8470@gmail.com`. Tasks 1–6 and 8–11 (code authoring) need neither; only Task 7 (apply) and the live verification in Task 12 do.

---

## File map

- Create `src/lib/supabase.ts` — singleton browser client.
- Create `src/lib/localized.ts` — `getLocalizedField` helper + types.
- Create `src/lib/content.ts` — Supabase content fetchers.
- Create `src/lib/use-content.ts` — React hooks (default → live swap).
- Create `supabase/migrations/0001_schema.sql` … `0004_storage.sql`, `supabase/seed.sql`.
- Create `src/app/admin/page.tsx` — admin route (login + shell).
- Create `src/lib/localized.test.ts` — vitest unit test.
- Modify `src/components/sections/Services.tsx` — read from DB with fallback.
- Modify `src/components/sections/BookingForm.tsx`, `src/components/sections/Contact.tsx` — persist lead.
- Modify `.github/workflows/deploy.yml` — add Supabase env vars.
- Modify `package.json` — deps + test script. Create `.env.local` (gitignored).

---

## Task 1: Supabase client, deps, and environment

**Files:**
- Modify: `package.json`
- Create: `src/lib/supabase.ts`
- Create: `.env.local` (gitignored — verify `.gitignore` already ignores `.env*`)
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Install the client**

Run: `npm install @supabase/supabase-js`
Expected: package added to `dependencies`.

- [ ] **Step 2: Create the singleton client**

Create `src/lib/supabase.ts`:

```ts
"use client";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Singleton browser client. Import only from client components so it never
// evaluates during static prerender. Security is enforced by RLS, not this key.
export const supabase = createClient(url, key);
```

- [ ] **Step 3: Local env**

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://riyviuoixhazwekcptzq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_0lh-xvr-uZlhmW120SnEXg_ZitHnzSh
```

- [ ] **Step 4: CI env** — in `.github/workflows/deploy.yml`, add to the `Build static export` step's `env:` block (alongside `NEXT_PUBLIC_BASE_PATH`):

```yaml
          NEXT_PUBLIC_SUPABASE_URL: https://riyviuoixhazwekcptzq.supabase.co
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: sb_publishable_0lh-xvr-uZlhmW120SnEXg_ZitHnzSh
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: green (client compiles; unused for now is fine).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/supabase.ts .github/workflows/deploy.yml
git commit -m "feat: add supabase browser client and env wiring"
```

---

## Task 2: Supabase CLI init + schema migration

**Files:** Create `supabase/migrations/0001_schema.sql` (+ `supabase init` scaffolding).

- [ ] **Step 1: Init CLI scaffolding** (no network)

Run: `npx supabase init` (creates `supabase/config.toml`, `supabase/migrations/`). Accept defaults; decline VS Code settings prompt.

- [ ] **Step 2: Write the schema migration**

Create `supabase/migrations/0001_schema.sql`:

```sql
-- profiles: one row per auth user; role drives admin checks
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer','admin')),
  name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- customers: phone is the unique identity; auth_user_id reserved for future login
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  notes text,
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- booking_requests: public-form leads
create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text not null,
  service_slug text,
  requested_date date,
  message text,
  status text not null default 'new' check (status in ('new','contacted','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index booking_requests_status_idx on public.booking_requests(status);

-- services: CMS content; name/description trilingual; price is a display string
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  description jsonb,
  price text,
  image_url text,
  display_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text,
  url text,
  category text not null check (category in ('bridal','festival','daily','alterations','fabric')),
  alt text,
  display_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  service text,
  quote jsonb,
  rating int check (rating between 1 and 5),
  is_visible boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
```

- [ ] **Step 3: Commit** (apply happens in Task 7)

```bash
git add supabase/config.toml supabase/migrations/0001_schema.sql
git commit -m "feat: foundation database schema migration"
```

---

## Task 3: Functions & triggers migration

**Files:** Create `supabase/migrations/0002_functions.sql`.

- [ ] **Step 1: Write functions/triggers**

Create `supabase/migrations/0002_functions.sql`:

```sql
-- updated_at maintenance
create or replace function public.set_updated_at() returns trigger
  language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_customers_updated before update on public.customers for each row execute function public.set_updated_at();
create trigger trg_booking_updated before update on public.booking_requests for each row execute function public.set_updated_at();
create trigger trg_services_updated before update on public.services for each row execute function public.set_updated_at();
create trigger trg_gallery_updated before update on public.gallery_images for each row execute function public.set_updated_at();
create trigger trg_testimonials_updated before update on public.testimonials for each row execute function public.set_updated_at();
create trigger trg_settings_updated before update on public.settings for each row execute function public.set_updated_at();

-- is_admin(): SECURITY DEFINER + fixed search_path. The DEFINER context makes the
-- internal profiles read bypass RLS, so it does NOT recurse with profiles policies.
create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

-- auto-create a profile for every new auth user (resolves user<->profile FK ordering)
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role) values (new.id, 'customer')
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0002_functions.sql
git commit -m "feat: is_admin, profile auto-provision, updated_at triggers"
```

---

## Task 4: RLS policies migration

**Files:** Create `supabase/migrations/0003_rls.sql`.

- [ ] **Step 1: Write RLS**

Create `supabase/migrations/0003_rls.sql`:

```sql
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.booking_requests enable row level security;
alter table public.services enable row level security;
alter table public.gallery_images enable row level security;
alter table public.testimonials enable row level security;
alter table public.settings enable row level security;

-- profiles
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_select_admin on public.profiles for select using (public.is_admin());
create policy profiles_update_own_no_role on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
create policy profiles_admin_write on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- content: public read visible rows (admin reads all), admin writes
create policy services_public_read on public.services for select using (is_visible or public.is_admin());
create policy services_admin_write on public.services for all using (public.is_admin()) with check (public.is_admin());
create policy gallery_public_read on public.gallery_images for select using (is_visible or public.is_admin());
create policy gallery_admin_write on public.gallery_images for all using (public.is_admin()) with check (public.is_admin());
create policy testimonials_public_read on public.testimonials for select using (is_visible or public.is_admin());
create policy testimonials_admin_write on public.testimonials for all using (public.is_admin()) with check (public.is_admin());

-- settings: world-readable (non-secret only), admin writes
create policy settings_public_read on public.settings for select using (true);
create policy settings_admin_write on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- customers: admin only
create policy customers_admin_all on public.customers for all using (public.is_admin()) with check (public.is_admin());

-- booking_requests: anyone can submit a lead; only admin can read/manage
create policy booking_insert_anon on public.booking_requests for insert with check (true);
create policy booking_admin_read on public.booking_requests for select using (public.is_admin());
create policy booking_admin_update on public.booking_requests for update using (public.is_admin()) with check (public.is_admin());
create policy booking_admin_delete on public.booking_requests for delete using (public.is_admin());
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0003_rls.sql
git commit -m "feat: row level security policies"
```

---

## Task 5: Storage bucket + policies migration

**Files:** Create `supabase/migrations/0004_storage.sql`.

- [ ] **Step 1: Write storage setup**

Create `supabase/migrations/0004_storage.sql`:

```sql
insert into storage.buckets (id, name, public) values ('site-images','site-images', true)
  on conflict (id) do nothing;

create policy site_images_public_read on storage.objects for select using (bucket_id = 'site-images');
create policy site_images_admin_insert on storage.objects for insert
  with check (bucket_id = 'site-images' and exists (select 1 from public.profiles where id = auth.uid() and role='admin'));
create policy site_images_admin_update on storage.objects for update
  using (bucket_id = 'site-images' and exists (select 1 from public.profiles where id = auth.uid() and role='admin'));
create policy site_images_admin_delete on storage.objects for delete
  using (bucket_id = 'site-images' and exists (select 1 from public.profiles where id = auth.uid() and role='admin'));
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0004_storage.sql
git commit -m "feat: site-images storage bucket and policies"
```

---

## Task 6: Idempotent seed

**Files:** Create `supabase/seed.sql`.

- [ ] **Step 1: Read the current data** — read `src/data/services.ts`, `src/data/translations.ts` (for `services.*` names/descriptions), `src/data/business-info.ts`, `src/data/gallery.ts` to source exact values.

- [ ] **Step 2: Write the seed** — Create `supabase/seed.sql`. Use the trilingual `name`/`description` from `translations.ts`, prices from `services.ts`, business info from `business-info.ts`, the 9 gallery URLs from `gallery.ts`. Pattern (fill values from the data files):

```sql
-- services (one row per entry in data/services.ts; name/description from translations.ts)
insert into public.services (slug, name, description, price, display_order) values
  ('custom_stitching',
   '{"en":"Custom Stitching","hi":"कस्टम सिलाई","cg":"कस्टम सिलाई"}'::jsonb,
   '{"en":"…","hi":"…","cg":"…"}'::jsonb,
   'From ₹500', 1)
  -- … remaining services …
on conflict (slug) do nothing;

-- settings singletons
insert into public.settings (key, value) values
  ('business_info', '{ … from data/business-info.ts … }'::jsonb),
  ('about',         '{ … about heading/story/stats … }'::jsonb),
  ('hero',          '{"image_url":"https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=1920&q=80"}'::jsonb),
  ('announcement',  '{"active":false,"message":{"en":"","hi":"","cg":""}}'::jsonb)
on conflict (key) do nothing;

-- gallery (9 Unsplash items from data/gallery.ts)
insert into public.gallery_images (url, category, alt, display_order) values
  ('https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop&q=80','bridal','Bridal lehenga with intricate embroidery',1)
  -- … remaining 8 …
on conflict do nothing;

-- testimonials: none (intentionally empty)
```

- [ ] **Step 3: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat: idempotent seed from current site content"
```

---

## Task 7: [USER + APPLY] Apply migrations, create admin, promote

> This task needs **B1** (Supabase access) and **B2** (`ritik8470@gmail.com`). User runs the secret-touching steps; password never enters chat/code.

- [ ] **Step 1 (user):** `npx supabase login` (opens browser).
- [ ] **Step 2 (user):** `npx supabase link --project-ref riyviuoixhazwekcptzq` (enter DB password when prompted — stays local).
- [ ] **Step 3 (apply):** `npx supabase db push` — applies migrations 0001–0004. *(If `db push` re-prompts for the DB password, user runs it.)* Runs as the privileged migration role → bypasses RLS.
- [ ] **Step 4 (user):** In the Supabase dashboard → Authentication → Users → **Add user**: email `ritik8470@gmail.com`, set a password, enable "Auto Confirm". The `handle_new_user` trigger auto-creates her `profiles` row.
- [ ] **Step 5 (seed + promote):** Run `supabase/seed.sql` and the promote statement in the dashboard SQL editor (runs as `postgres`, bypasses RLS):

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'ritik8470@gmail.com');
```

- [ ] **Step 6 (verify):** In the dashboard SQL editor: `select slug from public.services;` returns the seeded rows; `select role from public.profiles where role='admin';` returns one row.

---

## Task 8: Content library + localized helper (with unit test)

**Files:**
- Create: `src/lib/localized.ts`, `src/lib/localized.test.ts`
- Create: `src/lib/content.ts`, `src/lib/use-content.ts`
- Modify: `package.json` (vitest)

- [ ] **Step 1: Add vitest**

Run: `npm install -D vitest` then add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 2: Write the failing test**

Create `src/lib/localized.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getLocalizedField } from "./localized";

describe("getLocalizedField", () => {
  it("returns the value for the requested language", () => {
    expect(getLocalizedField({ en: "Hi", hi: "नमस्ते", cg: "नमस्ते" }, "hi")).toBe("नमस्ते");
  });
  it("falls back to en when the language is missing", () => {
    expect(getLocalizedField({ en: "Hi" } as never, "cg")).toBe("Hi");
  });
  it("returns empty string for nullish input", () => {
    expect(getLocalizedField(null, "en")).toBe("");
  });
});
```

- [ ] **Step 3: Run — verify it fails**

Run: `npm test`
Expected: FAIL ("getLocalizedField is not a function" / module not found).

- [ ] **Step 4: Implement the helper**

Create `src/lib/localized.ts`:

```ts
import type { Language } from "@/data/types";

export type Localized = Record<Language, string>;

// CMS content is stored as {en,hi,cg}. UI strings stay in translations.ts via t().
export function getLocalizedField(
  value: Partial<Localized> | null | undefined,
  language: Language,
): string {
  if (!value) return "";
  return value[language] ?? value.en ?? "";
}
```

*(If `Language` is not exported from `@/data/types`, define `type Language = "en" | "hi" | "cg"` locally and reconcile with `data/constants.ts` LANGUAGE.)*

- [ ] **Step 5: Run — verify it passes**

Run: `npm test`
Expected: PASS (3 tests).

- [ ] **Step 6: Content fetchers**

Create `src/lib/content.ts`:

```ts
import { supabase } from "@/lib/supabase";

export async function getServices() {
  const { data, error } = await supabase
    .from("services").select("*").eq("is_visible", true).order("display_order");
  if (error) throw error;
  return data;
}
export async function getGallery() {
  const { data, error } = await supabase
    .from("gallery_images").select("*").eq("is_visible", true).order("display_order");
  if (error) throw error;
  return data;
}
export async function getTestimonials() {
  const { data, error } = await supabase
    .from("testimonials").select("*").eq("is_visible", true).order("display_order");
  if (error) throw error;
  return data;
}
export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("key,value");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}
```

- [ ] **Step 7: The hook**

Create `src/lib/use-content.ts`:

```ts
"use client";
import { useEffect, useState } from "react";

// Generic: render `fallback` first (matches SSR), swap to live DB data post-mount.
// On error, stay on fallback silently. Fetch runs once per mount.
export function useLiveContent<T>(fetcher: () => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    let alive = true;
    fetcher().then((d) => alive && setData(d)).catch((e) => {
      if (alive) { setError(e); if (process.env.NODE_ENV !== "production") console.warn("content fetch failed", e); }
    });
    return () => { alive = false; };
  }, [fetcher]);
  return { data, error };
}
```

- [ ] **Step 8: Verify + commit**

Run: `npm test && npm run build`
Expected: tests pass, build green.

```bash
git add package.json package-lock.json src/lib/localized.ts src/lib/localized.test.ts src/lib/content.ts src/lib/use-content.ts
git commit -m "feat: content fetch layer, localized helper, vitest"
```

---

## Task 9: Wire the Services section to the database (proof)

**Files:** Modify `src/components/sections/Services.tsx`.

- [ ] **Step 1:** Read `src/components/sections/Services.tsx` to learn its current shape (it imports `services` from `data/services.ts` and renders names via `t('services.'+key)`).

- [ ] **Step 2:** Add a stable fetcher (module scope, so the hook dep is stable) and consume the hook, falling back to the static `services` import. Map DB rows to the render via `getLocalizedField(row.name, language)` / `getLocalizedField(row.description, language)`; keep the existing static import as the fallback value passed to `useLiveContent`. Preserve all existing styling/markup.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: green. (Live DB read verified in Task 12 against the seeded data.)

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Services.tsx
git commit -m "feat: services section reads live content with static fallback"
```

---

## Task 10: Persist booking & contact leads

**Files:** Modify `src/components/sections/BookingForm.tsx`, `src/components/sections/Contact.tsx`.

- [ ] **Step 1:** In `BookingForm.tsx` `handleSubmit`, before opening WhatsApp, insert a lead (fire-and-forget, never block the WhatsApp open):

```ts
supabase.from("booking_requests").insert({
  name, phone, service_slug: service || null, requested_date: date || null, message: message || null,
}).then(({ error }) => { if (error && process.env.NODE_ENV !== "production") console.warn("lead save failed", error); });
```

- [ ] **Step 2:** In `Contact.tsx` `handleSubmit`, the same with its fields (`name`, `phone`, `message`; no service/date).

- [ ] **Step 3: Verify build + commit**

Run: `npm run build` → green.

```bash
git add src/components/sections/BookingForm.tsx src/components/sections/Contact.tsx
git commit -m "feat: persist booking and contact leads to booking_requests"
```

---

## Task 11: Admin route — login + dashboard shell

**Files:** Create `src/app/admin/page.tsx`.

- [ ] **Step 1:** Create `src/app/admin/page.tsx` (`"use client"`): on mount, read session via `supabase.auth.getSession()` and subscribe to `onAuthStateChange`. If no session → render an email+password login form calling `supabase.auth.signInWithPassword`. If session present → render a minimal dashboard shell ("Welcome" + a Logout button calling `supabase.auth.signOut()`), with placeholder tab labels (Site Control, Order Book) to be filled in later phases. First paint must be the login view (no auth access during prerender). Respect `basePath` for any links.

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: green; `/admin` appears in the route list and exports to `out/admin/index.html`.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: admin route with login and dashboard shell"
```

---

## Task 12: Final verification & deploy

- [ ] **Step 1: Build + tests**

Run: `npm test && MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*' NEXT_PUBLIC_BASE_PATH=/suhani-boutique NEXT_PUBLIC_SITE_URL=https://kamshu07.github.io/suhani-boutique NEXT_PUBLIC_SUPABASE_URL=https://riyviuoixhazwekcptzq.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_0lh-xvr-uZlhmW120SnEXg_ZitHnzSh npm run build`
Expected: tests pass; `out/` produced; `out/admin/index.html` exists.

- [ ] **Step 2: RLS proof** (dashboard SQL editor → run as `anon` role, or via a small script using the publishable key):
  - `select * from customers` → 0 rows / forbidden.
  - `select * from profiles` → 0 rows.
  - `select * from services where is_visible` → rows.
  - `select * from settings` → rows.
  - `insert into booking_requests(phone) values ('9999999999')` (anon) → succeeds.
  - `insert into services(slug,name) values ('x','{}')` (anon) → blocked.

- [ ] **Step 3: Manual** — `npm run dev`, open `/admin`, log in as `ritik8470@gmail.com`, confirm dashboard shows and session survives a refresh. Submit the public booking form; confirm a `booking_requests` row appears and WhatsApp still opens. Confirm the Services section renders (DB or fallback).

- [ ] **Step 4: Push (auto-deploys)**

```bash
git push
```
Then confirm the GitHub Actions run is green and the live site still serves.

---

## Self-review notes

- **Spec coverage:** every spec section maps to a task (schema→T2, functions/RLS/storage→T3–5, seed→T6, apply/auth→T7, content layer→T8, content read→T9, lead capture→T10, admin shell→T11, verify→T12, env→T1).
- **Order schema** is intentionally absent (deferred to Order Book per spec §16).
- **No DB unit tests** — verified via build + RLS-proof queries + manual; `getLocalizedField` is the one pure unit (vitest).
- **Type consistency:** `getLocalizedField(Localized, Language)` used identically in T8/T9; `useLiveContent<T>(fetcher, fallback)` used in T9.
