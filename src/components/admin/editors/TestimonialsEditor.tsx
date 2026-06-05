"use client";

import { upsertRow, deleteRow } from "@/lib/admin/content-admin";
import { useAdminRows } from "@/lib/admin/use-admin-rows";
import { isErrorNotice, friendlyError } from "@/lib/admin/notice";
import { ADMIN_BTN, ADMIN_FIELD } from "@/data/constants";
import LocalizedInput from "@/components/admin/LocalizedInput";
import SaveButton from "@/components/admin/SaveButton";
import EmptyState from "@/components/admin/EmptyState";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { TrashIcon } from "@/components/icons";
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

const fieldClass = ADMIN_FIELD;

export default function TestimonialsEditor() {
  const confirm = useConfirm();
  const { rows, setRows, status, setStatus, reload } = useAdminRows<Row>("testimonials");

  function patch(id: string, p: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  }

  // Throws on failure so the SaveButton shows its error state.
  function save(row: Row) {
    return upsertRow("testimonials", { ...row, quote: row.quote ?? {} });
  }

  async function remove(id: string) {
    const ok = await confirm({ title: "Delete this review?", danger: true, confirmLabel: "Delete" });
    if (!ok) return;
    try {
      await deleteRow("testimonials", id);
      await reload();
    } catch (e) {
      setStatus(friendlyError(e, "delete"));
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
      setStatus(friendlyError(e, "add"));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Reviews</h2>
        {status && <span className={`text-base ${isErrorNotice(status) ? "text-red-600" : "text-green-700"}`}>{status}</span>}
      </div>
      <p className="mt-2 text-base text-brown-light">Only add real reviews, with the customer&rsquo;s permission.</p>
      <button onClick={add} className={`mt-3 ${ADMIN_BTN.PRIMARY}`}>
        + Add review
      </button>

      <div className="mt-6 flex flex-col gap-6">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-col gap-3 border border-brown-light/15 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm text-brown-light">
                Customer name
                <input className={`${fieldClass} mt-1 w-full`} value={row.customer_name ?? ""} onChange={(e) => patch(row.id, { customer_name: e.target.value })} />
              </label>
              <label className="text-sm text-brown-light">
                Service
                <input className={`${fieldClass} mt-1 w-full`} value={row.service ?? ""} onChange={(e) => patch(row.id, { service: e.target.value })} />
              </label>
            </div>
            <LocalizedInput label="Review" multiline value={row.quote ?? {}} onChange={(v) => patch(row.id, { quote: v })} />
            <div className="flex flex-wrap items-center gap-3 text-sm text-brown-light">
              <label>
                Rating{" "}
                <select value={row.rating} onChange={(e) => patch(row.id, { rating: Number(e.target.value) })} className={`${fieldClass} ml-1`}>
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
                <input type="checkbox" className="h-5 w-5" checked={row.is_visible} onChange={(e) => patch(row.id, { is_visible: e.target.checked })} />
                Visible
              </label>
            </div>
            <div className="flex items-center gap-4">
              <SaveButton variant="secondary" onSave={() => save(row)}>
                Save
              </SaveButton>
              <button
                onClick={() => remove(row.id)}
                className="flex min-h-[44px] items-center gap-1 text-base font-medium text-red-600 hover:underline"
              >
                <TrashIcon className="h-5 w-5" /> Delete
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && status === "" && <EmptyState message="No reviews yet — tap “Add review” when a customer gives one." />}
      </div>
    </div>
  );
}
