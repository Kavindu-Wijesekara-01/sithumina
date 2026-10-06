"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface LanguageSwitchProps {
  variant?: "desktop" | "mobile" | "footer";
  className?: string;
}

export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  variant = "desktop",
  className = "",
}) => {
  const { locale, setLocale, toggleLocale } = useLanguage();

  if (variant === "mobile") {
    return (
      <button
        onClick={toggleLocale}
        className={`w-[36px] h-[36px] rounded-[10px] bg-[rgba(38,35,27,0.12)] hover:bg-[rgba(38,35,27,0.2)] text-[#26231B] font-extrabold text-[12px] flex items-center justify-center transition-colors cursor-pointer border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B] ${className}`}
        aria-label={`Switch to ${locale === "en" ? "Sinhala" : "English"} language`}
      >
        {locale === "en" ? "සිං" : "EN"}
      </button>
    );
  }

  if (variant === "footer") {
    return (
      <div
        role="group"
        aria-label="Footer language selection"
        className={`inline-flex items-center bg-[#26231B] border border-[#26231B] rounded-full p-[2px] select-none ${className}`}
      >
        <button
          type="button"
          onClick={() => setLocale("en")}
          aria-pressed={locale === "en"}
          className={`border-0 font-sans text-[11px] font-extrabold px-[9px] py-[2.5px] rounded-full cursor-pointer transition-all focus:outline-none focus-visible:outline-[#26231B] focus-visible:outline-2 ${
            locale === "en"
              ? "bg-[#FFC20E] text-[#26231B] shadow-xs"
              : "bg-transparent text-[#D4CEBF] hover:text-white"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLocale("si")}
          aria-pressed={locale === "si"}
          className={`border-0 font-sans text-[11px] font-extrabold px-[9px] py-[2.5px] rounded-full cursor-pointer transition-all focus:outline-none focus-visible:outline-[#26231B] focus-visible:outline-2 ${
            locale === "si"
              ? "bg-[#FFC20E] text-[#26231B] shadow-xs"
              : "bg-transparent text-[#D4CEBF] hover:text-white"
          }`}
        >
          සිං
        </button>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`flex items-center bg-[rgba(38,35,27,0.12)] rounded-full p-[3px] select-none ${className}`}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`border-0 font-sans text-[12px] font-bold px-[10px] py-[5px] rounded-full cursor-pointer transition-all ${
          locale === "en"
            ? "bg-[#26231B] text-[var(--y)] shadow-sm"
            : "bg-transparent text-[#26231B] hover:text-black"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("si")}
        aria-pressed={locale === "si"}
        className={`border-0 font-sans text-[12px] font-bold px-[10px] py-[5px] rounded-full cursor-pointer transition-all ${
          locale === "si"
            ? "bg-[#26231B] text-[var(--y)] shadow-sm"
            : "bg-transparent text-[#26231B] hover:text-black"
        }`}
      >
        සිං
      </button>
    </div>
  );
};
