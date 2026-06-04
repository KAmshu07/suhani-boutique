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

type Item = {
  id: string;
  garment_type: string | null;
  description: string | null;
  price: number;
  status: string;
  measurements: string | null;
  fabric_notes: string | null;
  due_date: string | null;
};
type Payment = { id: string; amount: number; method: string; received_date: string | null; note: string | null };
type Customer = { id: string; name: string | null; phone: string };
type Order = {
  id: string;
  order_no: number;
  status: string;
  is_rush: boolean;
  notes: string | null;
  order_date: string | null;
  due_date: string | null;
  delivered_date: string | null;
  customer: Customer | null;
  order_items: Item[];
  payments: Payment[];
};

const STAGES = [
  { key: "booked", label: "Booked" },
  { key: "consulted", label: "Consulted" },
  { key: "measured", label: "Measured" },
  { key: "fabric_selected", label: "Fabric Selected" },
  { key: "in_progress", label: "In Progress" },
  { key: "ready_for_fitting", label: "Ready for Fitting" },
  { key: "alterations", label: "Alterations" },
  { key: "completed", label: "Completed" },
  { key: "delivered", label: "Delivered" },
];
const STAGE_LABEL: Record<string, string> = Object.fromEntries(STAGES.map((s) => [s.key, s.label]));

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
function sum<T>(arr: T[], f: (x: T) => number): number {
  return arr.reduce((a, x) => a + (Number(f(x)) || 0), 0);
}

const field =
  "bg-cream-alt border border-brown-light/20 px-2 py-1.5 text-brown text-sm focus:border-gold focus:outline-none";

export default function OrdersEditor() {
  const { data: orders, setData, status, setStatus, reload } = useAsyncData<Order[]>(listOrders, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quick, setQuick] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");
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
        o.id !== orderId
          ? o
          : { ...o, order_items: o.order_items.map((it) => (it.id === itemId ? { ...it, ...p } : it)) },
      ),
    );
  }

  async function newOrder() {
    const phone = window.prompt("Customer phone number?");
    if (!phone || !phone.trim()) return;
    const name = window.prompt("Customer name? (blank if unknown)") ?? "";
    setStatus("Creating…");
    try {
      const c = await findOrCreateCustomer(phone.trim(), name.trim());
      const o = await createOrder(c.id);
      await reload();
      setSelectedId(o.id);
      setStatus("Order created ✓");
    } catch (e) {
      setStatus("Failed: " + errMsg(e));
    }
  }
  async function setOrderStatus(o: Order, s: string) {
    try {
      await updateOrder(o.id, { status: s, ...(s === "delivered" ? { delivered_date: today } : {}) });
      await reload();
    } catch (e) {
      setStatus("Failed: " + errMsg(e));
    }
  }
  async function saveOrderHeader(o: Order) {
    setStatus("Saving…");
    try {
      await updateOrder(o.id, {
        is_rush: o.is_rush,
        notes: o.notes,
        due_date: o.due_date || null,
      });
      setStatus("Saved ✓");
    } catch (e) {
      setStatus("Failed: " + errMsg(e));
    }
  }
  async function applyAll(o: Order) {
    try {
      await applyStatusToAllItems(o.id, o.status);
      await reload();
      setStatus("Applied to all garments ✓");
    } catch (e) {
      setStatus("Failed: " + errMsg(e));
    }
  }
  function sendUpdate(o: Order) {
    const phone = o.customer?.phone;
    if (!phone) {
      setStatus("No customer phone on file.");
      return;
    }
    const msg = (orderStatusMessages[o.status as keyof typeof orderStatusMessages] ?? "").replace(
      "{no}",
      String(o.order_no),
    );
    if (!window.confirm(`Send WhatsApp update to ${o.customer?.name || phone} (${phone})?\n\n${msg}`)) return;
    window.open(getWhatsAppUrl(msg, phone), "_blank", "noopener");
  }
  async function removeOrder(o: Order) {
    if (!window.confirm(`Delete order #${o.order_no}? This cannot be undone.`)) return;
    try {
      await deleteOrder(o.id);
      setSelectedId(null);
      await reload();
    } catch (e) {
      setStatus("Failed: " + errMsg(e));
    }
  }
  async function addItem(o: Order) {
    try {
      await addOrderItem(o.id, { garment_type: "", price: 0, status: o.status });
      await reload();
    } catch (e) {
      setStatus("Failed: " + errMsg(e));
    }
  }
  async function saveItem(it: Item) {
    setStatus("Saving…");
    try {
      await updateOrderItem(it.id, {
        garment_type: it.garment_type,
        description: it.description,
        price: Number(it.price) || 0,
        status: it.status,
        measurements: it.measurements,
        fabric_notes: it.fabric_notes,
        due_date: it.due_date || null,
      });
      setStatus("Saved ✓");
    } catch (e) {
      setStatus("Failed: " + errMsg(e));
    }
  }
  async function removeItem(id: string) {
    if (!window.confirm("Remove this garment?")) return;
    try {
      await deleteOrderItem(id);
      await reload();
    } catch (e) {
      setStatus("Failed: " + errMsg(e));
    }
  }
  async function addPay(o: Order) {
    const amount = Number(payAmt);
    if (!amount || amount <= 0) {
      setStatus("Enter a payment amount.");
      return;
    }
    try {
      await addPayment(o.id, { amount, method: payMethod, received_date: today });
      setPayAmt("");
      await reload();
      setStatus("Payment added ✓");
    } catch (e) {
      setStatus("Failed: " + errMsg(e));
    }
  }
  async function removePay(id: string) {
    if (!window.confirm("Remove this payment?")) return;
    try {
      await deletePayment(id);
      await reload();
    } catch (e) {
      setStatus("Failed: " + errMsg(e));
    }
  }

  // ── DETAIL ──
  if (selected) {
    const o = selected;
    return (
      <div>
        <button
          onClick={() => setSelectedId(null)}
          className="text-xs font-heading uppercase tracking-wider text-brown-light hover:text-gold"
        >
          ← Back to orders
        </button>
        <div className="mt-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">
            Order #{o.order_no} {o.is_rush && <span className="text-red-600">· RUSH</span>}
          </h2>
          {status && <span className="text-xs text-brown-light">{status}</span>}
        </div>
        <p className="text-sm text-brown-light mt-1">
          {o.customer?.name || "(no name)"} · {o.customer?.phone}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select value={o.status} onChange={(e) => setOrderStatus(o, e.target.value)} className={field}>
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => applyAll(o)}
            className="text-xs font-heading uppercase tracking-wider text-brown-light hover:text-gold"
          >
            Apply to all garments
          </button>
          <button
            onClick={() => sendUpdate(o)}
            className="bg-whatsapp text-white px-3 py-1.5 text-xs font-heading uppercase tracking-wider hover:opacity-90"
          >
            Send WhatsApp update
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <span>Total: ₹{total(o)}</span>
          <span>Paid: ₹{paid(o)}</span>
          <span className={balance(o) > 0 ? "text-red-600 font-semibold" : ""}>Balance: ₹{balance(o)}</span>
        </div>

        <h3 className="mt-6 font-heading text-sm font-semibold uppercase tracking-wider text-brown-light">Garments</h3>
        <div className="mt-2 flex flex-col gap-3">
          {o.order_items.map((it) => (
            <div key={it.id} className="border border-brown-light/15 p-3 flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <input
                  className={`${field} w-40`}
                  placeholder="Garment (e.g. Lehenga)"
                  value={it.garment_type ?? ""}
                  onChange={(e) => patchItem(o.id, it.id, { garment_type: e.target.value })}
                />
                <input
                  className={`${field} w-24`}
                  type="number"
                  placeholder="Price"
                  value={it.price}
                  onChange={(e) => patchItem(o.id, it.id, { price: Number(e.target.value) })}
                />
                <select
                  className={field}
                  value={it.status}
                  onChange={(e) => patchItem(o.id, it.id, { status: e.target.value })}
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className={field}
                placeholder="Measurements (chest, waist, length…)"
                value={it.measurements ?? ""}
                onChange={(e) => patchItem(o.id, it.id, { measurements: e.target.value })}
              />
              <input
                className={field}
                placeholder="Fabric notes"
                value={it.fabric_notes ?? ""}
                onChange={(e) => patchItem(o.id, it.id, { fabric_notes: e.target.value })}
              />
              <div className="flex items-center gap-4">
                <label className="text-xs text-brown-light">
                  Due{" "}
                  <input
                    type="date"
                    className={`${field} ml-1`}
                    value={it.due_date ?? ""}
                    onChange={(e) => patchItem(o.id, it.id, { due_date: e.target.value })}
                  />
                </label>
                <button
                  onClick={() => saveItem(it)}
                  className="bg-gold text-cream px-3 py-1 text-xs font-heading uppercase tracking-wider hover:bg-brown"
                >
                  Save
                </button>
                <button
                  onClick={() => removeItem(it.id)}
                  className="text-xs font-heading uppercase tracking-wider text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => addItem(o)}
            className="self-start text-xs font-heading uppercase tracking-wider text-gold hover:text-brown"
          >
            + Add garment
          </button>
        </div>

        <h3 className="mt-6 font-heading text-sm font-semibold uppercase tracking-wider text-brown-light">Payments</h3>
        <div className="mt-2 flex flex-col gap-2">
          {o.payments.map((p) => (
            <div key={p.id} className="flex items-center gap-3 text-sm">
              <span>₹{p.amount}</span>
              <span className="text-brown-light">{p.method}</span>
              <span className="text-brown-light text-xs">{p.received_date}</span>
              <button onClick={() => removePay(p.id)} className="text-xs text-red-600 hover:underline">
                remove
              </button>
            </div>
          ))}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              className={`${field} w-24`}
              type="number"
              placeholder="Amount"
              value={payAmt}
              onChange={(e) => setPayAmt(e.target.value)}
            />
            <select className={field} value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
            <button
              onClick={() => addPay(o)}
              className="bg-gold text-cream px-3 py-1 text-xs font-heading uppercase tracking-wider hover:bg-brown"
            >
              Add payment
            </button>
          </div>
        </div>

        <h3 className="mt-6 font-heading text-sm font-semibold uppercase tracking-wider text-brown-light">Order details</h3>
        <div className="mt-2 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={o.is_rush}
              onChange={(e) => patchOrder(o.id, { is_rush: e.target.checked })}
            />
            Rush / priority
          </label>
          <label className="text-xs text-brown-light">
            Overall due date{" "}
            <input
              type="date"
              className={`${field} ml-1`}
              value={o.due_date ?? ""}
              onChange={(e) => patchOrder(o.id, { due_date: e.target.value })}
            />
          </label>
          <textarea
            className={field}
            rows={2}
            placeholder="Order notes"
            value={o.notes ?? ""}
            onChange={(e) => patchOrder(o.id, { notes: e.target.value })}
          />
          <div className="flex gap-4">
            <button
              onClick={() => saveOrderHeader(o)}
              className="bg-gold text-cream px-4 py-1.5 text-xs font-heading uppercase tracking-wider hover:bg-brown"
            >
              Save details
            </button>
            <button
              onClick={() => removeOrder(o)}
              className="text-xs font-heading uppercase tracking-wider text-red-600 hover:underline"
            >
              Delete order
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST ──
  const filtered = orders.filter((o) => {
    if (q && !`#${o.order_no} ${o.customer?.name ?? ""} ${o.customer?.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()))
      return false;
    if (statusFilter && o.status !== statusFilter) return false;
    if (quick === "unpaid" && balance(o) <= 0) return false;
    if (quick === "due_today" && o.due_date !== today) return false;
    if (quick === "overdue" && !(o.due_date && o.due_date < today && o.status !== "delivered")) return false;
    return true;
  });

  function quickBtn(key: string, label: string) {
    return (
      <button
        onClick={() => setQuick(key)}
        className={`px-3 py-1.5 text-xs font-heading uppercase tracking-wider ${
          quick === key ? "bg-gold text-cream" : "bg-cream-alt text-brown-light hover:text-gold"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Orders</h2>
        {status && <span className="text-xs text-brown-light">{status}</span>}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={newOrder}
          className="bg-gold text-cream px-4 py-1.5 text-xs font-heading uppercase tracking-wider hover:bg-brown"
        >
          + New order
        </button>
        {quickBtn("all", "All")}
        {quickBtn("due_today", "Due today")}
        {quickBtn("overdue", "Overdue")}
        {quickBtn("unpaid", "Unpaid")}
        <select className={field} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Any stage</option>
          {STAGES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <input
        className={`${field} w-full mt-3`}
        placeholder="Search order #, customer name or phone…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="mt-4 flex flex-col gap-2">
        {filtered.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelectedId(o.id)}
            className="text-left border border-brown-light/15 p-3 hover:border-gold transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-brown">
                #{o.order_no} · {o.customer?.name || o.customer?.phone || "—"}
              </span>
              <span className="text-xs font-heading uppercase tracking-wider text-brown-light">
                {STAGE_LABEL[o.status] ?? o.status}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-brown-light">
              <span>
                {o.order_items.length} garment(s)
                {o.is_rush ? " · RUSH" : ""}
                {o.due_date ? ` · due ${o.due_date}` : ""}
              </span>
              <span className={balance(o) > 0 ? "text-red-600 font-semibold" : ""}>
                {balance(o) > 0 ? `₹${balance(o)} due` : "paid"}
              </span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && status === "" && <p className="text-sm text-brown-light">No orders match.</p>}
      </div>
    </div>
  );
}
