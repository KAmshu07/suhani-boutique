"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { XIcon, ArrowRightIcon } from "@/components/icons";

type Item = { id: string; url: string; alt: string };

// Full-screen image viewer for the gallery. Controlled: the parent owns the
// open index (null = closed). Esc closes, arrow keys navigate, backdrop closes,
// body scroll is locked while open.
export default function Lightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: {
  items: Item[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const open = index != null && index >= 0 && index < items.length;

  const prev = useCallback(() => {
    if (index != null) onIndexChange((index - 1 + items.length) % items.length);
  }, [index, items.length, onIndexChange]);

  const next = useCallback(() => {
    if (index != null) onIndexChange((index + 1) % items.length);
  }, [index, items.length, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, prev, next]);

  if (!open) return null;
  const item = items[index];
  const circle =
    "flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/25";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt || "Gallery image"}
      onClick={onClose}
      className="lightbox-fade fixed inset-0 z-[80] flex items-center justify-center bg-brown/95 p-4 sm:p-8"
    >
      <button onClick={onClose} aria-label="Close" className={`absolute right-4 top-4 z-10 ${circle}`}>
        <XIcon className="h-6 w-6" />
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous image"
            className={`absolute left-2 top-1/2 z-10 -translate-y-1/2 sm:left-6 ${circle}`}
          >
            <ArrowRightIcon className="h-6 w-6 rotate-180" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next image"
            className={`absolute right-2 top-1/2 z-10 -translate-y-1/2 sm:right-6 ${circle}`}
          >
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      <figure onClick={(e) => e.stopPropagation()} className="flex flex-col items-center">
        <div className="relative h-[70vh] w-[88vw] max-w-3xl">
          <Image src={item.url} alt={item.alt} fill className="object-contain" sizes="(max-width: 768px) 88vw, 768px" />
        </div>
        {item.alt && <figcaption className="mt-4 max-w-xl text-center font-body text-sm text-cream/80">{item.alt}</figcaption>}
        <div className="mt-1 font-heading text-xs uppercase tracking-widest text-cream/40">
          {index + 1} / {items.length}
        </div>
      </figure>
    </div>
  );
}
