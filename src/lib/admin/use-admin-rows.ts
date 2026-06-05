"use client";

import { useEffect, useState } from "react";
import { listAll, getSettingValue } from "@/lib/admin/content-admin";
import { friendlyError } from "@/lib/admin/notice";

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
      .catch((e) => setStatus(friendlyError(e, "load")));
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
        if (alive) setStatus(friendlyError(e, "load"));
      });
    return () => {
      alive = false;
    };
  }, [table]);

  return { rows, setRows, status, setStatus, reload };
}

// Loads a single settings singleton (e.g. announcement, hero, about, business_info).
export function useAdminSetting<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [status, setStatus] = useState("Loading…");

  useEffect(() => {
    let alive = true;
    getSettingValue(key)
      .then((v) => {
        if (!alive) return;
        if (v != null) setValue(v as T);
        setStatus("");
      })
      .catch((e) => {
        if (alive) setStatus(friendlyError(e, "load"));
      });
    return () => {
      alive = false;
    };
  }, [key]);

  return { value, setValue, status, setStatus };
}

// Loads any async data once (stable module-level fetcher) with a reload(). Used
// where the shape doesn't fit useAdminRows (orders, customers, leads).
export function useAsyncData<T>(fetcher: () => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [status, setStatus] = useState("Loading…");

  function reload() {
    return fetcher()
      .then((d) => {
        setData(d);
        setStatus("");
      })
      .catch((e) => setStatus(friendlyError(e, "load")));
  }

  useEffect(() => {
    let alive = true;
    fetcher()
      .then((d) => {
        if (alive) {
          setData(d);
          setStatus("");
        }
      })
      .catch((e) => {
        if (alive) setStatus(friendlyError(e, "load"));
      });
    return () => {
      alive = false;
    };
  }, [fetcher]);

  return { data, setData, status, setStatus, reload };
}
