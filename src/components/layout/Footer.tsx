"use client";

import { useTranslation } from "@/lib/i18n";
import { useBusinessInfo, useWhatsAppUrl } from "@/lib/business-info-context";
import {
  LANGUAGE_LABELS,
  NAV_LINKS,
  SUPPORTED_LANGUAGES,
} from "@/data/constants";

export default function Footer() {
  const { t, language, setLanguage } = useTranslation();
  const businessInfo = useBusinessInfo();
  const waUrl = useWhatsAppUrl();

  const whatsappUrl = waUrl(
    businessInfo.whatsappGreeting[language as keyof typeof businessInfo.whatsappGreeting],
  );

  function handleNavClick(id: string) {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <footer className="bg-brown text-cream pb-20 md:pb-0">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand column */}
          <div>
            <h3 className="font-heading text-lg font-semibold uppercase tracking-widest">
              {businessInfo.name}
            </h3>
            <p className="mt-3 font-body text-sm text-cream/70">
              {t("footer.tagline")}
            </p>
            <p className="mt-6 font-body text-xs text-cream/50">
              &copy; {new Date().getFullYear()} {businessInfo.name}.{" "}
              {t("footer.copyright")}
            </p>
          </div>

          {/* Quick Links column */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-widest text-gold">
              {t("footer.quickLinks")}
            </h4>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map(({ key, id }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(id);
                    }}
                    className="font-body text-sm text-cream/70 transition-all duration-300 hover:text-gold"
                  >
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info column */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-widest text-gold">
              {t("footer.contactInfo")}
            </h4>
            <ul className="mt-4 flex flex-col gap-3 font-body text-sm text-cream/70">
              <li>
                <a
                  href={`tel:${businessInfo.phone}`}
                  className="transition-all duration-300 hover:text-gold"
                >
                  {businessInfo.phone}
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300 hover:text-gold"
                >
                  {t("common.whatsapp")}
                </a>
              </li>
              <li className="mt-2">
                <span className="block text-xs uppercase tracking-wider text-cream/50">
                  {t("footer.hours")}
                </span>
                <span className="mt-1 block">
                  {t("footer.openDaily")}: {businessInfo.hours.time}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
          <p className="font-body text-xs text-cream/50">
            {t("footer.crafted")}
          </p>
          <div className="flex items-center gap-1 rounded-full border border-cream/20 p-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`rounded-full px-3 py-1 font-heading text-xs uppercase tracking-wider transition-all duration-300 ${
                  language === lang
                    ? "bg-gold text-cream"
                    : "text-cream/50 hover:text-gold"
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
