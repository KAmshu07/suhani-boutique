"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import { translations } from "@/data/translations";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE,
  LANGUAGE_STORAGE_KEY,
} from "@/data/constants";

type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE];

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): Language {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (
    stored === LANGUAGE.EN ||
    stored === LANGUAGE.HI ||
    stored === LANGUAGE.CG
  ) {
    return stored;
  }
  return DEFAULT_LANGUAGE;
}

function getServerSnapshot(): Language {
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    emitChange();
  }, []);

  const t = useCallback(
    (key: string): string => {
      const langStrings = translations[language] as Record<string, string>;
      return langStrings[key] ?? key;
    },
    [language],
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
}
