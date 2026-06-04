"use client";

import { upsertRow, deleteRow } from "@/lib/admin/content-admin";
import { useAdminRows } from "@/lib/admin/use-admin-rows";
import LocalizedInput from "@/components/admin/LocalizedInput";
import type { Localized } from "@/lib/localized";

type Row = {
  id: string;
  slug: string;
  name: Partial<Localized>;
  description: Partial<Localized> | null;
  price: string | null;
  icon: string | null;
  display_order: number;
  is_visible: boolean;
};

const ICONS = ["scissors", "ruler", "crown", "fabric", "shirt", "sparkles"];

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

export default function ServicesEditor() {
  const { rows, setRows, status, setStatus, reload } = useAdminRows<Row>("services");

  function patch(id: string, p: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  }

  async function save(row: Row) {
    setStatus("Saving…");
    try {
      await upsertRow("services", { ...row, description: row.description ?? {} });
      setStatus("Saved ✓");
    } catch (e) {
      setStatus("Save failed: " + errMsg(e));
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this service?")) return;
    try {
      await deleteRow("services", id);
      await reload();
    } catch (e) {
      setStatus("Delete failed: " + errMsg(e));
    }
  }

  async function add() {
    const nextOrder = rows.reduce((m, r) => Math.max(m, r.display_order), 0) + 1;
    setStatus("Adding…");
    try {
      await upsertRow("services", {
        slug: `svc_${crypto.randomUUID().slice(0, 8)}`,
        name: {},
        description: {},
        price: "",
        icon: "scissors",
        display_order: nextOrder,
        is_visible: false,
      });
      await reload();
      setStatus("Added (hidden until you fill it in) ✓");
    } catch (e) {
      setStatus("Add failed: " + errMsg(e));
    }
  }

  const field =
    "bg-cream-alt border border-brown-light/20 px-2 py-1.5 text-brown text-sm focus:border-gold focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Services</h2>
        {status && <span className="text-xs text-brown-light">{status}</span>}
      </div>
      <button
        onClick={add}
        className="mt-3 bg-gold text-cream px-4 py-1.5 text-xs font-heading uppercase tracking-wider hover:bg-brown transition-colors"
      >
        + Add service
      </button>

      <div className="mt-6 flex flex-col gap-6">
        {rows.map((row) => (
          <div key={row.id} className="border border-brown-light/15 p-4 flex flex-col gap-3">
            <LocalizedInput label="Name" value={row.name ?? {}} onChange={(v) => patch(row.id, { name: v })} />
            <LocalizedInput
              label="Description"
              multiline
              value={row.description ?? {}}
              onChange={(v) => patch(row.id, { description: v })}
            />
            <div className="flex flex-wrap items-center gap-3 text-xs text-brown-light">
              <label>
                Price{" "}
                <input
                  type="text"
                  value={row.price ?? ""}
                  onChange={(e) => patch(row.id, { price: e.target.value })}
                  placeholder="500-5000"
                  className={`${field} ml-1 w-28`}
                />
              </label>
              <label>
                Icon{" "}
                <select
                  value={row.icon ?? ""}
                  onChange={(e) => patch(row.id, { icon: e.target.value })}
                  className={`${field} ml-1`}
                >
                  {ICONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
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
                  className={`${field} ml-1 w-16`}
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
