"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SCROLL } from "@/data/constants";

const emptySubscribe = () => () => {};

export function useScrollAnimation(threshold = SCROLL.OBSERVER_THRESHOLD) {
  const ref = useRef<HTMLDivElement>(null);
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  // SSR: visible (no animations). Client: animations control visibility.
  return { ref, isVisible: !isClient || isVisible };
}
