"use client";

import Image from "next/image";
import { GALLERY_CATEGORY } from "@/data/constants";
import { upsertRow, deleteRow } from "@/lib/admin/content-admin";
import { useAdminRows } from "@/lib/admin/use-admin-rows";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import EmptyState from "@/components/admin/EmptyState";
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

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

export default function GalleryEditor() {
  const confirm = useConfirm();
  const { rows, setRows, status, setStatus, reload } = useAdminRows<Row>("gallery_images");

  function patch(id: string, p: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  }

  // Throws on failure so the SaveButton shows its error state.
  function save(row: Row) {
    return upsertRow("gallery_images", { ...row });
  }

  async function remove(id: string) {
    const ok = await confirm({ title: "Delete this image?", danger: true, confirmLabel: "Delete" });
    if (!ok) return;
    try {
      await deleteRow("gallery_images", id);
      await reload();
    } catch (e) {
      setStatus("Delete failed: " + errMsg(e));
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
      setStatus("Added ✓");
    } catch (e) {
      setStatus("Add failed: " + errMsg(e));
    }
  }

  const field =
    "bg-cream-alt border border-brown-light/20 px-3 py-2 text-base text-brown focus:border-gold focus:outline-none rounded";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Gallery</h2>
        {status && <span className={`text-base ${/fail/i.test(status) ? "text-red-600" : "text-green-700"}`}>{status}</span>}
      </div>

      <div className="mt-4 border border-dashed border-brown-light/25 p-4">
        <p className="mb-2 text-sm font-heading uppercase tracking-wider text-brown-light">Add a photo</p>
        <ImageUpload folder="gallery" onUploaded={addImage} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.id} className="flex gap-3 border border-brown-light/15 p-3">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-cream-alt">
              <Image src={row.url} alt={row.alt} fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <select value={row.category} onChange={(e) => patch(row.id, { category: e.target.value })} className={field}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={row.display_order}
                  onChange={(e) => patch(row.id, { display_order: Number(e.target.value) })}
                  title="Display order"
                  className={`${field} w-16`}
                />
                <label className="flex items-center gap-1 text-sm text-brown-light">
                  <input type="checkbox" className="h-5 w-5" checked={row.is_visible} onChange={(e) => patch(row.id, { is_visible: e.target.checked })} />
                  Visible
                </label>
              </div>
              <input
                type="text"
                value={row.alt ?? ""}
                onChange={(e) => patch(row.id, { alt: e.target.value })}
                placeholder="Description (alt text)"
                className={field}
              />
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
        {rows.length === 0 && status === "" && <EmptyState message="No photos yet — add one above." />}
      </div>
    </div>
  );
}
