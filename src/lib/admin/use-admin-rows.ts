"use client";

import { useEffect, useState } from "react";
import { listAll } from "@/lib/admin/content-admin";

function msg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

// Loads all rows of a table for the admin (including hidden ones) and exposes a
// reload(). The fetch lives in the effect's promise callback (not a synchronous
// setState in the effect body), which is the React-recommended pattern.
export function useAdminRows<T>(table: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [status, setStatus] = useState("Loading…");

  function reload() {
    return listAll(table)
      .then((data) => {
        setRows(data as T[]);
        setStatus("");
      })
      .catch((e) => setStatus("Failed to load: " + msg(e)));
  }

  useEffect(() => {
    let alive = true;
    listAll(table)
      .then((data) => {
        if (!alive) return;
        setRows(data as T[]);
        setStatus("");
      })
      .catch((e) => {
        if (alive) setStatus("Failed to load: " + msg(e));
      });
    return () => {
      alive = false;
    };
  }, [table]);

  return { rows, setRows, status, setStatus, reload };
}
