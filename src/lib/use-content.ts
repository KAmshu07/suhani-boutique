"use client";

import { useEffect, useState } from "react";

// Render `fallback` first (matches the static/SSR output to avoid hydration
// mismatch), then swap to live DB data after mount. On error, stay on the
// fallback silently. The fetch runs once per mount — pass a STABLE (module-scope)
// fetcher so it does not refetch on every render or language change.
export function useLiveContent<T>(fetcher: () => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    fetcher()
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e);
        if (process.env.NODE_ENV !== "production") console.warn("content fetch failed", e);
      });
    return () => {
      alive = false;
    };
  }, [fetcher]);

  return { data, error };
}
