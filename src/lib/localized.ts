import type { Language } from "@/data/types";

export type Localized = Record<Language, string>;

// CMS content is stored as {en,hi,cg}. UI strings stay in translations.ts via t().
// Falls back to English, then empty string, so a missing translation never crashes.
export function getLocalizedField(
  value: Partial<Localized> | null | undefined,
  language: Language,
): string {
  if (!value) return "";
  return value[language] ?? value.en ?? "";
}
