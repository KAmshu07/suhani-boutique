"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UploadIcon, CheckIcon } from "@/components/icons";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Uploads an image to the public `site-images` bucket (admin-only by policy) and
// returns its public URL. Friendly drop-zone: big tap target, drag-and-drop,
// preview, and clear uploading / done / error states. Used by gallery, about, hero.
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
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    setError("");
    setDone(false);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG or PNG).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is too large — please use one under 5 MB.");
      return;
    }
    setBusy(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("site-images").upload(path, file, { upsert: false });
    if (upErr) {
      setError("Upload failed — please check your internet and try again.");
      setBusy(false);
      return;
    }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    onUploaded(data.publicUrl);
    setBusy(false);
    setDone(true);
    window.setTimeout(() => setDone(false), 2500);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt=""
          className="h-32 w-24 shrink-0 rounded-lg border border-brown-light/15 object-cover"
        />
      )}
      <div className="flex-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          disabled={busy}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors disabled:opacity-60 ${
            dragOver ? "border-gold bg-gold/10" : "border-brown-light/30 hover:border-gold hover:bg-cream-alt"
          }`}
        >
          <UploadIcon className="h-7 w-7 text-gold" />
          <span className="text-base font-medium text-brown">
            {busy ? "Uploading…" : currentUrl ? "Choose a different photo" : "Choose a photo"}
          </span>
          <span className="text-sm text-brown-light">or drag an image here · JPG or PNG, up to 5 MB</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
          disabled={busy}
          className="hidden"
        />
        {done && (
          <p className="mt-2 flex items-center gap-1 text-sm font-medium text-green-700">
            <CheckIcon className="h-4 w-4" /> Photo uploaded ✓
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
