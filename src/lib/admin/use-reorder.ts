"use client";

import type React from "react";
import { useState } from "react";
import { upsertRow } from "@/lib/admin/content-admin";
import { friendlyError } from "@/lib/admin/notice";

// Reordering for the row-based Site Control editors (gallery, services,
// testimonials). Exposes ↑/↓ move (works on touch) AND HTML5 drag handlers
// (desktop). Persists by renumbering display_order = position (1..n) and
// upserting only the rows whose order actually changed. `rows` must already be
// sorted by display_order (useAdminRows loads them that way).
export function useReorder<T extends { id: string; display_order: number }>(
  table: string,
  rows: T[],
  setRows: React.Dispatch<React.SetStateAction<T[]>>,
  onError: (message: string) => void,
) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  async function commit(ordered: T[]) {
    const before = new Map(rows.map((r) => [r.id, r.display_order]));
    const renumbered = ordered.map((r, i) => ({ ...r, display_order: i + 1 }));
    setRows(renumbered); // optimistic
    try {
      await Promise.all(
        renumbered.filter((r) => before.get(r.id) !== r.display_order).map((r) => upsertRow(table, r)),
      );
    } catch (e) {
      onError(friendlyError(e, "save the new order"));
    }
  }

  function move(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= rows.length) return;
    const next = rows.slice();
    [next[index], next[to]] = [next[to], next[index]];
    void commit(next);
  }

  function dropOnIndex(target: number) {
    const from = dragIndex;
    setDragIndex(null);
    setOverIndex(null);
    if (from === null || from === target) return;
    const next = rows.slice();
    const [moved] = next.splice(from, 1);
    next.splice(target, 0, moved);
    void commit(next);
  }

  return {
    dragIndex,
    overIndex,
    move,
    dragHandleProps: (index: number) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = "move";
      },
      onDragEnd: () => {
        setDragIndex(null);
        setOverIndex(null);
      },
    }),
    rowDropProps: (index: number) => ({
      onDragOver: (e: React.DragEvent) => {
        if (dragIndex !== null) {
          e.preventDefault();
          if (overIndex !== index) setOverIndex(index);
        }
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        dropOnIndex(index);
      },
    }),
  };
}
