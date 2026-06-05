# Admin Usability Foundation — Design Spec

- **Date:** 2026-06-05
- **Status:** Implemented 2026-06-05 (build, lint, and tests green; quality-reviewed)
- **Repo:** `suhani-boutique` (Next.js 16.2.2, static export, GitHub Pages; React 19; Tailwind v4)
- **Author:** Claude (with Amritanshu)
- **Informed by:** a 12-agent deep UX audit + external research (see `§13`), every critical finding re-verified against source.

## 1. Context & Goal

The admin (`/admin`) already exists and works for the developer: orders, customers, leads, and a
CMS ("Site Control"), all on Supabase with an `is_admin()` RLS gate. But it was built developer-first.
The business owner — **"Mummy"**, a ~50+ professional tailor, not technically literate, running
50–100+ live orders alone on a phone — is effectively locked out of her own back-office.

This spec is **Phase A** of a two-phase redesign (`A → B`, owner-approved):

- **Phase A — Usability Foundation (this spec):** fix the cross-cutting primitives every admin screen
  shares so the *current* single UI becomes correct, legible, safe, and operable without reading-fluency.
  Built **B-aware**.
- **Phase B — Simple / Expert split (separate spec, next):** behind the existing `role` flag, a
  Hindi-/visual-first Simple Mode (Today landing, one-task-per-screen flows, voice, first-run hints) for
  Mummy and a dense Expert Mode (tables, hotkeys, bulk actions) for the developer — same data layer.

**Phase A goal:** Make the existing admin operable by Mummy **without slowing the developer down**, by
reducing the UI's dependence on reading and giving every action a visible, demonstrated result —
"not only tell them, but **show** them."

## 2. The reprioritization decision (audience truth)

The audit's headline finding was "the admin is English-only" (#1 barrier). The owner — who knows the
actual user — judged that **language is not the primary barrier**, and that is correct for this user:

> For someone who reads **slowly in any language**, swapping English words for Hindi words still leaves
> her reading. The real lever is making the screen **not depend on reading at all**: icon + position +
> colour + a visible result + demonstration. This is language-independent and matches the research on
> low-literate users (Microsoft Research; W3C COGA "pair every icon with a word") better than the
> audit's headline did.

**Consequences for scope:**

- **Keep** the existing switchable EN/HI/CG i18n system exactly as it is. **Default English.**
- **Do NOT** translate admin chrome (no `admin.*` namespace), **do NOT** default the admin to Hindi,
  **do NOT** extract a shared admin language switcher. Admin chrome stays English.
- The real work is the **language-independent** primitives in `§5`–`§7`.
- Two small items that *touch* language are kept for **non-language** reasons and are called out as such
  in `§5.8` (a status source-of-truth **bug**) and `§5.2` (a public-site **typography** fix). Either can
  be cut from Phase A on request.

## 3. Inherited principles (non-negotiable)

From the repo's architecture rules and prior specs:

- Data 100% separate from logic; `data/` has zero imports/functions. Logic in `lib/`. Components in
  `components/`. Strict dependency hierarchy: `data/ ← lib/ ← components/ ← app/`.
- **Centralize string literals, enums, and CSS classes** in `data/constants.ts`. No raw repeated
  literals in logic.
- **Extend existing code; never create parallel implementations.** Any new abstraction requires a
  written justification (`§10`).
- **Static-export friendly** — everything runs client-side on GitHub Pages; no Node server at runtime.
- Security unchanged: RLS is the guard; this phase is presentation only and adds **no** new data access.

## 4. Audiences (Phase A success criteria)

| Audience | Phase A must deliver |
|---|---|
| **Mummy** (primary) | Can read the controls (size/contrast), can tell what each does (icon + word), cannot silently corrupt data (view-vs-change separation, confirms), and always sees that an action worked (green ✓). |
| **Normal helper** | Strictly better; no relearning; the same one save model everywhere. |
| **Developer** | Not slowed down. Gains contrast/focus/keyboard-safety. No density loss (true density/table work is Phase B; Phase A must not regress speed). |

## 5. Design — shared primitives

These are the heart of Phase A. Each is a single source reused everywhere; together they also make
Phase B cheap.

### 5.1 Button classes as constants — fixes contrast + duplication at once

- **Problem (verified):** primary buttons are `bg-gold text-cream` = **2.53:1** contrast (fails WCAG
  1.4.3's 4.5:1), and the literal is copy-pasted across ~10 files.
- **Fix:** add to `data/constants.ts`:
  ```ts
  export const ADMIN_BTN = {
    PRIMARY: "...",   // brown-on-gold or cream-on-brown, ≥4.5:1, ≥44px height, ≥16px text
    SECONDARY: "...",
    DANGER: "...",    // destructive red, ≥4.5:1
  } as const;
  ```
  Replace every duplicated button literal in the admin with `ADMIN_BTN.*`. This satisfies the repo's
  "CSS classes live in constants" rule and the contrast SC in one change.

### 5.2 Global CSS — focus ring + Devanagari (`globals.css`)

- **Focus ring (language-independent, required):** add a single `:focus-visible` rule (≥3:1, 2px ring +
  2px offset) and stop relying on bare `focus:outline-none` with no replacement. Helps the developer's
  keyboard use and makes landing on **Delete** safe. Applies app-wide.
- **Devanagari (public-site typography fix — keepable or cuttable):** the Tiro Devanagari font is loaded
  (`layout.tsx`) and declared (`globals.css --font-hindi`) but applied to **nothing**, so when a
  customer switches the **live public site** to Hindi/CG the text renders in a system fallback font, not
  the chosen Tiro face. Add:
  ```css
  :lang(hi), :lang(cg) { font-family: var(--font-hindi); line-height: 1.7; }
  ```
  `i18n.setLanguage` already sets `document.documentElement.lang`, so this lights up sitewide. This is a
  **typography** fix, not admin-language work; **may be cut from Phase A** if the owner wants Phase A
  strictly admin-only.

### 5.3 `SaveState` / `SaveButton` — one save model + the primary "show"

- **Decision:** one explicit save model app-wide (owner choice). Concretely, the consistent, cued rule:
  - **Typed edits never auto-commit.** Each editable card has a large **Save** button.
  - **Discrete actions** (advance stage, add payment, add garment, convert lead, delete) commit on the
    single tap they already are — they are not "edits" and get no second Save step.
  - **Every commit shows the same prominent result** at the point of action: idle → *saving…* →
    **green ✓ "Saved"** → friendly red error (raw Supabase errors mapped to plain copy).
  > *Confirmed (owner sign-off 2026-06-05):* "explicit Save for typed edits; one-tap + green ✓ for
  > discrete actions." Removes today's invisible `onBlur` auto-save.
- **New shared component** `components/admin/SaveState.tsx` (+ a `SaveButton` wrapper). Replaces the
  tiny grey transient English status string currently in each editor's corner. Reuses each editor's
  existing `run()`/`save()` logic — only the **trigger** (explicit) and the **presentation** (prominent,
  near the action) change.

### 5.4 `ConfirmDialog` — replaces every `window.confirm`

- **Problem (verified):** all destructive + WhatsApp actions use `window.confirm` (8+ call sites) —
  unstyleable, untranslatable, OS-tiny, reflexively dismissed, English "cannot be undone" on
  irreversible deletes.
- **New shared component** `components/admin/ConfirmDialog.tsx`: large targets, focus-trapped, **safe
  option focused by default**, destructive action in `ADMIN_BTN.DANGER`, and it **shows what will be
  affected** (order #, customer name, garment) — a "show," not an abstract sentence. Replaces all
  `window.confirm` calls (deletes, WhatsApp send, backward/jump status change, lead convert).

### 5.5 `StatusStepper` — one status UI everywhere (and view-vs-change safety)

- **Problem (verified):** the same 9-stage lifecycle is shown three different ways — an order-level
  **tappable 12px progress bar that silently rewrites status on a tap** (the worst data-integrity risk),
  a per-garment **9-item `<select>`**, and a colour-only **lead badge** (fails 1.4.1).
- **Single source of order:** add `ORDER_STAGE_SEQUENCE` to `data/constants.ts` (the ordered list of
  `ORDER_STATUS` values). Delete the admin-local `STAGES` array in `OrdersEditor`.
- **New shared component** `components/admin/StatusStepper.tsx`, rendered identically in all three places:
  - **icon + word + position** ("3 of 9"), with a **non-colour cue** (icon/shape) so state never relies
    on colour alone. Stage labels come from the canonical `t('status.'+key)` (defaults English; see `§5.8`).
  - **View vs change separated:** the bar itself is a **view-only** indicator. The common action is the
    large **"Move to next →"** button. Tapping a *specific* stage does **not** silently apply — it opens
    `ConfirmDialog` ("Change status to X?"). This keeps full flexibility for the developer while making a
    stray tap safe for Mummy. Each interactive target is ≥44px.
  - The status→icon map lives in the component layer (icons are components); the **keys/order** come from
    `data/constants.ts`.

### 5.6 `EmptyState` — guided blanks

- Generalize the one good empty-state line Orders already has into `components/admin/EmptyState.tsx`: a
  faded **example card** behind the message + the primary action button, so each blank screen
  **demonstrates its own output**. Used by Orders, Customers, Leads, and CMS lists.

### 5.7 Indian money & date formatting (`lib/format.ts`)

- New tiny helpers (pure, in `lib/`):
  - `formatINR(n)` → `Intl.NumberFormat('en-IN')` → **₹1,25,000** (not `₹125000`).
  - `formatDate(iso)` → **day-first**, localized (not raw `2026-06-21`).
- **ISO stays in storage** so the existing overdue/`due_date` comparisons are untouched (formatting is
  display-only).

### 5.8 Status label source-of-truth fix (a bug, not i18n)

- **Problem (verified):** admin `STAGES` labels ("Stitching/Fitting/Ready") **diverge** from the
  canonical `status.*` strings used by the database and the public order-tracking ("In Progress/Ready
  for Fitting/Completed"). The admin and the customer-facing site **disagree about the same order**.
- **Fix:** render all status names from the single canonical source `t('status.'+key)` (which already
  exists in EN/HI/CG). Defaults to English; self-localizes if the language is switched. Removes the
  duplicate source — satisfies the centralization rule. (Wording stays canonical; the owner can soften
  the English labels later in one place — `translations.ts` — if desired.)

## 6. Design — applying the primitives, screen by screen

No data-layer changes. `orders-admin.ts` / `content-admin.ts` are reused as-is (one small additive
helper in `§6.3`).

### 6.1 Admin shell (`AdminApp.tsx`)
- Nav: **icon + word**, ≥14px, sentence-case (drop the 10px uppercase letter-spaced labels). Uppercase
  reserved for the decorative brand heading only. Targets ≥44px.
- Header keeps log-out; the existing public language switcher is **not** added here (admin stays English).

### 6.2 Orders (`OrdersEditor.tsx`)
- Progress bar → `StatusStepper` (view-only bar + "Move to next →"; stage tap → `ConfirmDialog`). The
  per-garment `<select>` → compact `StatusStepper`.
- Save model: remove `onBlur` auto-save on garment fields / notes / overall due; each card gets
  `SaveButton` + `SaveState` green ✓.
- Money cards & list use `formatINR`; dates use `formatDate`. **Keep** the existing red/green money cards
  (the audit's praised "show" element).
- **Live balance preview** (kept in Phase A): as a payment amount is typed, show "₹1,500 due → **₹500
  due**" before commit — cause→effect shown.
- **WhatsApp-after-stage prompt** (kept in Phase A): fix the `setStatusAndMaybeNotify` gap — after a
  stage change, inline-prompt the matching **already-Hindi** `order-messages.ts` template with a big
  **Send** / **Skip** (never auto-send; she sees the text first). Reuses `getWhatsAppUrl`.
- Bare `✕` delete → **trash icon + word**, via `ConfirmDialog` showing order #.

### 6.3 Customers (`CustomersEditor.tsx`)
- Remove `onBlur` auto-save → `SaveButton` + `SaveState`. Delete via `ConfirmDialog`.
- Replace the local `waLink()` duplicate by extending `lib/whatsapp.ts` with a no-message contact-URL
  builder (`§10`); `LeadsEditor` uses the same.

### 6.4 Leads (`LeadsEditor.tsx`)
- Colour-only status badge → `StatusStepper`/badge with icon + word (non-colour cue, ≥12px).
- "Convert to order" → `ConfirmDialog`, then **navigate into the new order** (reuse `setSelectedId`
  pattern) instead of silently creating it in another tab — show the result.

### 6.5 Site Control / CMS editors (Gallery, Services, Announcement, BusinessInfo, About, Hero, Testimonials)
- Already explicit-save; unify the confirmation to `SaveState` (green ✓), apply `ADMIN_BTN`, ≥44px
  targets, and `ConfirmDialog` for deletes. `LocalizedInput` (the trilingual content editor) is
  unchanged — it edits public **content**, which is correctly trilingual.

## 7. "Show, don't tell" inventory (where the philosophy lives)

| Mechanism | Lives in | Shows |
|---|---|---|
| Icon **+ word** on every action/status | `ADMIN_BTN`, `StatusStepper` | meaning survives a misread word |
| Green ✓ at the tap point | `SaveState` | "it worked" |
| Live balance preview | Orders payment block | cause → effect before commit |
| `ConfirmDialog` showing the affected item | `ConfirmDialog` | the consequence, not a sentence |
| Guided empty states | `EmptyState` | the screen's own output |
| WhatsApp two-step handoff note | confirm copy | "opens WhatsApp — then press ➤" |

**Deliberately deferred to Phase B** (research: upfront tours/coach-marks are skipped and make simple
apps *feel* hard): first-run hints, voice-input guidance, practice/sandbox order, Today-as-mode.

## 8. Accessibility targets (numeric, sourced)

- Text contrast **≥4.5:1**; non-text/UI components **≥3:1**; never colour-alone — W3C WCAG 2.2 SC
  1.4.3 / 1.4.11 / 1.4.1.
- Touch targets **≥44px** with **≥8px** (prefer 16px) spacing — W3C SC 2.5.8 (24px floor) + Android a11y
  (44–48px for seniors).
- Functional text **≥14px**, inputs **≥16px** (also prevents iOS zoom); relative units so 200% zoom
  reflows.
- Visible **`:focus-visible`** on all interactive elements.
- Devanagari (when shown) **≥16px**, line-height **1.6–1.8**.

## 9. Architecture & file map

```
data/constants.ts        + ADMIN_BTN, + ORDER_STAGE_SEQUENCE         (strings/enums/classes)
data/translations.ts     (unchanged; status.* reused)                 (data)
app/globals.css          + :focus-visible, + :lang() Devanagari       (global CSS)
lib/format.ts            NEW formatINR / formatDate                   (pure logic)
lib/whatsapp.ts          + contact-URL builder (dedupe waLink)        (pure logic)
components/admin/SaveState.tsx     NEW
components/admin/ConfirmDialog.tsx NEW
components/admin/StatusStepper.tsx NEW   (key→icon map here)
components/admin/EmptyState.tsx    NEW
components/admin/AdminApp.tsx              uses the above
components/admin/editors/*.tsx             use the above
```

Dependency hierarchy preserved: `data/ ← lib/ ← components/ ← app/`.

## 10. New abstractions — justifications (per the architecture rule)

| New | Why it is not duplication / why it earns its place |
|---|---|
| `ADMIN_BTN` constants | Replaces ~10 duplicated button literals; fixes contrast centrally; mandated by the repo's "CSS classes in constants" rule. |
| `ConfirmDialog` | 8+ `window.confirm` sites; the only way to get large targets + focus trap + shown consequences. |
| `SaveState`/`SaveButton` | Every editor; unifies the two contradictory save models into one cued model; the core "show" element. |
| `StatusStepper` + `ORDER_STAGE_SEQUENCE` | Unifies 3 divergent status UIs into one; removes the admin-local `STAGES` second source; enables the view-vs-change safety fix. |
| `EmptyState` | Generalizes the one good pattern Orders already has; every list reuses it. |
| `lib/format.ts` | Two pure helpers; no existing equivalent. |
| `lib/whatsapp.ts` contact-URL builder | **Removes** duplication (`waLink` copied in Customers + Leads); extends the existing module. |

## 11. Verification (must pass before "done")

- `npm run build` green (static export to `out/`); `npm run lint` clean; `npm run test` green.
- **Manual, on a phone viewport:**
  - Primary buttons measure **≥4.5:1**; a visible focus ring appears on Tab.
  - No control commits a typed edit until **Save**; Save shows the green ✓; a forced failure shows
    friendly red copy.
  - The progress bar no longer changes status on a stray tap; "Move to next" advances; tapping a stage
    opens the confirm.
  - No `window.confirm` anywhere (grep `window.confirm` in `src/` → 0 hits).
  - Money renders **₹1,25,000**; dates day-first.
  - After a stage change, the Hindi WhatsApp prompt appears with Send/Skip.
  - Admin and public order-tracking show the **same** status name for the same order.
  - (If kept) switching the public site to Hindi renders in Tiro Devanagari.
- **No regression for the developer:** order triage flow is no slower than before.
- `cross-review` + `quality-reviewer` before completion (per the standard workflow).

## 12. Risks & mitigations

- **Explicit-save interpretation** (edits vs actions) — confirmed (`§14`).
- **Save-model migration** — many `onBlur` sites in Orders/Customers; mitigate by routing all through the
  one shared `SaveState`/`run()` path (no divergent inline fixes).
- **`StatusStepper` doing too much** (view + advance + per-garment + lead badge) — keep it a focused,
  prop-driven display; if it grows, that is the signal to split it.
- **Scope creep into the public site** — Phase A touches the public site only via the two shared global
  CSS rules (`§5.2`); public button-contrast and other public a11y are explicitly out of scope.

## 13. Provenance

Deep audit + research: 12 agents (6 code-audit lenses: Mummy walkthrough, accessibility/legibility,
localization, show-don't-tell, consistency/IA, dev efficiency; 5 external research briefs; 1 synthesis).
Every critical claim (i18n exists & wraps admin; 9 statuses translated; inert Devanagari font; tappable
12px progress bar; mixed save model; stage-label divergence; 2.53:1 button contrast) was re-verified
against source before this spec.

## 14. Decisions (owner sign-off — 2026-06-05)

1. **Save model** (`§5.3`): **confirmed** — explicit **Save** button for typed edits (green ✓ on save);
   discrete actions (advance stage, add payment, add garment, convert lead, delete) commit on their
   single tap and also show the green ✓. Today's invisible `onBlur` auto-save is removed.
2. **Devanagari CSS fix** (`§5.2`): **kept** in Phase A (sitewide typography win).
3. **Stage-name English wording** (`§5.8`): **keep canonical** ("In Progress / Ready for Fitting /
   Completed"); no change to `translations.ts` wording.

## 15. Out of scope (Phase B and later)

Simple/Expert mode split; Today landing as a mode; one-task-per-screen flows; voice input; first-run
coach-marks; practice/sandbox order; developer tables / bulk actions / hotkeys; customer-facing changes
beyond the two shared CSS rules; any data-model or RLS change.
