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
import { WhatsAppIcon, PhoneIcon } from "@/components/icons";

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

const STAGES = [
  { key: "booked", label: "Booked" },
  { key: "consulted", label: "Consulted" },
  { key: "measured", label: "Measured" },
  { key: "fabric_selected", label: "Fabric" },
  { key: "in_progress", label: "Stitching" },
  { key: "ready_for_fitting", label: "Fitting" },
  { key: "alterations", label: "Alterations" },
  { key: "completed", label: "Ready" },
  { key: "delivered", label: "Delivered" },
];
const LABEL: Record<string, string> = Object.fromEntries(STAGES.map((s) => [s.key, s.label]));
const idxOf = (s: string) => Math.max(0, STAGES.findIndex((x) => x.key === s));

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
function sum<T>(arr: T[], f: (x: T) => number): number {
  return arr.reduce((a, x) => a + (Number(f(x)) || 0), 0);
}

const input =
  "bg-cream-alt border border-brown-light/20 px-3 py-2 text-brown focus:border-gold focus:outline-none rounded";

export default function OrdersEditor() {
  const { data: orders, setData, status, setStatus, reload } = useAsyncData<Order[]>(listOrders, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quick, setQuick] = useState("all");
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [payAmt, setPayAmt] = useState("");
  const [payMethod, setPayMethod] = useState("cash");

  const today = new Date().toISOString().slice(0, 10);
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

  function setStatusAndMaybeNotify(o: Order, s: string) {
    run("Saved ✓", () => updateOrder(o.id, { status: s, ...(s === "delivered" ? { delivered_date: today } : {}) }));
  }
  function sendUpdate(o: Order) {
    const phone = o.customer?.phone;
    if (!phone) return setStatus("No phone number for this customer.");
    const msg = (orderStatusMessages[o.status as keyof typeof orderStatusMessages] ?? "").replace("{no}", String(o.order_no));
    if (!window.confirm(`Send this WhatsApp to ${o.customer?.name || phone} (${phone})?\n\n${msg}`)) return;
    window.open(getWhatsAppUrl(msg, phone), "_blank", "noopener");
  }

  // ────────────────────────────── DETAIL ──────────────────────────────
  if (selected) {
    const o = selected;
    const cur = idxOf(o.status);
    const bal = balance(o);
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedId(null)} className="text-sm font-heading uppercase tracking-wider text-brown-light hover:text-gold">
            ← All orders
          </button>
          {status && <span className="text-xs text-brown-light">{status}</span>}
        </div>

        {/* Customer */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-2xl font-bold">#{o.order_no}</h2>
            {o.is_rush && <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-heading uppercase tracking-wider text-white">Rush</span>}
          </div>
          <div className="mt-1 flex items-center gap-3 text-brown-light">
            <span className="text-base text-brown">{o.customer?.name || "(no name)"}</span>
            {o.customer?.phone && (
              <a href={`tel:${o.customer.phone}`} className="flex items-center gap-1 text-sm hover:text-gold">
                <PhoneIcon className="h-4 w-4 text-gold" />
                {o.customer.phone}
              </a>
            )}
          </div>
        </div>

        {/* Status — visual */}
        <div className="rounded-lg bg-cream-alt p-4">
          <div className="flex gap-1">
            {STAGES.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setStatusAndMaybeNotify(o, s.key)}
                title={s.label}
                className={`h-3 flex-1 rounded-full transition-colors ${i <= cur ? "bg-gold" : "bg-brown-light/20"}`}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="font-heading text-lg font-semibold text-brown">{LABEL[o.status]}</span>
            {cur < STAGES.length - 1 && (
              <button
                onClick={() => setStatusAndMaybeNotify(o, STAGES[cur + 1].key)}
                className="rounded bg-brown px-3 py-2 text-xs font-heading uppercase tracking-wider text-cream hover:bg-gold transition-colors"
              >
                Move to {STAGES[cur + 1].label} →
              </button>
            )}
          </div>
          <button
            onClick={() => run("All garments updated ✓", () => applyStatusToAllItems(o.id, o.status))}
            className="mt-2 text-xs text-brown-light hover:text-gold"
          >
            ↳ set all garments to &ldquo;{LABEL[o.status]}&rdquo;
          </button>
          <button
            onClick={() => sendUpdate(o)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded bg-whatsapp px-3 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            <WhatsAppIcon className="h-5 w-5" /> Send update to customer
          </button>
        </div>

        {/* Money — visual */}
        <div className="flex items-stretch gap-3 text-center">
          <div className="flex-1 rounded-lg bg-cream-alt p-3">
            <div className="text-xs text-brown-light">Total</div>
            <div className="text-lg font-semibold text-brown">₹{total(o)}</div>
          </div>
          <div className="flex-1 rounded-lg bg-cream-alt p-3">
            <div className="text-xs text-brown-light">Paid</div>
            <div className="text-lg font-semibold text-green-700">₹{paid(o)}</div>
          </div>
          <div className={`flex-1 rounded-lg p-3 ${bal > 0 ? "bg-red-50" : "bg-green-50"}`}>
            <div className="text-xs text-brown-light">{bal > 0 ? "Balance due" : "Settled"}</div>
            <div className={`text-2xl font-bold ${bal > 0 ? "text-red-600" : "text-green-700"}`}>₹{bal}</div>
          </div>
        </div>

        {/* Garments */}
        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-brown-light">Garments</h3>
          <div className="mt-2 flex flex-col gap-3">
            {o.order_items.map((it) => (
              <div key={it.id} className="rounded-lg border border-brown-light/15 p-3 flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <input
                    className={`${input} flex-1 min-w-[10rem]`}
                    placeholder="Garment (e.g. Lehenga)"
                    value={it.garment_type ?? ""}
                    onChange={(e) => patchItem(o.id, it.id, { garment_type: e.target.value })}
                    onBlur={() => run("Saved ✓", () => updateOrderItem(it.id, { garment_type: it.garment_type }), false)}
                  />
                  <div className="flex items-center rounded border border-brown-light/20 bg-cream-alt px-2">
                    <span className="text-brown-light">₹</span>
                    <input
                      className="w-20 bg-transparent py-2 text-brown focus:outline-none"
                      type="number"
                      placeholder="0"
                      value={it.price}
                      onChange={(e) => patchItem(o.id, it.id, { price: Number(e.target.value) })}
                      onBlur={() => run("Saved ✓", () => updateOrderItem(it.id, { price: Number(it.price) || 0 }), false)}
                    />
                  </div>
                  <select
                    className={input}
                    value={it.status}
                    onChange={(e) => {
                      patchItem(o.id, it.id, { status: e.target.value });
                      run("Saved ✓", () => updateOrderItem(it.id, { status: e.target.value }));
                    }}
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  className={input}
                  placeholder="Measurements (chest, waist, length…)"
                  value={it.measurements ?? ""}
                  onChange={(e) => patchItem(o.id, it.id, { measurements: e.target.value })}
                  onBlur={() => run("Saved ✓", () => updateOrderItem(it.id, { measurements: it.measurements }), false)}
                />
                <div className="flex items-center justify-between">
                  <label className="text-xs text-brown-light">
                    Due{" "}
                    <input
                      type="date"
                      className={`${input} ml-1`}
                      value={it.due_date ?? ""}
                      onChange={(e) => patchItem(o.id, it.id, { due_date: e.target.value })}
                      onBlur={() => run("Saved ✓", () => updateOrderItem(it.id, { due_date: it.due_date || null }), false)}
                    />
                  </label>
                  <button
                    onClick={() => window.confirm("Remove this garment?") && run("Removed", () => deleteOrderItem(it.id))}
                    className="text-xs font-heading uppercase tracking-wider text-red-600 hover:underline"
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => run("Garment added ✓", () => addOrderItem(o.id, { garment_type: "", price: 0, status: o.status }))}
              className="self-start rounded border border-dashed border-brown-light/30 px-4 py-2 text-sm font-heading uppercase tracking-wider text-gold hover:border-gold"
            >
              + Add garment
            </button>
          </div>
        </div>

        {/* Payments */}
        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-brown-light">Payments</h3>
          <div className="mt-2 flex flex-col gap-2">
            {o.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded bg-cream-alt px-3 py-2 text-sm">
                <span>
                  <span className="font-semibold">₹{p.amount}</span>{" "}
                  <span className="uppercase text-brown-light text-xs">{p.method}</span>{" "}
                  <span className="text-brown-light text-xs">{p.received_date}</span>
                </span>
                <button onClick={() => run("Removed", () => deletePayment(p.id))} className="text-xs text-red-600 hover:underline">
                  ✕
                </button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded border border-brown-light/20 bg-cream-alt px-2">
                <span className="text-brown-light">₹</span>
                <input
                  className="w-24 bg-transparent py-2 focus:outline-none"
                  type="number"
                  placeholder="Amount"
                  value={payAmt}
                  onChange={(e) => setPayAmt(e.target.value)}
                />
              </div>
              {["cash", "upi"].map((m) => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className={`rounded px-4 py-2 text-xs font-heading uppercase tracking-wider ${
                    payMethod === m ? "bg-gold text-cream" : "bg-cream-alt text-brown-light"
                  }`}
                >
                  {m}
                </button>
              ))}
              <button
                onClick={() => {
                  const amount = Number(payAmt);
                  if (!amount || amount <= 0) return setStatus("Enter an amount first.");
                  setPayAmt("");
                  run("Payment added ✓", () => addPayment(o.id, { amount, method: payMethod, received_date: today }));
                }}
                className="rounded bg-brown px-4 py-2 text-xs font-heading uppercase tracking-wider text-cream hover:bg-gold"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2 border-t border-brown-light/15 pt-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={o.is_rush}
              onChange={(e) => {
                patchOrder(o.id, { is_rush: e.target.checked });
                run("Saved ✓", () => updateOrder(o.id, { is_rush: e.target.checked }));
              }}
            />
            Mark as Rush / priority
          </label>
          <label className="text-xs text-brown-light">
            Overall due date{" "}
            <input
              type="date"
              className={`${input} ml-1`}
              value={o.due_date ?? ""}
              onChange={(e) => patchOrder(o.id, { due_date: e.target.value })}
              onBlur={() => run("Saved ✓", () => updateOrder(o.id, { due_date: o.due_date || null }), false)}
            />
          </label>
          <textarea
            className={input}
            rows={2}
            placeholder="Notes about this order…"
            value={o.notes ?? ""}
            onChange={(e) => patchOrder(o.id, { notes: e.target.value })}
            onBlur={() => run("Saved ✓", () => updateOrder(o.id, { notes: o.notes }), false)}
          />
          <button
            onClick={() => window.confirm(`Delete order #${o.order_no}? This cannot be undone.`) && run("Deleted", async () => {
              await deleteOrder(o.id);
              setSelectedId(null);
            })}
            className="self-start text-xs font-heading uppercase tracking-wider text-red-600 hover:underline"
          >
            Delete this order
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────── LIST ──────────────────────────────
  const filtered = orders.filter((o) => {
    if (q && !`#${o.order_no} ${o.customer?.name ?? ""} ${o.customer?.phone ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (quick === "unpaid" && balance(o) <= 0) return false;
    if (quick === "due_today" && o.due_date !== today) return false;
    if (quick === "overdue" && !(o.due_date && o.due_date < today && o.status !== "delivered")) return false;
    return true;
  });

  const chip = (key: string, label: string) => (
    <button
      onClick={() => setQuick(key)}
      className={`rounded-full px-4 py-2 text-xs font-heading uppercase tracking-wider transition-colors ${
        quick === key ? "bg-gold text-cream" : "bg-cream-alt text-brown-light hover:text-gold"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Orders</h2>
        {status && <span className="text-xs text-brown-light">{status}</span>}
      </div>

      {/* New order */}
      {creating ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gold/50 p-3">
          <input className={`${input} w-40`} placeholder="Phone number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <input className={`${input} w-44`} placeholder="Name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button onClick={createNew} className="rounded bg-gold px-4 py-2 text-xs font-heading uppercase tracking-wider text-cream hover:bg-brown">
            Start order
          </button>
          <button onClick={() => setCreating(false)} className="text-xs font-heading uppercase tracking-wider text-brown-light hover:text-gold">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="mt-3 rounded bg-gold px-5 py-2.5 text-sm font-heading uppercase tracking-wider text-cream hover:bg-brown"
        >
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
      <input className={`${input} w-full mt-3`} placeholder="Search name, phone or order #…" value={q} onChange={(e) => setQ(e.target.value)} />

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
                  {bal > 0 ? `₹${bal} due` : "Paid ✓"}
                </span>
              </div>
              {/* mini progress bar */}
              <div className="mt-2 flex gap-0.5">
                {STAGES.map((s, i) => (
                  <span key={s.key} className={`h-1.5 flex-1 rounded-full ${i <= idxOf(o.status) ? "bg-gold" : "bg-brown-light/15"}`} />
                ))}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs text-brown-light">
                <span>
                  {LABEL[o.status]} · {o.order_items.length} garment(s)
                </span>
                {o.due_date && <span className={overdue ? "font-semibold text-red-600" : ""}>due {o.due_date}</span>}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && status === "" && <p className="text-sm text-brown-light">No orders yet — tap “New order” to start one.</p>}
      </div>
    </div>
  );
}
