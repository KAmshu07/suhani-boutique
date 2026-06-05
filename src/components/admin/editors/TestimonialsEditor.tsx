"use client";

import { upsertRow, deleteRow } from "@/lib/admin/content-admin";
import { useAdminRows } from "@/lib/admin/use-admin-rows";
import { useReorder } from "@/lib/admin/use-reorder";
import { isErrorNotice, friendlyError } from "@/lib/admin/notice";
import { ADMIN_BTN, ADMIN_FIELD } from "@/data/constants";
import LocalizedInput from "@/components/admin/LocalizedInput";
import SaveButton from "@/components/admin/SaveButton";
import EmptyState from "@/components/admin/EmptyState";
import Toggle from "@/components/admin/Toggle";
import ReorderControls from "@/components/admin/ReorderControls";
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
  const reorder = useReorder<Row>("testimonials", rows, setRows, setStatus);

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
      setStatus("Review added (hidden until you fill it in and turn it on) ✓");
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
      <p className="mt-2 text-base text-brown-light">
        Only add real reviews, with the customer&rsquo;s permission. Use the arrows (or drag on a computer) to change the order.
      </p>
      <button onClick={add} className={`mt-3 ${ADMIN_BTN.PRIMARY}`}>
        + Add review
      </button>

      <div className="mt-6 flex flex-col gap-6">
        {rows.map((row, i) => (
          <div
            key={row.id}
            {...reorder.rowDropProps(i)}
            className={`flex gap-3 rounded-lg border p-4 transition-colors ${
              reorder.overIndex === i ? "border-gold bg-gold/5" : "border-brown-light/15"
            } ${reorder.dragIndex === i ? "opacity-50" : ""}`}
          >
            <ReorderControls index={i} total={rows.length} onMove={reorder.move} dragHandleProps={reorder.dragHandleProps(i)} />
            <div className="flex flex-1 flex-col gap-3">
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
              <div className="flex flex-wrap items-center gap-4 text-sm text-brown-light">
                <label>
                  Stars{" "}
                  <select value={row.rating} onChange={(e) => patch(row.id, { rating: Number(e.target.value) })} className={`${fieldClass} ml-1`}>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {"★".repeat(n)} ({n})
                      </option>
                    ))}
                  </select>
                </label>
                <Toggle checked={row.is_visible} onChange={(v) => patch(row.id, { is_visible: v })} label="Show on website" />
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
          </div>
        ))}
        {rows.length === 0 && status === "" && <EmptyState message="No reviews yet — tap “Add review” when a customer gives one." />}
      </div>
    </div>
  );
}
