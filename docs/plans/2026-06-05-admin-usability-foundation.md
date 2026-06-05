# Admin Usability Foundation — Implementation Plan

> **For agentic workers:** Implement increment-by-increment. Each increment is a self-contained,
> build-verified, committed unit ("build a feature, test it, move on"). Steps use `- [ ]` tracking.

**Goal:** Make the existing `/admin` operable by a low-tech, low-literacy phone user without slowing the
developer, via shared, centralized usability primitives applied across every admin screen.

**Architecture:** Presentation-only. No data-layer, schema, or RLS change. Introduce a small set of
justified shared primitives (button-class constants, two CSS rules, format helpers, and four React
components: `SaveButton`, `ConfirmDialog`/`useConfirm`, `StatusStepper`, `EmptyState`), then rewire each
editor to use them. Dependency hierarchy preserved: `data/ ← lib/ ← components/ ← app/`.

**Tech Stack:** Next.js 16.2.2 (static export), React 19, TypeScript, Tailwind v4, Supabase JS,
Vitest. Verify commands: `npm run build`, `npm run lint`, `npm run test`.

**Spec:** `docs/specs/2026-06-05-admin-usability-foundation-design.md` (approved 2026-06-05).

**Testing note (honest scope):** There is **no** React component test harness installed
(`@testing-library/react`/jsdom absent) and adding one is out of scope. So:
- **Pure logic** (`lib/format.ts`, `lib/whatsapp.ts`) gets real Vitest unit tests (TDD).
- **Components & wiring** are verified by TypeScript typecheck (via `next build`), `eslint`, a green
  static export, and explicit grep-based invariants (e.g. `window.confirm` → 0 hits) plus documented
  manual behavior checks. No fake "component tests" are written.

---

## File structure

```
data/constants.ts          MODIFY  + ADMIN_BTN, + ORDER_STAGE_SEQUENCE
app/globals.css            MODIFY  + :focus-visible, + :lang(hi|cg) Devanagari
lib/format.ts              CREATE  formatINR, formatDate            (+ format.test.ts)
lib/whatsapp.ts            MODIFY  + getContactUrl                  (+ whatsapp.test.ts)
components/icons.tsx       MODIFY  + ScissorsIcon, RulerIcon, HangerIcon, TrashIcon, XIcon, ArrowRightIcon, CalendarIcon
components/admin/ConfirmDialog.tsx   CREATE  modal + ConfirmProvider + useConfirm
components/admin/SaveButton.tsx      CREATE  async action button w/ saving/✓/error
components/admin/StatusStepper.tsx   CREATE  unified status display (bar/mini/inline)
components/admin/EmptyState.tsx      CREATE  guided empty state
components/admin/AdminApp.tsx        MODIFY  ConfirmProvider, nav icon+word, ADMIN_BTN
components/admin/editors/OrdersEditor.tsx     MODIFY  (largest)
components/admin/editors/CustomersEditor.tsx  MODIFY
components/admin/editors/LeadsEditor.tsx      MODIFY
components/admin/editors/{Gallery,Services,Announcement,BusinessInfo,About,Hero,Testimonials}Editor.tsx  MODIFY
```

---

## Increment 1 — Foundation tokens & helpers

No visible behavior change yet; everything else builds on these.

**Files:** `data/constants.ts`, `app/globals.css`, `lib/format.ts` (+test), `lib/whatsapp.ts` (+test).

- [ ] **1.1 `data/constants.ts`** — append:
  ```ts
  // ─── Admin Button Classes (centralized; WCAG ≥4.5:1) ─────────────
  // Shared by every admin control. cream-on-brown / brown-on-gold clear 4.5:1;
  // the old `bg-gold text-cream` (2.53:1) is retired.
  export const ADMIN_BTN = {
    PRIMARY:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-brown px-5 py-3 text-base font-medium text-cream transition-colors hover:bg-gold-hover disabled:opacity-50 min-h-[44px]",
    SECONDARY:
      "inline-flex items-center justify-center gap-2 rounded-lg border border-brown-light/30 px-5 py-3 text-base font-medium text-brown transition-colors hover:border-gold disabled:opacity-50 min-h-[44px]",
    DANGER:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 min-h-[44px]",
  } as const;

  // ─── Order stage sequence (single ordering source) ───────────────
  // The 9 statuses in lifecycle order. Labels come from translations.ts status.*.
  export const ORDER_STAGE_SEQUENCE = [
    ORDER_STATUS.BOOKED, ORDER_STATUS.CONSULTED, ORDER_STATUS.MEASURED,
    ORDER_STATUS.FABRIC_SELECTED, ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.READY_FOR_FITTING,
    ORDER_STATUS.ALTERATIONS, ORDER_STATUS.COMPLETED, ORDER_STATUS.DELIVERED,
  ] as const;
  ```

- [ ] **1.2 `app/globals.css`** — add after the `@theme` block:
  ```css
  /* Visible keyboard focus everywhere (was focus:outline-none with no replacement) */
  :focus-visible { outline: 2px solid var(--color-brown); outline-offset: 2px; border-radius: 2px; }
  /* Devanagari: use the loaded Tiro face + room for matras when lang is hi/cg */
  :lang(hi), :lang(cg) { font-family: var(--font-hindi); line-height: 1.7; }
  ```

- [ ] **1.3 TDD `lib/format.ts`** — write `lib/format.test.ts` first:
  ```ts
  import { describe, it, expect } from "vitest";
  import { formatINR, formatDate } from "./format";

  describe("formatINR", () => {
    it("groups with Indian digit grouping and ₹", () => {
      expect(formatINR(125000)).toBe("₹1,25,000");
    });
    it("handles 0 and small numbers", () => {
      expect(formatINR(0)).toBe("₹0");
      expect(formatINR(500)).toBe("₹500");
    });
    it("coerces non-finite to ₹0", () => {
      expect(formatINR(NaN)).toBe("₹0");
    });
  });

  describe("formatDate", () => {
    it("formats an ISO date day-first", () => {
      expect(formatDate("2026-06-21")).toBe("21 Jun 2026");
    });
    it("returns empty string for nullish/empty", () => {
      expect(formatDate(null)).toBe("");
      expect(formatDate("")).toBe("");
    });
  });
  ```
  Run `npm run test` → FAIL (module missing). Then create `lib/format.ts`:
  ```ts
  // Pure display formatters. Zero side effects. Storage stays ISO/number.
  const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

  export function formatINR(amount: number): string {
    const n = Number.isFinite(amount) ? amount : 0;
    return "₹" + inr.format(n);
  }

  export function formatDate(iso: string | null | undefined): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    }).format(d).replace(/ /g, " ");
  }
  ```
  Run `npm run test` → PASS. *(If `en-IN` month formatting differs by ICU build, assert the parts the
  test needs; adjust the expected string to the actual `Intl` output for the pinned Node.)*

- [ ] **1.4 TDD `lib/whatsapp.ts`** — add a no-message contact-URL builder that dedupes the `waLink`
  copies in Customers/Leads. Write `lib/whatsapp.test.ts`:
  ```ts
  import { describe, it, expect } from "vitest";
  import { getContactUrl } from "./whatsapp";

  describe("getContactUrl", () => {
    it("prefixes 91 for a 10-digit number", () => {
      expect(getContactUrl("9876543210")).toBe("https://wa.me/919876543210");
    });
    it("keeps an already-qualified number and strips non-digits", () => {
      expect(getContactUrl("+91 98765 43210")).toBe("https://wa.me/919876543210");
    });
  });
  ```
  Then add to `lib/whatsapp.ts`:
  ```ts
  import { EXTERNAL } from "@/data/constants";
  // already imports businessInfo + EXTERNAL at top; reuse EXTERNAL.WHATSAPP_BASE
  export function getContactUrl(phone: string): string {
    const d = phone.replace(/\D/g, "");
    const full = d.length === 10 ? "91" + d : d;
    return `${EXTERNAL.WHATSAPP_BASE}/${full}`;
  }
  ```
  Run `npm run test` → PASS.

- [ ] **1.5 Verify & commit:** `npm run test` (all green), `npm run lint`, `npm run build` (export OK).
  ```
  git add src/data/constants.ts src/app/globals.css src/lib/format.ts src/lib/format.test.ts src/lib/whatsapp.ts src/lib/whatsapp.test.ts
  git commit -m "feat: admin usability tokens, format helpers, focus and devanagari css"
  ```

---

## Increment 2 — Shared components (built, not yet wired)

**Files:** `components/icons.tsx`, `components/admin/{ConfirmDialog,SaveButton,StatusStepper,EmptyState}.tsx`.

- [ ] **2.1 Icons** — add to `components/icons.tsx` (same `{ className }` SVG pattern as existing):
  `ScissorsIcon` (stitching), `RulerIcon` (measured), `HangerIcon` (ready/fitting), `TrashIcon`
  (delete), `XIcon` (close), `ArrowRightIcon` (move next), `CalendarIcon` (due). Reuse `CheckIcon`
  (booked/done) and `MessageIcon` already present. (Standard 24×24 stroke paths.)

- [ ] **2.2 `ConfirmDialog.tsx` + `ConfirmProvider` + `useConfirm`** — promise-based replacement for
  `window.confirm`. Contract:
  ```ts
  type ConfirmOptions = { title: string; body?: React.ReactNode; confirmLabel?: string; cancelLabel?: string; danger?: boolean };
  function useConfirm(): (opts: ConfirmOptions) => Promise<boolean>;
  function ConfirmProvider({ children }): JSX.Element; // renders a single modal
  ```
  Behavior: focus-trapped modal; **Cancel focused by default**; Escape & backdrop = cancel; confirm
  button uses `ADMIN_BTN.DANGER` when `danger`, else `ADMIN_BTN.PRIMARY`; Cancel uses
  `ADMIN_BTN.SECONDARY`. `body` is where callers *show what will be affected* (order #, name, garment).
  Implemented with a context holding `{resolve, options}`; `confirm()` returns a Promise resolved by the
  buttons. Targets ≥44px.

- [ ] **2.3 `SaveButton.tsx`** — the one async-action button that shows its result:
  ```ts
  function SaveButton({ onSave, children, variant = "primary", confirmText }: {
    onSave: () => Promise<void>;
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger";
    confirmText?: string; // optional success label, default "Saved ✓"
  }): JSX.Element;
  ```
  Internal state `idle|saving|saved|error`; on click runs `onSave()`, shows a spinner/"…" while saving,
  a prominent green **✓ Saved** (`CheckIcon` + text) for ~2s on success, and friendly red copy on error
  (maps raw message to "Could not save — check your internet and try again."). Disabled while saving.
  Classes from `ADMIN_BTN[variant]`. This component replaces both per-card Save and discrete-action
  buttons, giving one consistent "show it worked".

- [ ] **2.4 `StatusStepper.tsx`** — unified status display. Contract:
  ```ts
  function StatusStepper({ current, onSelect, variant = "bar" }: {
    current: string;                 // an ORDER_STATUS value
    onSelect?: (key: string) => void; // tapping a stage (caller guards with confirm)
    variant?: "bar" | "mini" | "inline";
  }): JSX.Element;
  ```
  - Uses `ORDER_STAGE_SEQUENCE` for order/index; labels via `useTranslation().t("status."+key)`.
  - Stage→icon map (component-local): booked→Check, consulted→Message, measured→Ruler,
    fabric_selected→Scissors(?) … (pick sensible icons; non-colour cue = the icon shape).
  - `bar`: full segmented bar (filled ≤ current) **view-only** + big label row "icon + word + (N of 9)".
    If `onSelect`, each segment is a ≥44px button calling `onSelect(key)` (caller confirms) — it does
    **not** self-apply.
  - `mini`: just the thin segmented bar (for list cards). Never interactive.
  - `inline`: current stage as an icon+word badge; if `onSelect`, a "Change ▾" toggles a row of 9 big
    stage buttons that call `onSelect` (used by garment + lead).

- [ ] **2.5 `EmptyState.tsx`**:
  ```ts
  function EmptyState({ message, children }: { message: string; children?: React.ReactNode }): JSX.Element;
  ```
  Renders a faded example/illustration block + the `message` + an optional primary action (`children`).

- [ ] **2.6 Verify & commit:** `npm run lint`, `npm run build` (all components typecheck/compile).
  ```
  git add src/components/icons.tsx src/components/admin/ConfirmDialog.tsx src/components/admin/SaveButton.tsx src/components/admin/StatusStepper.tsx src/components/admin/EmptyState.tsx
  git commit -m "feat: shared admin components - confirm, save button, status stepper, empty state"
  ```

---

## Increment 3 — Shell + Orders (the core screen)

**Files:** `components/admin/AdminApp.tsx`, `components/admin/editors/OrdersEditor.tsx`.

- [ ] **3.1 `AdminApp.tsx`:** wrap `<Dashboard>` content in `<ConfirmProvider>`. Nav buttons → icon +
  word, `text-sm` (not `text-[10px] uppercase`), ≥44px targets; sentence-case labels. Header/login
  buttons use `ADMIN_BTN.*`. Keep the role gate and login logic unchanged. (Admin stays English; no
  language switcher added.)

- [ ] **3.2 `OrdersEditor.tsx` — status source fix:** delete the local `STAGES`/`LABEL`/`idxOf`
  array; import `ORDER_STAGE_SEQUENCE`; derive index from it; render names via `t("status."+key)`.

- [ ] **3.3 Progress bar → `StatusStepper`:** replace the tappable 12px bar (detail view) with
  `<StatusStepper variant="bar" current={o.status} onSelect={(k) => askThenSetStatus(o, k)} />` where
  `askThenSetStatus` calls `useConfirm()` for any backward/jump change before applying. Keep the big
  **"Move to next →"** as a `SaveButton` that advances to `ORDER_STAGE_SEQUENCE[cur+1]`. List card mini
  bar → `<StatusStepper variant="mini" .../>`.

- [ ] **3.4 Save model:** remove every `onBlur={() => run(...)}` on garment/customer/notes/due fields;
  add a per-card **`SaveButton`** that persists that card's edits (`updateOrderItem`, `updateOrder`).
  Replace the corner status string with the `SaveButton`'s inline ✓.

- [ ] **3.5 Garment `<select>` → `StatusStepper variant="inline"`** with `onSelect` applying
  `updateOrderItem(it.id, { status })` (+ ✓).

- [ ] **3.6 Money/date:** `total/paid/balance` and list amounts via `formatINR`; due dates via
  `formatDate`. Keep the red/green money cards. **Live balance preview:** as `payAmt` changes, show
  "Balance: ₹X → **₹(X − payAmt)**" beneath the amount field before "Add".

- [ ] **3.7 WhatsApp-after-stage:** after a successful stage advance, set state to open an inline panel
  showing the `orderStatusMessages[newStatus]` text (Hindi) with a big **Send** (`SaveButton`,
  `getWhatsAppUrl`) and **Skip**. Never auto-send. (Fixes the `setStatusAndMaybeNotify` gap.)

- [ ] **3.8 Confirms & deletes:** replace all `window.confirm` in this file with `await confirm({...})`
  (delete order, delete garment, delete payment, send-WhatsApp preview). Bare `✕` delete → `TrashIcon` +
  "Remove"/"Delete" word, `ADMIN_BTN.DANGER`/danger confirm. Empty list → `<EmptyState>`.

- [ ] **3.9 Verify & commit:**
  - `npm run build` green; `npm run lint` clean.
  - `grep -rn "window.confirm" src/components/admin/editors/OrdersEditor.tsx` → 0.
  - `grep -n "onBlur" src/components/admin/editors/OrdersEditor.tsx` → 0 auto-save handlers.
  - Manual: stage tap asks before changing; Save shows ✓; balance preview updates; WhatsApp panel
    appears after advance.
  ```
  git commit -am "feat: rebuild orders screen on shared usability primitives"
  ```

---

## Increment 4 — Customers

**File:** `components/admin/editors/CustomersEditor.tsx`.

- [ ] **4.1** Remove `onBlur` auto-save → per-card `SaveButton` (`updateCustomer`). Delete → `useConfirm`
  (show name/phone) + `TrashIcon`. Replace local `waLink()` with `getContactUrl` from `lib/whatsapp`.
  `ADMIN_BTN.*` for add/save; ≥44px icon links. Empty → `<EmptyState>`.
- [ ] **4.2 Verify & commit:** build + lint green; `grep onBlur` / `grep window.confirm` / `grep waLink`
  in this file → 0.
  ```
  git commit -am "feat: rebuild customers screen on shared primitives"
  ```

---

## Increment 5 — Leads

**File:** `components/admin/editors/LeadsEditor.tsx`.

- [ ] **5.1** Colour-only badge → `StatusStepper variant="inline"` (or an icon+word badge) with
  non-colour cue. "Convert to order" → `useConfirm`, then on success **navigate into the new order**
  (lift a callback so AdminApp/Orders selects it, or store the new id and switch section to Orders with
  it preselected — simplest: pass an `onConverted(orderId)` up to `Dashboard` which switches to Orders
  and sets the selected id). Replace `waLink` with `getContactUrl`. `ADMIN_BTN.*`. Empty → `EmptyState`.
- [ ] **5.2 Verify & commit:** build + lint; greps → 0.
  ```
  git commit -am "feat: rebuild leads screen and convert-to-order navigation"
  ```

*(Note: the cross-screen "open the new order" handoff is the one interaction needing a small lift of
state into `Dashboard`. Keep it minimal — a `pendingOrderId` in `Dashboard` passed to `OrdersEditor`.)*

---

## Increment 6 — Site Control / CMS editors

**Files:** `Gallery, Services, Announcement, BusinessInfo, About, Hero, Testimonials` editors + read
`ImageUpload.tsx`.

All share one change set (read each before editing):
- [ ] **6.1** Replace each explicit `Save` button (`bg-gold text-cream`) with `SaveButton`
  (`onSave={save}`) so saving shows the green ✓ consistently. Replace `window.confirm` deletes with
  `useConfirm` + `TrashIcon`. Apply `ADMIN_BTN.*`, ≥44px targets, ≥14px text. Use `EmptyState` for empty
  lists (Gallery/Services/Testimonials). `LocalizedInput` stays as-is (trilingual **content** editor).
- [ ] **6.2** Do them one editor at a time, building after each: Gallery → Services → Announcement →
  BusinessInfo → About → Hero → Testimonials.
- [ ] **6.3 Verify & commit (per editor or batched):** build + lint; `grep -rn "window.confirm"
  src/components/admin` → 0; `grep -rn "bg-gold text-cream" src/components/admin` → 0.
  ```
  git commit -am "feat: unify site-control editors on shared save/confirm primitives"
  ```

---

## Increment 7 — Final verification & review

- [ ] **7.1 Full gate:** `npm run test` (green), `npm run lint` (clean), `npm run build` (static export
  OK).
- [ ] **7.2 Invariants across `src/`:**
  - `grep -rn "window.confirm" src/` → 0
  - `grep -rn "bg-gold text-cream" src/components/admin` → 0
  - no remaining auto-save `onBlur` in admin editors
  - admin status names resolve via `t("status.…")` (admin & public agree)
- [ ] **7.3 Review:** run `quality-reviewer` on the diff, then `cross-review` (Codex) on the uncommitted
  /committed diff; fix actionable findings.
- [ ] **7.4** Final commit of any review fixes. Update the spec Status to "Implemented".

---

## Self-review (plan vs spec)

- **Spec §5.1 ADMIN_BTN** → Inc 1.1. **§5.2 CSS** → Inc 1.2. **§5.3 SaveButton/save model** → Inc 2.3 +
  applied 3.4/4.1/6.1. **§5.4 ConfirmDialog** → Inc 2.2 + applied 3.8/4.1/5.1/6.1. **§5.5 StatusStepper +
  ORDER_STAGE_SEQUENCE** → Inc 1.1 + 2.4 + applied 3.3/3.5/5.1. **§5.6 EmptyState** → 2.5 + applied.
  **§5.7 format** → 1.3. **§5.8 status source fix** → 3.2. **§6.1 shell** → 3.1. **§6.2 Orders** → Inc 3.
  **§6.3 Customers** → Inc 4. **§6.4 Leads** → Inc 5. **§6.5 CMS** → Inc 6. **§7 show-don't-tell** → green
  ✓ (2.3), icon+word (2.1/2.4), live balance (3.6), confirm-shows-consequence (2.2), empty states (2.5),
  WhatsApp note (3.7/3.8). **§8 a11y numbers** → ADMIN_BTN sizes + globals.css. **§11 verification** → Inc
  7. **Gaps:** none identified.
- **Type consistency:** `SaveButton.onSave`, `useConfirm()→Promise<boolean>`, `StatusStepper.{current,
  onSelect,variant}`, `formatINR/formatDate`, `getContactUrl` — names used identically across increments.
- **Placeholders:** none ("…" in CSS/JSX denotes existing surrounding code, not unfilled work).
