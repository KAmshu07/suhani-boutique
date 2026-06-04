# Order Book — Design Spec

- **Date:** 2026-06-04
- **Status:** Design — for review
- **Repo:** `suhani-boutique`
- **Depends on:** Admin Foundation + Site Control (both done)

## 1. Goal

The daily operational tool, admin-only: manage **customers**, **orders** (multi-garment, one
status), **payments**, and the **leads inbox** (the booking/contact submissions already being
captured); send **WhatsApp status updates** to customers. No public-site changes.

## 2. Key decisions

- **Both an overall order status AND a per-garment status** (decided). Each garment (order item)
  tracks its own stage, and the order carries an overall "headline" status Mom can set — with a
  one-tap "apply to all garments" for the common case where they move together. The **overall order
  status drives the WhatsApp update**.
- **Customer identity = phone** (already established in the Foundation `customers` table).
- **Payments = a ledger** — each payment is a record (amount + method + date); the order's
  total/paid/balance are **derived** (total = Σ item prices, paid = Σ payments). No cached totals
  in v1 (50–100 orders fetch fine).
- **Measurements = free-form text per garment** in v1 (Mom's shorthand). Structured fields are a
  future refinement.
- **WhatsApp updates = tap-to-send** — changing status reveals a "Send update" button that opens
  WhatsApp to the customer with a pre-written, editable message for that stage.

## 3. Data model — new migration (deferred from Foundation)

Reuses the existing `customers` and `booking_requests` tables. Adds three tables; enums are
`text` + `CHECK` mirroring `data/constants.ts` (`ORDER_STATUS`, `PAYMENT_METHOD`).

| Table | Key columns | Notes |
|---|---|---|
| `orders` | `customer_id` FK→customers (ON DELETE RESTRICT), `status` (CHECK ∈ ORDER_STATUS, default 'booked'), `notes`, `order_date` (default today), `due_date`, `delivered_date` | overall/headline status |
| `order_items` | `order_id` FK→orders (ON DELETE CASCADE), `garment_type`, `description`, `price numeric default 0`, `status` (CHECK ∈ ORDER_STATUS, default 'booked'), `measurements text`, `fabric_notes`, `due_date` | each garment with its own stage |
| `payments` | `order_id` FK→orders (ON DELETE CASCADE), `amount numeric not null`, `method` (CHECK ∈ 'cash'\|'upi'), `received_date` (default today), `note` | append-only ledger |

- All ids `uuid default gen_random_uuid()`; `created_at`; mutable tables get `updated_at` + trigger.
- Indexes: `orders.customer_id`, `orders.status`, `order_items.order_id`, `payments.order_id`.
- **Derived (client-side):** `total = Σ order_items.price`, `paid = Σ payments.amount`,
  `balance = total − paid`. Fetched in one query via PostgREST embedding
  (`orders?select=*,customers(*),order_items(*),payments(*)`).
- `order_status_history` (status timeline + which changes were notified) is **deferred** (future).

## 4. Security (RLS)

`orders`, `order_items`, `payments` → **admin-only** for all operations (`USING is_admin()
WITH CHECK is_admin()`), RLS enabled. Same pattern already verified for `customers`. No public access.

## 5. Admin UI — dashboard restructured into two groups

The dashboard nav becomes grouped (the daily tool first):

- **Order Book:** Orders · Customers · Leads
- **Site Control:** Gallery · Services · Reviews · Announcement · Business Info · About · Hero

Default landing section = **Orders**. Mobile-first throughout.

### 5a. Orders
- **List:** search (by customer name/phone) + filter tabs by status (All / Today's / In Progress /
  etc.). Each row: customer, item summary, total + **balance due**, status dropdown (change inline),
  and a "Send update" affordance after a status change.
- **Detail / new:** pick or create a customer (by phone); add/edit/remove garment line-items
  (garment type, price, **own status**, measurements, fabric notes, due date); record payments
  (ledger, with running balance); set the **overall order status** (with "apply to all garments");
  notes, dates; delete order (confirm). New items default to the order's current status.

### 5b. Customers
- **List:** search by phone/name. **Add customer** (phone unique → if it exists, opens that one).
- **Detail:** info (name, phone, notes) + the customer's order history.

### 5c. Leads (the booking_requests inbox)
- **List:** incoming leads (new / contacted / archived), newest first. Mark contacted/archived.
- **Convert to order:** create a customer from the lead's phone + name (or attach to an existing
  one by phone), then open a new order pre-filled. Mark the lead contacted.

## 6. WhatsApp status updates

- `data/order-flow.ts` (or a new data file): a default customer-facing message per `ORDER_STATUS`
  (friendly, Hindi-leaning since most customers are Hindi/Chhattisgarhi). Mom can edit before sending.
- A "Send update" button builds the WhatsApp URL to the **customer's** phone (not the shop number)
  with the status message → `window.open`. Tap-to-send, no automation, no cost.

## 7. Reuse (no new patterns where avoidable)

- `useAdminRows` / admin `content-admin` helpers (`listAll` won't fit nested fetches — add a small
  `lib/admin/orders-admin.ts` for the embedded order query + create/update/delete of orders, items,
  payments). `LocalizedInput` is NOT needed here (orders are not trilingual).
- Status labels come from `data/translations.ts` `status.*` (already defined) for display.
- `getWhatsAppUrl(message, number)` already accepts a number → pass the customer's number.

## 8. Build order (each increment shippable; deploy when complete)

1. **Migration** (orders/order_items/payments + RLS + triggers) + `orders-admin.ts` data layer.
   *(BLOCKER: user runs `npx supabase db push` from the suhani-boutique folder.)*
2. **Dashboard nav** restructured into the two groups.
3. **Customers** section (list + add + detail).
4. **Orders** section (list + detail/new with items + payments + status + WhatsApp update).
5. **Leads** inbox (list + status + convert-to-order).
6. Verify (build/lint/tests) + deploy.

## 9. Verification

`npm run build` + `npm test` green. RLS proof: anon cannot read/write orders/items/payments.
Manual: create a customer + order with 2 items + a payment; see derived balance; change status and
fire a WhatsApp update; convert a lead to an order.

## 10. Out of scope

Customer login / self-serve order tracking, automated (paid) WhatsApp, measurement-submission by
customers, per-garment status, reporting/analytics. (All future.)

## 11. Blockers

- **One DB migration** to apply (`npx supabase db push` from `C:\Nimrita\Personal\suhani-boutique`).
