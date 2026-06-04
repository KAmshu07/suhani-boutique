"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Uploads an image to the public `site-images` bucket (admin-only by policy) and
// returns its public URL. Used by the gallery and hero editors.
export default function ImageUpload({
  folder,
  currentUrl,
  onUploaded,
}: {
  folder: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 5 MB.");
      return;
    }
    setBusy(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("site-images")
      .upload(path, file, { upsert: false });
    if (upErr) {
      setError(upErr.message);
      setBusy(false);
      return;
    }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    onUploaded(data.publicUrl);
    setBusy(false);
  }

  return (
    <div>
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt=""
          className="w-24 h-32 object-cover border border-brown-light/15 mb-2"
        />
      )}
      <input type="file" accept="image/*" onChange={onPick} disabled={busy} className="text-sm" />
      {busy && <p className="text-xs text-brown-light mt-1">Uploading…</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
