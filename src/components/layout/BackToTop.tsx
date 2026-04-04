"use client";

import { useEffect, useState } from "react";
import { SCROLL } from "@/data/constants";
import { ArrowUpIcon } from "@/components/icons";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SCROLL.BACK_TO_TOP_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-24 right-6 z-30 hidden h-10 w-10 items-center justify-center rounded-full bg-gold text-cream shadow-md transition-all duration-300 hover:opacity-90 md:flex ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 pointer-events-none opacity-0"
      }`}
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}
