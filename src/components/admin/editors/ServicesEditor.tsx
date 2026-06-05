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
  slug: string;
  name: Partial<Localized>;
  description: Partial<Localized> | null;
  price: string | null;
  icon: string | null;
  display_order: number;
  is_visible: boolean;
};

const ICONS = ["scissors", "ruler", "crown", "fabric", "shirt", "sparkles"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ServicesEditor() {
  const confirm = useConfirm();
  const { rows, setRows, status, setStatus, reload } = useAdminRows<Row>("services");
  const reorder = useReorder<Row>("services", rows, setRows, setStatus);

  function patch(id: string, p: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  }

  // Throws on failure so the SaveButton shows its error state.
  function save(row: Row) {
    return upsertRow("services", { ...row, description: row.description ?? {} });
  }

  async function remove(id: string) {
    const ok = await confirm({ title: "Delete this service?", danger: true, confirmLabel: "Delete" });
    if (!ok) return;
    try {
      await deleteRow("services", id);
      await reload();
    } catch (e) {
      setStatus(friendlyError(e, "delete"));
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
      setStatus("Service added (hidden until you fill it in and turn it on) ✓");
    } catch (e) {
      setStatus(friendlyError(e, "add"));
    }
  }

  const field = ADMIN_FIELD;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Services</h2>
        {status && <span className={`text-base ${isErrorNotice(status) ? "text-red-600" : "text-green-700"}`}>{status}</span>}
      </div>
      <p className="mt-2 text-base text-brown-light">
        The services shown on your website. Use the arrows (or drag on a computer) to change the order.
      </p>
      <button onClick={add} className={`mt-3 ${ADMIN_BTN.PRIMARY}`}>
        + Add service
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
              <LocalizedInput label="Name" value={row.name ?? {}} onChange={(v) => patch(row.id, { name: v })} />
              <LocalizedInput
                label="Description"
                multiline
                value={row.description ?? {}}
                onChange={(v) => patch(row.id, { description: v })}
              />
              <div className="flex flex-wrap items-center gap-4 text-sm text-brown-light">
                <label>
                  Price (shown as text){" "}
                  <input
                    type="text"
                    value={row.price ?? ""}
                    onChange={(e) => patch(row.id, { price: e.target.value })}
                    placeholder="e.g. From ₹500"
                    className={`${field} ml-1 w-40`}
                  />
                </label>
                <label>
                  Symbol{" "}
                  <select value={row.icon ?? ""} onChange={(e) => patch(row.id, { icon: e.target.value })} className={`${field} ml-1`}>
                    {ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {cap(ic)}
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
        {rows.length === 0 && status === "" && <EmptyState message="No services yet — tap “Add service”." />}
      </div>
    </div>
  );
}
