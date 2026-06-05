"use client";

import type React from "react";
import { ArrowUpIcon, GripIcon } from "@/components/icons";

// Reorder affordance for a Site Control list item: ↑/↓ buttons (work on touch,
// so they're always shown) plus a drag handle (desktop only — md:block — since
// HTML5 drag is unreliable on touch). Pair with useReorder's handlers.
export default function ReorderControls({
  index,
  total,
  onMove,
  dragHandleProps,
}: {
  index: number;
  total: number;
  onMove: (index: number, dir: -1 | 1) => void;
  dragHandleProps: React.HTMLAttributes<HTMLSpanElement> & { draggable?: boolean };
}) {
  const btn =
    "flex h-9 w-9 items-center justify-center rounded text-brown-light transition-colors hover:bg-cream-alt hover:text-brown disabled:opacity-30";
  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5">
      <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => onMove(index, -1)} className={btn}>
        <ArrowUpIcon className="h-5 w-5" />
      </button>
      <span
        {...dragHandleProps}
        title="Drag to reorder"
        aria-hidden="true"
        className="hidden cursor-grab text-brown-light/50 active:cursor-grabbing md:block"
      >
        <GripIcon className="h-5 w-5" />
      </span>
      <button
        type="button"
        aria-label="Move down"
        disabled={index === total - 1}
        onClick={() => onMove(index, 1)}
        className={btn}
      >
        <ArrowUpIcon className="h-5 w-5 rotate-180" />
      </button>
    </div>
  );
}
