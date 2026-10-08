"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface CTASectionProps {
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({ className = "" }) => {
  const { t } = useLanguage();

  const tagline = "Your cost-effective cargo companion.";

  return (
    <section className={`w-full select-none ${className}`}>
      {/* DESKTOP CTA (≥1024px): Highlight Brand Ribbon on left + 2 Action buttons on right */}
      <div className="hidden lg:grid grid-cols-[1fr_auto] gap-5 items-center p-[14px_22px] rounded-[16px] bg-gradient-to-r from-[#FFFDF5] via-white to-[#FFFDF5] border border-[#EADB9F] shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="w-1.5 h-7 rounded-full bg-[#FFC20E] inline-block flex-none" />
          <p className="text-[21px] lg:text-[23px] font-bold text-[#1F1C16] m-0 font-[family-name:var(--font-playfair)] italic tracking-normal truncate">
            “{tagline}”
          </p>
        </div>
        <div className="flex items-center gap-[10px] flex-none">
          <Link
            href="/find-empty-lorry"
            className="border-0 font-bold text-[14px] py-[11px] px-[20px] rounded-[12px] bg-[var(--y)] text-[#26231B] hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer no-underline shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {t.buttons.findEmpty}
          </Link>
          <Link
            href="/book-vehicle"
            className="font-bold text-[14px] py-[11px] px-[20px] rounded-[12px] bg-[var(--card)] text-[var(--ink)] border-2 border-[var(--y)] hover:bg-[var(--y3)] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer no-underline shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {t.buttons.bookVehicle}
          </Link>
        </div>
      </div>

      {/* MOBILE CTA (<1024px): Prominent Highlight Tagline Card + 2 side-by-side buttons */}
      <div className="lg:hidden flex flex-col gap-2.5">
        <div className="flex items-center justify-center py-2.5 px-3 rounded-[12px] bg-gradient-to-b from-[#FFFDF5] to-[#FDF9ED] border border-[#EADB9F] shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[1.5px] bg-[#FFC20E] rounded-full inline-block flex-none" />
            <p className="text-[16px] sm:text-[17.5px] font-bold text-[#1F1C16] text-center m-0 font-[family-name:var(--font-playfair)] italic whitespace-nowrap">
              “{tagline}”
            </p>
            <span className="w-3.5 h-[1.5px] bg-[#FFC20E] rounded-full inline-block flex-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/find-empty-lorry"
            className="text-center font-bold text-[12px] py-[9.5px] px-[6px] rounded-[10px] bg-[var(--y)] text-[#26231B] hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap truncate no-underline shadow-xs border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {t.buttons.findEmpty}
          </Link>
          <Link
            href="/book-vehicle"
            className="text-center font-bold text-[12px] py-[9.5px] px-[6px] rounded-[10px] bg-[var(--card)] text-[var(--ink)] border-[1.5px] border-[var(--y)] hover:bg-[var(--y3)] active:scale-[0.98] transition-all whitespace-nowrap truncate no-underline shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {t.buttons.bookVehicle}
          </Link>
        </div>
      </div>
    </section>
  );
};
