"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { businessInfo } from "@/data/business-info";
import {
  SECTION_ID,
  LANGUAGE,
  LANGUAGE_LABELS,
  SCROLL,
} from "@/data/constants";

const NAV_LINKS = [
  { key: "nav.home", id: SECTION_ID.HOME },
  { key: "nav.services", id: SECTION_ID.SERVICES },
  { key: "nav.gallery", id: SECTION_ID.GALLERY },
  { key: "nav.about", id: SECTION_ID.ABOUT },
  { key: "nav.book", id: SECTION_ID.BOOKING },
  { key: "nav.contact", id: SECTION_ID.CONTACT },
] as const;

const LANGUAGES = [LANGUAGE.EN, LANGUAGE.HI, LANGUAGE.CG] as const;

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white text-brown shadow-md"
            : "bg-transparent text-white"
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
            SUHANI BOUTIQUE
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
              className={`block h-0.5 w-6 transition-all duration-300 ${
                scrolled ? "bg-brown" : "bg-white"
              } ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 transition-all duration-300 ${
                scrolled ? "bg-brown" : "bg-white"
              } ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 transition-all duration-300 ${
                scrolled ? "bg-brown" : "bg-white"
              } ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <div
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
      {LANGUAGES.map((lang) => (
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
