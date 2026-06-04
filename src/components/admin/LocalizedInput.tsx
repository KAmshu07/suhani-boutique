"use client";

import type { Language } from "@/data/types";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/data/constants";
import type { Localized } from "@/lib/localized";

// Three boxes (EN / HI / CG) for a trilingual text field. English is the primary;
// Hindi/Chhattisgarhi are optional and fall back to English on the public site.
export default function LocalizedInput({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: Partial<Localized>;
  onChange: (next: Partial<Localized>) => void;
  multiline?: boolean;
}) {
  function setLang(lang: Language, v: string) {
    onChange({ ...value, [lang]: v });
  }

  const box =
    "w-full bg-cream-alt border border-brown-light/20 px-3 py-2 text-brown text-sm focus:border-gold focus:outline-none";

  return (
    <div>
      <label className="block text-xs font-heading uppercase tracking-wider text-brown-light mb-1">
        {label}
      </label>
      <div className="flex flex-col gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <div key={lang} className="flex items-start gap-2">
            <span className="mt-2 w-7 shrink-0 text-[10px] font-heading uppercase tracking-wider text-brown-light">
              {LANGUAGE_LABELS[lang]}
            </span>
            {multiline ? (
              <textarea
                rows={3}
                value={value[lang] ?? ""}
                onChange={(e) => setLang(lang, e.target.value)}
                placeholder={lang === "en" ? "Required" : "Optional"}
                className={box}
              />
            ) : (
              <input
                type="text"
                value={value[lang] ?? ""}
                onChange={(e) => setLang(lang, e.target.value)}
                placeholder={lang === "en" ? "Required" : "Optional"}
                className={box}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
