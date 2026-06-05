"use client";

import { useState } from "react";
import {
  listOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  applyStatusToAllItems,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
  addPayment,
  deletePayment,
  findOrCreateCustomer,
} from "@/lib/admin/orders-admin";
import { useAsyncData } from "@/lib/admin/use-admin-rows";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { orderStatusMessages } from "@/data/order-messages";
import { ADMIN_BTN, ORDER_STAGE_SEQUENCE, PAYMENT_METHOD } from "@/data/constants";
import { formatINR, formatDate } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import StatusStepper from "@/components/admin/StatusStepper";
import SaveButton from "@/components/admin/SaveButton";
import EmptyState from "@/components/admin/EmptyState";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { WhatsAppIcon, PhoneIcon, TrashIcon, ArrowRightIcon } from "@/components/icons";

type Item = {
  id: string;
  garment_type: string | null;
  price: number;
  status: string;
  measurements: string | null;
  fabric_notes: string | null;
  due_date: string | null;
};
type Payment = { id: string; amount: number; method: string; received_date: string | null };
type Customer = { id: string; name: string | null; phone: string };
type Order = {
  id: string;
  order_no: number;
  status: string;
  is_rush: boolean;
  notes: string | null;
  due_date: string | null;
  customer: Customer | null;
  order_items: Item[];
  payments: Payment[];
};

const SEQ: readonly string[] = ORDER_STAGE_SEQUENCE;
const idxOf = (s: string) => Math.max(0, SEQ.indexOf(s));

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
function sum<T>(arr: T[], f: (x: T) => number): number {
  return arr.reduce((a, x) => a + (Number(f(x)) || 0), 0);
}
function noticeClass(s: string) {
  return /problem|enter|no phone|first/i.test(s) ? "text-red-600" : "text-green-700";
}

const input =
  "bg-cream-alt border border-brown-light/20 px-3 py-2 text-base text-brown rounded focus:border-gold focus:outline-none";

export default function OrdersEditor({
  initialOrderId,
}: {
  initialOrderId?: string;
} = {}) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { data: orders, setData, status, setStatus, reload } = useAsyncData<Order[]>(listOrders, []);
  const [selectedId, setSelectedId] = useState<string | null>(initialOrderId ?? null);
  const [quick, setQuick] = useState("all");
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [payAmt, setPayAmt] = useState("");
  const [payMethod, setPayMethod] = useState<string>(PAYMENT_METHOD.CASH);
  const [wa, setWa] = useState<{ text: string } | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const statusLabel = (key: string) => t("status." + key);
  const total = (o: Order) => sum(o.order_items, (i) => i.price);
  const paid = (o: Order) => sum(o.payments, (p) => p.amount);
  const balance = (o: Order) => total(o) - paid(o);
  const selected = orders.find((o) => o.id === selectedId) ?? null;

  function patchOrder(id: string, p: Partial<Order>) {
    setData((os) => os.map((o) => (o.id === id ? { ...o, ...p } : o)));
  }
  function patchItem(orderId: string, itemId: string, p: Partial<Item>) {
    setData((os) =>
      os.map((o) =>
        o.id !== orderId ? o : { ...o, order_items: o.order_items.map((it) => (it.id === itemId ? { ...it, ...p } : it)) },
      ),
    );
  }

  async function run(label: string, fn: () => Promise<unknown>, refresh = true) {
    try {
      await fn();
      if (refresh) await reload();
      setStatus(label);
    } catch (e) {
      setStatus("Problem: " + errMsg(e));
    }
  }

  function messageFor(o: Order, key: string) {
    return (orderStatusMessages[key as keyof typeof orderStatusMessages] ?? "").replace("{no}", String(o.order_no));
  }

  async function createNew() {
    if (!newPhone.trim()) {
      setStatus("Enter a phone number first.");
      return;
    }
    try {
      const c = await findOrCreateCustomer(newPhone.trim(), newName.trim());
      const o = await createOrder(c.id);
      setNewPhone("");
      setNewName("");
      setCreating(false);
      await reload();
      setSelectedId(o.id);
      setStatus("New order started ✓");
    } catch (e) {
      setStatus("Problem: " + errMsg(e));
    }
  }

  // Apply a status, confirming first when it is a jump/backward change.
  async function changeStatus(o: Order, key: string, confirmFirst: boolean) {
    if (confirmFirst) {
      const ok = await confirm({
        title: "Change status?",
        body: (
          <>
            Set order <strong>#{o.order_no}</strong> to <strong>{statusLabel(key)}</strong>?
          </>
        ),
        confirmLabel: "Change",
      });
      if (!ok) return;
    }
    await run(
      "Status updated ✓",
      () => updateOrder(o.id, { status: key, ...(key === "delivered" ? { delivered_date: today } : {}) }),
    );
  }

  async function advance(o: Order) {
    const next = SEQ[idxOf(o.status) + 1];
    if (!next) return;
    await updateOrder(o.id, { status: next, ...(next === "delivered" ? { delivered_date: today } : {}) });
    await reload();
    setStatus("Status updated ✓");
    setWa({ text: messageFor(o, next) });
  }

  function sendWhatsApp(o: Order) {
    const phone = o.customer?.phone;
    if (!phone) {
      setStatus("No phone number for this customer.");
      return;
    }
    if (wa) window.open(getWhatsAppUrl(wa.text, phone), "_blank", "noopener");
    setWa(null);
  }

  // ────────────────────────────── DETAIL ──────────────────────────────
  if (selected) {
    const o = selected;
    const cur = idxOf(o.status);
    const bal = balance(o);
    const next = SEQ[cur + 1];
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedId(null);
              setWa(null);
            }}
            className="min-h-[44px] text-base font-medium text-brown-light hover:text-gold"
          >
            ← All orders
          </button>
          {status && <span className={`text-base ${noticeClass(status)}`}>{status}</span>}
        </div>

        {/* Customer */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-2xl font-bold">#{o.order_no}</h2>
            {o.is_rush && (
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-heading uppercase tracking-wider text-white">
                Rush
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-brown-light">
            <span className="text-lg text-brown">{o.customer?.name || "(no name)"}</span>
            {o.customer?.phone && (
              <a href={`tel:${o.customer.phone}`} className="flex min-h-[44px] items-center gap-1 text-base hover:text-gold">
                <PhoneIcon className="h-5 w-5 text-gold" />
                {o.customer.phone}
              </a>
            )}
          </div>
        </div>

        {/* Status — view-only stepper + explicit actions */}
        <div className="rounded-lg bg-cream-alt p-4">
          <StatusStepper current={o.status} variant="bar" onSelect={(key) => changeStatus(o, key, true)} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {next && (
              <SaveButton onSave={() => advance(o)} savedLabel="Done">
                Move to {statusLabel(next)} <ArrowRightIcon className="h-4 w-4" />
              </SaveButton>
            )}
            <SaveButton variant="secondary" onSave={() => applyStatusToAllItems(o.id, o.status).then(reload)} savedLabel="Done">
              Set all garments to “{statusLabel(o.status)}”
            </SaveButton>
          </div>
          <button
            onClick={() => setWa({ text: messageFor(o, o.status) })}
            className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-whatsapp px-3 py-3 text-base font-medium text-white hover:opacity-90"
          >
            <WhatsAppIcon className="h-5 w-5" /> Send update to customer
          </button>
          {wa && (
            <div className="mt-3 rounded-lg border border-whatsapp/40 bg-cream p-3">
              <p className="mb-2 text-sm text-brown-light">Message to {o.customer?.name || "customer"} — edit if you like, then send:</p>
              <textarea
                className={`${input} w-full`}
                rows={3}
                value={wa.text}
                onChange={(e) => setWa({ text: e.target.value })}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => sendWhatsApp(o)}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg bg-whatsapp px-4 py-2 text-base font-medium text-white hover:opacity-90"
                >
                  <WhatsAppIcon className="h-5 w-5" /> Send on WhatsApp
                </button>
                <button onClick={() => setWa(null)} className={ADMIN_BTN.SECONDARY}>
                  Skip
                </button>
              </div>
              <p className="mt-2 text-xs text-brown-light">This opens WhatsApp — then press the green ➤ to actually send.</p>
            </div>
          )}
        </div>

        {/* Money */}
        <div className="flex items-stretch gap-3 text-center">
          <div className="flex-1 rounded-lg bg-cream-alt p-3">
            <div className="text-sm text-brown-light">Total</div>
            <div className="text-lg font-semibold text-brown">{formatINR(total(o))}</div>
          </div>
          <div className="flex-1 rounded-lg bg-cream-alt p-3">
            <div className="text-sm text-brown-light">Paid</div>
            <div className="text-lg font-semibold text-green-700">{formatINR(paid(o))}</div>
          </div>
          <div className={`flex-1 rounded-lg p-3 ${bal > 0 ? "bg-red-50" : "bg-green-50"}`}>
            <div className="text-sm text-brown-light">{bal > 0 ? "Balance due" : "Settled"}</div>
            <div className={`text-2xl font-bold ${bal > 0 ? "text-red-600" : "text-green-700"}`}>{formatINR(bal)}</div>
          </div>
        </div>

        {/* Garments */}
        <div>
          <h3 className="font-heading text-base font-semibold text-brown">Garments</h3>
          <div className="mt-2 flex flex-col gap-3">
            {o.order_items.map((it) => (
              <div key={it.id} className="flex flex-col gap-2 rounded-lg border border-brown-light/15 p-3">
                <div className="flex flex-wrap gap-2">
                  <input
                    className={`${input} min-w-[10rem] flex-1`}
                    placeholder="Garment (e.g. Lehenga)"
                    value={it.garment_type ?? ""}
                    onChange={(e) => patchItem(o.id, it.id, { garment_type: e.target.value })}
                  />
                  <div className="flex items-center rounded border border-brown-light/20 bg-cream-alt px-2">
                    <span className="text-brown-light">₹</span>
                    <input
                      className="w-24 bg-transparent py-2 text-base text-brown focus:outline-none"
                      type="number"
                      placeholder="0"
                      value={it.price}
                      onChange={(e) => patchItem(o.id, it.id, { price: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <input
                  className={input}
                  placeholder="Measurements (chest, waist, length…)"
                  value={it.measurements ?? ""}
                  onChange={(e) => patchItem(o.id, it.id, { measurements: e.target.value })}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm text-brown-light">
                    Due{" "}
                    <input
                      type="date"
                      className={`${input} ml-1`}
                      value={it.due_date ?? ""}
                      onChange={(e) => patchItem(o.id, it.id, { due_date: e.target.value })}
                    />
                  </label>
                </div>
                <StatusStepper
                  current={it.status}
                  variant="inline"
                  onSelect={(key) => {
                    patchItem(o.id, it.id, { status: key });
                    run("Garment updated ✓", () => updateOrderItem(it.id, { status: key }), false);
                  }}
                />
                <div className="flex items-center justify-between">
                  <SaveButton
                    variant="secondary"
                    onSave={() =>
                      updateOrderItem(it.id, {
                        garment_type: it.garment_type,
                        price: Number(it.price) || 0,
                        measurements: it.measurements,
                        due_date: it.due_date || null,
                      })
                    }
                  >
                    Save garment
                  </SaveButton>
                  <button
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Remove this garment?",
                        body: it.garment_type ? <>“{it.garment_type}” will be removed from order #{o.order_no}.</> : undefined,
                        danger: true,
                        confirmLabel: "Remove",
                      });
                      if (ok) run("Removed ✓", () => deleteOrderItem(it.id));
                    }}
                    className="flex min-h-[44px] items-center gap-1 text-base font-medium text-red-600 hover:underline"
                  >
                    <TrashIcon className="h-5 w-5" /> Remove
                  </button>
                </div>
              </div>
            ))}
            <SaveButton
              variant="secondary"
              onSave={() => addOrderItem(o.id, { garment_type: "", price: 0, status: o.status }).then(reload)}
              savedLabel="Added"
            >
              + Add garment
            </SaveButton>
          </div>
        </div>

        {/* Payments */}
        <div>
          <h3 className="font-heading text-base font-semibold text-brown">Payments</h3>
          <div className="mt-2 flex flex-col gap-2">
            {o.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded bg-cream-alt px-3 py-2 text-base">
                <span>
                  <span className="font-semibold">{formatINR(p.amount)}</span>{" "}
                  <span className="text-sm uppercase text-brown-light">{p.method}</span>{" "}
                  <span className="text-sm text-brown-light">{formatDate(p.received_date)}</span>
                </span>
                <button
                  onClick={async () => {
                    const ok = await confirm({
                      title: "Remove this payment?",
                      body: <>{formatINR(p.amount)} ({p.method}) will be removed.</>,
                      danger: true,
                      confirmLabel: "Remove",
                    });
                    if (ok) run("Removed ✓", () => deletePayment(p.id));
                  }}
                  aria-label="Remove payment"
                  className="flex min-h-[44px] items-center text-red-600 hover:underline"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded border border-brown-light/20 bg-cream-alt px-2">
                <span className="text-brown-light">₹</span>
                <input
                  className="w-28 bg-transparent py-2 text-base focus:outline-none"
                  type="number"
                  placeholder="Amount"
                  value={payAmt}
                  onChange={(e) => setPayAmt(e.target.value)}
                />
              </div>
              {[PAYMENT_METHOD.CASH, PAYMENT_METHOD.UPI].map((m) => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className={`min-h-[44px] rounded-lg px-4 py-2 text-base font-medium uppercase ${
                    payMethod === m ? "bg-brown text-cream" : "bg-cream-alt text-brown-light"
                  }`}
                >
                  {m}
                </button>
              ))}
              <button
                onClick={() => {
                  const amount = Number(payAmt);
                  if (!amount || amount <= 0) {
                    setStatus("Enter an amount first.");
                    return;
                  }
                  setPayAmt("");
                  run("Payment added ✓", () => addPayment(o.id, { amount, method: payMethod, received_date: today }));
                }}
                className={ADMIN_BTN.PRIMARY}
              >
                Add
              </button>
            </div>
            {Number(payAmt) > 0 && (
              <p className="text-sm text-brown-light">
                Balance: <span className="line-through">{formatINR(bal)}</span> →{" "}
                <span className="font-semibold text-brown">{formatINR(bal - Number(payAmt))}</span>
              </p>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3 border-t border-brown-light/15 pt-4">
          <label className="flex items-center gap-2 text-base">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={o.is_rush}
              onChange={(e) => {
                patchOrder(o.id, { is_rush: e.target.checked });
                run("Saved ✓", () => updateOrder(o.id, { is_rush: e.target.checked }), false);
              }}
            />
            Mark as Rush / priority
          </label>
          <label className="text-sm text-brown-light">
            Overall due date{" "}
            <input
              type="date"
              className={`${input} ml-1`}
              value={o.due_date ?? ""}
              onChange={(e) => patchOrder(o.id, { due_date: e.target.value })}
            />
          </label>
          <textarea
            className={`${input} w-full`}
            rows={2}
            placeholder="Notes about this order…"
            value={o.notes ?? ""}
            onChange={(e) => patchOrder(o.id, { notes: e.target.value })}
          />
          <SaveButton
            variant="secondary"
            onSave={() => updateOrder(o.id, { due_date: o.due_date || null, notes: o.notes })}
          >
            Save details
          </SaveButton>
          <button
            onClick={async () => {
              const ok = await confirm({
                title: `Delete order #${o.order_no}?`,
                body: "This permanently removes the order, its garments and payments. This cannot be undone.",
                danger: true,
                confirmLabel: "Delete",
              });
              if (ok)
                run("Deleted ✓", async () => {
                  await deleteOrder(o.id);
                  setSelectedId(null);
                });
            }}
            className="flex min-h-[44px] items-center gap-1 self-start text-base font-medium text-red-600 hover:underline"
          >
            <TrashIcon className="h-5 w-5" /> Delete this order
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────── LIST ──────────────────────────────
  const filtered = orders.filter((o) => {
    if (q && !`#${o.order_no} ${o.customer?.name ?? ""} ${o.customer?.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()))
      return false;
    if (quick === "unpaid" && balance(o) <= 0) return false;
    if (quick === "due_today" && o.due_date !== today) return false;
    if (quick === "overdue" && !(o.due_date && o.due_date < today && o.status !== "delivered")) return false;
    return true;
  });

  const chip = (key: string, label: string) => (
    <button
      onClick={() => setQuick(key)}
      className={`min-h-[44px] rounded-full px-4 py-2 text-base font-medium transition-colors ${
        quick === key ? "bg-brown text-cream" : "bg-cream-alt text-brown-light hover:text-gold"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Orders</h2>
        {status && <span className={`text-base ${noticeClass(status)}`}>{status}</span>}
      </div>

      {/* New order */}
      {creating ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gold/50 p-3">
          <input className={`${input} w-44`} placeholder="Phone number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <input className={`${input} w-48`} placeholder="Name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button onClick={createNew} className={ADMIN_BTN.PRIMARY}>
            Start order
          </button>
          <button onClick={() => setCreating(false)} className={ADMIN_BTN.SECONDARY}>
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setCreating(true)} className={`mt-3 ${ADMIN_BTN.PRIMARY}`}>
          + New order
        </button>
      )}

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {chip("all", "All")}
        {chip("due_today", "Due today")}
        {chip("overdue", "Overdue")}
        {chip("unpaid", "Unpaid")}
      </div>
      <input
        className={`${input} mt-3 w-full`}
        placeholder="Search name, phone or order #…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {/* Cards */}
      <div className="mt-4 flex flex-col gap-2">
        {filtered.map((o) => {
          const bal = balance(o);
          const overdue = o.due_date && o.due_date < today && o.status !== "delivered";
          return (
            <button
              key={o.id}
              onClick={() => setSelectedId(o.id)}
              className="rounded-lg border border-brown-light/15 p-3 text-left transition-colors hover:border-gold"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-brown">
                  #{o.order_no} · {o.customer?.name || o.customer?.phone || "—"}
                  {o.is_rush && <span className="ml-2 text-xs font-bold text-red-600">RUSH</span>}
                </span>
                <span className={`text-base font-bold ${bal > 0 ? "text-red-600" : "text-green-700"}`}>
                  {bal > 0 ? `${formatINR(bal)} due` : "Paid ✓"}
                </span>
              </div>
              <div className="mt-2">
                <StatusStepper current={o.status} variant="mini" />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-sm text-brown-light">
                <span>
                  {statusLabel(o.status)} · {o.order_items.length} garment(s)
                </span>
                {o.due_date && <span className={overdue ? "font-semibold text-red-600" : ""}>due {formatDate(o.due_date)}</span>}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && status === "" && (
          <EmptyState message="No orders yet — tap “New order” to start one.">
            <button onClick={() => setCreating(true)} className={ADMIN_BTN.PRIMARY}>
              + New order
            </button>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
