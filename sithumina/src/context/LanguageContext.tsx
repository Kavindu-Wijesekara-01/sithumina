"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import en from "@/../locales/en.json";
import si from "@/../locales/si.json";

export type Locale = "en" | "si";

export type Translations = typeof en;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  toggleLocale: () => void;
}

const COOKIE_NAME = "sithumina_lang";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (match) {
      const val = match.split("=")[1];
      if (val === "si" || val === "en") return val;
    }
  } catch {
    // ignore
  }
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale());

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLocale;
    }
  };

  const toggleLocale = () => {
    setLocale(locale === "en" ? "si" : "en");
  };

  const t = useMemo(() => {
    return locale === "si" ? (si as unknown as Translations) : en;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
