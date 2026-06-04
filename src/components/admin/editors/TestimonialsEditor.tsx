"use client";

import { upsertRow, deleteRow } from "@/lib/admin/content-admin";
import { useAdminRows } from "@/lib/admin/use-admin-rows";
import LocalizedInput from "@/components/admin/LocalizedInput";
import type { Localized } from "@/lib/localized";

type Row = {
  id: string;
  customer_name: string;
  service: string;
  quote: Partial<Localized>;
  rating: number;
  is_visible: boolean;
  display_order: number;
};

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

const fieldClass =
  "bg-cream-alt border border-brown-light/20 px-2 py-1.5 text-brown text-sm focus:border-gold focus:outline-none";

export default function TestimonialsEditor() {
  const { rows, setRows, status, setStatus, reload } = useAdminRows<Row>("testimonials");

  function patch(id: string, p: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  }

  async function save(row: Row) {
    setStatus("Saving…");
    try {
      await upsertRow("testimonials", { ...row, quote: row.quote ?? {} });
      setStatus("Saved ✓");
    } catch (e) {
      setStatus("Save failed: " + errMsg(e));
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteRow("testimonials", id);
      await reload();
    } catch (e) {
      setStatus("Delete failed: " + errMsg(e));
    }
  }

  async function add() {
    const nextOrder = rows.reduce((m, r) => Math.max(m, r.display_order), 0) + 1;
    setStatus("Adding…");
    try {
      await upsertRow("testimonials", {
        customer_name: "",
        service: "",
        quote: {},
        rating: 5,
        is_visible: false,
        display_order: nextOrder,
      });
      await reload();
      setStatus("Added (hidden until you fill it in) ✓");
    } catch (e) {
      setStatus("Add failed: " + errMsg(e));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Reviews</h2>
        {status && <span className="text-xs text-brown-light">{status}</span>}
      </div>
      <p className="mt-2 text-sm text-brown-light">Only add real reviews, with the customer&rsquo;s permission.</p>
      <button
        onClick={add}
        className="mt-3 bg-gold text-cream px-4 py-1.5 text-xs font-heading uppercase tracking-wider hover:bg-brown transition-colors"
      >
        + Add review
      </button>

      <div className="mt-6 flex flex-col gap-6">
        {rows.map((row) => (
          <div key={row.id} className="border border-brown-light/15 p-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs text-brown-light">
                Customer name
                <input
                  className={`${fieldClass} w-full mt-1`}
                  value={row.customer_name ?? ""}
                  onChange={(e) => patch(row.id, { customer_name: e.target.value })}
                />
              </label>
              <label className="text-xs text-brown-light">
                Service
                <input
                  className={`${fieldClass} w-full mt-1`}
                  value={row.service ?? ""}
                  onChange={(e) => patch(row.id, { service: e.target.value })}
                />
              </label>
            </div>
            <LocalizedInput label="Review" multiline value={row.quote ?? {}} onChange={(v) => patch(row.id, { quote: v })} />
            <div className="flex flex-wrap items-center gap-3 text-xs text-brown-light">
              <label>
                Rating{" "}
                <select
                  value={row.rating}
                  onChange={(e) => patch(row.id, { rating: Number(e.target.value) })}
                  className={`${fieldClass} ml-1`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Order{" "}
                <input
                  type="number"
                  value={row.display_order}
                  onChange={(e) => patch(row.id, { display_order: Number(e.target.value) })}
                  className={`${fieldClass} ml-1 w-16`}
                />
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={row.is_visible}
                  onChange={(e) => patch(row.id, { is_visible: e.target.checked })}
                />
                Visible
              </label>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => save(row)}
                className="bg-gold text-cream px-4 py-1.5 text-xs font-heading uppercase tracking-wider hover:bg-brown transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => remove(row.id)}
                className="text-xs font-heading uppercase tracking-wider text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
