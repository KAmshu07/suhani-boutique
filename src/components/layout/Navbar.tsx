"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { businessInfo } from "@/data/business-info";
import {
  LANGUAGE_LABELS,
  NAV_LINKS,
  SCROLL,
  SECTION_ID,
  SUPPORTED_LANGUAGES,
} from "@/data/constants";
import { WhatsAppIcon } from "@/components/icons";

export default function Navbar() {
  const { t, language, setLanguage } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > SCROLL.NAV_SOLID_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleNavClick = useCallback(
    (id: string) => {
      setMenuOpen(false);
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    },
    [],
  );

  const whatsappUrl = getWhatsAppUrl(
    businessInfo.whatsappGreeting[language as keyof typeof businessInfo.whatsappGreeting],
  );

  return (
    <>
      <nav
        className={`fixed top-[var(--ann-h,0px)] left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white text-brown shadow-md"
            : "bg-transparent text-cream"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <a
            href={`#${SECTION_ID.HOME}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(SECTION_ID.HOME);
            }}
            className="font-heading text-sm font-semibold uppercase tracking-widest"
          >
            {businessInfo.name.toUpperCase()}
          </a>

          {/* Desktop nav links */}
          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map(({ key, id }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(id);
                  }}
                  className="font-heading text-xs uppercase tracking-widest transition-all duration-300 hover:text-gold"
                >
                  {t(key)}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop right section: language switcher + WhatsApp */}
          <div className="hidden items-center gap-4 md:flex">
            <LanguageSwitcher
              language={language}
              setLanguage={setLanguage}
            />
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-1.5 text-xs font-medium text-white transition-all duration-300 hover:opacity-90"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="font-body">{t("common.whatsapp")}</span>
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`block h-0.5 w-6 bg-current transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <div
        role="navigation"
        aria-label="Mobile menu"
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-cream transition-all duration-300 md:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex flex-col items-center gap-8">
          {NAV_LINKS.map(({ key, id }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(id);
                }}
                className="font-heading text-lg uppercase tracking-widest text-brown transition-all duration-300 hover:text-gold"
              >
                {t(key)}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <LanguageSwitcher
            language={language}
            setLanguage={setLanguage}
          />
        </div>
      </div>
    </>
  );
}

/* ── Shared sub-components ───────────────────────────────────────── */

function LanguageSwitcher({
  language,
  setLanguage,
}: {
  language: string;
  setLanguage: (lang: "en" | "hi" | "cg") => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-current/20 p-0.5">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          className={`rounded-full px-3 py-1 font-heading text-xs uppercase tracking-wider transition-all duration-300 ${
            language === lang
              ? "bg-gold text-cream"
              : "hover:text-gold"
          }`}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}

