"use client";

import React from "react";
import { siteConfig } from "@/lib/site-config";
import { useLanguage } from "@/context/LanguageContext";

export const FooterOfficeMap: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-2">
      {/* Office Address with location pin */}
      <div className="flex items-start gap-1.5 text-[12px] leading-snug text-[#26231B]">
        <svg
          className="w-4 h-4 text-[#26231B] flex-none mt-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="text-[#26231B] font-bold">{siteConfig.address}</span>
      </div>

      {/* Embedded Google Map - Slim & Crisp */}
      <div className="relative w-full h-[90px] rounded-lg overflow-hidden border border-[#26231B]/20 bg-white/40 shadow-xs">
        <iframe
          title="Sithumina Transport Peliyagoda Office Location"
          src={siteConfig.officeEmbedMapUrl}
          className="w-full h-full border-0 contrast-[1.02]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          aria-label="Google Maps preview of Sithumina Transport Office"
        />
      </div>

      {/* Action Buttons: Compact side-by-side */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        {/* Get Directions (Opens Google Maps Navigation) */}
        <a
          href={siteConfig.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 min-h-[32px] px-2.5 py-1 rounded-md bg-[#26231B] text-[#FFC20E] hover:bg-black font-bold text-[11.5px] transition-all no-underline shadow-xs focus:outline-none focus-visible:outline-[#26231B] focus-visible:outline-2 active:scale-[0.98]"
          aria-label="Get directions to Sithumina Transport office on Google Maps"
        >
          <svg
            className="w-3.5 h-3.5 text-[#FFC20E] flex-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          <span className="whitespace-nowrap">{t.footer.getDirections}</span>
        </a>

        {/* View on Google Maps (Opens full map) */}
        <a
          href={siteConfig.officeMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 min-h-[32px] px-2.5 py-1 rounded-md bg-white/85 text-[#26231B] hover:text-[#C51616] hover:bg-white border border-[#26231B]/25 font-bold text-[11.5px] transition-all no-underline shadow-xs focus:outline-none focus-visible:outline-[#26231B] focus-visible:outline-2 active:scale-[0.98]"
          aria-label="Open Sithumina Transport office in Google Maps"
        >
          <span className="whitespace-nowrap">{t.footer.viewOnGoogleMaps}</span>
          <span aria-hidden="true" className="text-[#26231B] text-xs">↗</span>
        </a>
      </div>
    </div>
  );
};
