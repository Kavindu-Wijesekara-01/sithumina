"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface CTASectionProps {
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({ className = "" }) => {
  const { t } = useLanguage();

  return (
    <section className={`w-full select-none ${className}`}>
      {/* DESKTOP CTA (≥1024px): Paragraph on left, 2 buttons on right */}
      <div className="hidden lg:grid grid-cols-[1fr_auto] gap-[18px] items-center">
        <p className="text-[var(--mut)] text-[14px] leading-[1.55] max-w-[520px] m-0 font-medium">
          {t.desc}
        </p>
        <div className="flex items-center gap-[10px]">
          <Link
            href="/find-empty-lorry"
            className="border-0 font-bold text-[14px] py-[13px] px-[18px] rounded-[12px] bg-[var(--y)] text-[#26231B] hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer no-underline shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {t.buttons.findEmpty}
          </Link>
          <Link
            href="/book-vehicle"
            className="font-bold text-[14px] py-[13px] px-[18px] rounded-[12px] bg-[var(--card)] text-[var(--ink)] border-2 border-[var(--y)] hover:bg-[var(--y3)] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer no-underline shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {t.buttons.bookVehicle}
          </Link>
        </div>
      </div>

      {/* MOBILE CTA (<1024px): 4-word paragraph + 2 compact side-by-side buttons */}
      <div className="lg:hidden flex flex-col gap-3">
        <p className="text-[15px] font-bold text-center text-[var(--ink)] m-0 leading-snug">
          {t.mobilePara}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/find-empty-lorry"
            className="text-center font-bold text-[12px] py-[9px] px-[6px] rounded-[10px] bg-[var(--y)] text-[#26231B] hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap truncate no-underline shadow-xs border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {t.buttons.findEmpty}
          </Link>
          <Link
            href="/book-vehicle"
            className="text-center font-bold text-[12px] py-[9px] px-[6px] rounded-[10px] bg-[var(--card)] text-[var(--ink)] border-[1.5px] border-[var(--y)] hover:bg-[var(--y3)] active:scale-[0.98] transition-all whitespace-nowrap truncate no-underline shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {t.buttons.bookVehicle}
          </Link>
        </div>
      </div>
    </section>
  );
};
