"use client";

import Image from "next/image";
import { GALLERY_CATEGORY } from "@/data/constants";
import { upsertRow, deleteRow } from "@/lib/admin/content-admin";
import { useAdminRows } from "@/lib/admin/use-admin-rows";
import ImageUpload from "@/components/admin/ImageUpload";

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
  const { rows, setRows, status, setStatus, reload } = useAdminRows<Row>("gallery_images");

  function patch(id: string, p: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  }

  async function save(row: Row) {
    setStatus("Saving…");
    try {
      await upsertRow("gallery_images", { ...row });
      setStatus("Saved ✓");
    } catch (e) {
      setStatus("Save failed: " + errMsg(e));
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this image?")) return;
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
    "bg-cream-alt border border-brown-light/20 px-2 py-1.5 text-brown text-sm focus:border-gold focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-wider">Gallery</h2>
        {status && <span className="text-xs text-brown-light">{status}</span>}
      </div>

      <div className="mt-4 border border-dashed border-brown-light/25 p-4">
        <p className="text-xs font-heading uppercase tracking-wider text-brown-light mb-2">Add a photo</p>
        <ImageUpload folder="gallery" onUploaded={addImage} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.id} className="flex gap-3 border border-brown-light/15 p-3">
            <div className="relative w-20 h-24 shrink-0 overflow-hidden bg-cream-alt">
              <Image src={row.url} alt={row.alt} fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={row.category}
                  onChange={(e) => patch(row.id, { category: e.target.value })}
                  className={field}
                >
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
                <label className="flex items-center gap-1 text-xs text-brown-light">
                  <input
                    type="checkbox"
                    checked={row.is_visible}
                    onChange={(e) => patch(row.id, { is_visible: e.target.checked })}
                  />
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
          </div>
        ))}
        {rows.length === 0 && status === "" && (
          <p className="text-sm text-brown-light">No photos yet — add one above.</p>
        )}
      </div>
    </div>
  );
}
