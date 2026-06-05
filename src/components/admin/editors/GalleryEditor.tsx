"use client";

import Image from "next/image";
import { GALLERY_CATEGORY, ADMIN_FIELD } from "@/data/constants";
import { upsertRow, deleteRow } from "@/lib/admin/content-admin";
import { useAdminRows } from "@/lib/admin/use-admin-rows";
import { useReorder } from "@/lib/admin/use-reorder";
import { isErrorNotice, friendlyError } from "@/lib/admin/notice";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import EmptyState from "@/components/admin/EmptyState";
import Toggle from "@/components/admin/Toggle";
import ReorderControls from "@/components/admin/ReorderControls";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { TrashIcon } from "@/components/icons";

type Row = {
  id: string;
  url: string;
  category: string;
  alt: string;
  display_order: number;
  is_visible: boolean;
};

const CATEGORIES = [
  GALLERY_CATEGORY.BRIDAL,
  GALLERY_CATEGORY.FESTIVAL,
  GALLERY_CATEGORY.DAILY,
  GALLERY_CATEGORY.ALTERATIONS,
  GALLERY_CATEGORY.FABRIC,
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function GalleryEditor() {
  const confirm = useConfirm();
  const { rows, setRows, status, setStatus, reload } = useAdminRows<Row>("gallery_images");
  const reorder = useReorder<Row>("gallery_images", rows, setRows, setStatus);

  function patch(id: string, p: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  }

  // Throws on failure so the SaveButton shows its error state.
  function save(row: Row) {
    return upsertRow("gallery_images", { ...row });
  }

  async function remove(row: Row) {
    const ok = await confirm({ title: "Delete this photo?", danger: true, confirmLabel: "Delete" });
    if (!ok) return;
    try {
      await deleteRow("gallery_images", row.id);
      await reload();
    } catch (e) {
      setStatus(friendlyError(e, "delete"));
    }
  }

  async function addImage(url: string) {
    const nextOrder = rows.reduce((m, r) => Math.max(m, r.display_order), 0) + 1;
    setStatus("Adding…");
    try {
      await upsertRow("gallery_images", {
        url,
        category: GALLERY_CATEGORY.BRIDAL,
        alt: "",
        display_order: nextOrder,
        is_visible: true,
      });
      await reload();
      setStatus("Photo added ✓");
    } catch (e) {
      setStatus(friendlyError(e, "add"));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Gallery</h2>
        {status && <span className={`text-base ${isErrorNotice(status) ? "text-red-600" : "text-green-700"}`}>{status}</span>}
      </div>
      <p className="mt-2 text-base text-brown-light">
        The photos shown in the gallery on your website. Use the arrows (or drag on a computer) to change the order — the first one shows first.
      </p>

      <div className="mt-4 rounded-lg border border-dashed border-brown-light/25 p-4">
        <p className="mb-3 text-base font-medium text-brown">Add a photo</p>
        <ImageUpload folder="gallery" onUploaded={addImage} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {rows.map((row, i) => (
          <div
            key={row.id}
            {...reorder.rowDropProps(i)}
            className={`flex gap-3 rounded-lg border p-3 transition-colors ${
              reorder.overIndex === i ? "border-gold bg-gold/5" : "border-brown-light/15"
            } ${reorder.dragIndex === i ? "opacity-50" : ""}`}
          >
            <ReorderControls index={i} total={rows.length} onMove={reorder.move} dragHandleProps={reorder.dragHandleProps(i)} />
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-cream-alt">
              <Image src={row.url} alt={row.alt} fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm text-brown-light">
                  Category{" "}
                  <select value={row.category} onChange={(e) => patch(row.id, { category: e.target.value })} className={`${ADMIN_FIELD} ml-1`}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {cap(c)}
                      </option>
                    ))}
                  </select>
                </label>
                <Toggle checked={row.is_visible} onChange={(v) => patch(row.id, { is_visible: v })} label="Show on website" />
              </div>
              <input
                type="text"
                value={row.alt ?? ""}
                onChange={(e) => patch(row.id, { alt: e.target.value })}
                placeholder="Short description (helps people who can't see the image)"
                className={`${ADMIN_FIELD} w-full`}
              />
              <div className="flex items-center gap-4">
                <SaveButton variant="secondary" onSave={() => save(row)}>
                  Save
                </SaveButton>
                <button
                  onClick={() => remove(row)}
                  className="flex min-h-[44px] items-center gap-1 text-base font-medium text-red-600 hover:underline"
                >
                  <TrashIcon className="h-5 w-5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && status === "" && <EmptyState message="No photos yet — add one above." />}
      </div>
    </div>
  );
}
