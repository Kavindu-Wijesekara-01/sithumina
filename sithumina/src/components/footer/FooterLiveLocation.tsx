"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export const FooterLiveLocation: React.FC = () => {
  const { t } = useLanguage();

  const handleScrollToMap = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      const mapEl = document.getElementById("live-map");
      if (mapEl) {
        e.preventDefault();
        mapEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[#1C1A14] border border-[#3B3727] shadow-xs select-none">
      {/* Top Header with Live Pulse */}
      <div className="flex items-center justify-between gap-2 border-b border-[#3B3727]/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1E9E5A] animate-pu flex-none" aria-hidden="true" />
          <span className="text-[12.5px] font-bold text-[#F6F1DF] tracking-tight">
            {t.footer.liveLocationHeading}
          </span>
        </div>
        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#352E12] text-[#FFC20E] border border-[#FFC20E]/40 whitespace-nowrap">
          {t.footer.liveLorriesCount}
        </span>
      </div>

      {/* Mini Sri Lanka Radar Visual with pulsing pins */}
      <div className="relative h-[80px] w-full rounded-xl bg-[#27241B] overflow-hidden flex items-center justify-center border border-[#3B3727]/40">
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(#FFC20E 1px, transparent 1px), linear-gradient(90deg, #FFC20E 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Sri Lanka mini silhouette & live pins */}
        <svg
          viewBox="0 0 160 100"
          className="h-full w-auto max-w-full text-[#FFC20E] opacity-90 z-10"
          aria-hidden="true"
        >
          {/* Island outline path */}
          <path
            d="M75 12l8 4 3 9-2 7 4 9-1 11 6 9 3 10 9 14 1 13-7 14-11 14-11 7-12-1-9-15-4-17 1-15-5-11 4-13 3-12 5-7 2-10z"
            fill="#352E12"
            stroke="#FFC20E"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Animated pulsing pins on key corridors (Colombo, Kandy, Galle, Jaffna, Anuradhapura) */}
          <circle cx="68" cy="68" r="4.5" className="fill-[#1E9E5A] animate-pu" />
          <circle cx="68" cy="68" r="2.5" className="fill-[#FFC20E]" />

          <circle cx="82" cy="56" r="4.5" className="fill-[#1E9E5A] animate-pu" style={{ animationDelay: "0.4s" }} />
          <circle cx="82" cy="56" r="2.5" className="fill-[#FFC20E]" />

          <circle cx="75" cy="85" r="4.5" className="fill-[#1E9E5A] animate-pu" style={{ animationDelay: "0.8s" }} />
          <circle cx="75" cy="85" r="2.5" className="fill-[#FFC20E]" />

          <circle cx="78" cy="22" r="4" className="fill-[#1E9E5A] animate-pu" style={{ animationDelay: "1.2s" }} />
          <circle cx="78" cy="22" r="2" className="fill-[#FFC20E]" />

          <circle cx="76" cy="42" r="4" className="fill-[#1E9E5A] animate-pu" style={{ animationDelay: "0.6s" }} />
          <circle cx="76" cy="42" r="2" className="fill-[#FFC20E]" />
        </svg>

        {/* Live radar badge overlay */}
        <div className="absolute left-2.5 bottom-2 z-20 flex items-center gap-1.5 text-[10.5px] font-semibold text-[#F6F1DF] bg-[#1C1A14]/85 px-2 py-0.5 rounded-md border border-[#3B3727]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E9E5A] animate-pu" />
          <span>GPS Active · 9 Provinces</span>
        </div>
      </div>

      {/* Action Button: Scroll to / Open Live Map */}
      <Link
        href="/#live-map"
        onClick={handleScrollToMap}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FFC20E] text-[#26231B] hover:bg-[#FFE08A] font-extrabold text-[12.5px] transition-all no-underline shadow-xs focus:outline-none focus-visible:outline-[#FFC20E] focus-visible:outline-2 active:scale-[0.98]"
        aria-label="View live lorry locations on map"
      >
        <svg
          className="w-4 h-4 text-[#26231B] flex-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
        <span>{t.footer.viewLiveMap}</span>
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
};
