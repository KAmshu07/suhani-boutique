"use client";

import { useEffect, useRef } from "react";
import { SCROLL } from "@/data/constants";

/**
 * Pure DOM scroll reveal. Adds `.revealed` class when element enters viewport.
 * All animation logic lives in CSS (globals.css).
 * No React state — SSR-safe by design.
 */
export function useScrollReveal(threshold = SCROLL.OBSERVER_THRESHOLD) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
