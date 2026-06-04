"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/lib/content";
import { getLocalizedField, type Localized } from "@/lib/localized";
import { useTranslation } from "@/lib/i18n";

type Announcement = { active?: boolean; message?: Partial<Localized> };

// A top banner (e.g. "Closed today"), shown only when the admin turns it on.
// Sets a --ann-h CSS variable so the fixed navbar drops below it.
export default function AnnouncementBanner() {
  const { language } = useTranslation();
  const [ann, setAnn] = useState<Announcement | null>(null);

  useEffect(() => {
    let alive = true;
    getSettings()
      .then((s) => {
        if (alive) setAnn((s.announcement as Announcement) ?? null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const active = !!ann?.active;
  const text = active ? getLocalizedField(ann?.message ?? {}, language) : "";

  useEffect(() => {
    const root = document.documentElement;
    if (active && text) root.style.setProperty("--ann-h", "2.25rem");
    else root.style.removeProperty("--ann-h");
    return () => {
      root.style.removeProperty("--ann-h");
    };
  }, [active, text]);

  if (!active || !text) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[55] h-9 flex items-center justify-center bg-brown text-cream px-4">
      <p className="text-xs md:text-sm font-body text-center truncate">{text}</p>
    </div>
  );
}
