"use client";

import React from "react";
import { siteConfig } from "@/lib/site-config";
import { useLanguage } from "@/context/LanguageContext";

export const AppBadges: React.FC = () => {
  const { t } = useLanguage();
  const { isPublished, googlePlayUrl, appStoreUrl } = siteConfig.appLinks;

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[13px] text-[#B2AB92] leading-snug m-0">
        {t.footer.getAppSubtitle}
      </p>

      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full max-w-[220px]">
        {/* Google Play Store Badge */}
        <a
          href={isPublished ? googlePlayUrl : undefined}
          aria-disabled={!isPublished}
          onClick={(e) => {
            if (!isPublished) e.preventDefault();
          }}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[#3B3727] bg-[#1C1A14] text-[#F6F1DF] transition-all duration-150 no-underline shadow-xs select-none focus:outline-none focus-visible:outline-[#FFC20E] focus-visible:outline-3 focus-visible:outline-offset-2 ${
            isPublished
              ? "hover:border-[#FFC20E] hover:text-[#FFC20E] cursor-pointer"
              : "opacity-90 cursor-default"
          }`}
          aria-label="Google Play Store - Sithumina Driver & Cargo App"
        >
          {/* Google Play Icon */}
          <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none">
            <path
              d="M3.609 1.814A1.5 1.5 0 0 0 3 3.109v17.782a1.5 1.5 0 0 0 .609 1.295l9.98-9.98-9.98-10.392Z"
              fill="#00E676"
            />
            <path
              d="m16.891 15.511-3.302-3.302-9.98 10.392a1.498 1.498 0 0 0 1.93.076l11.352-7.166Z"
              fill="#FF3D00"
            />
            <path
              d="m16.891 8.489-11.352-7.166a1.498 1.498 0 0 0-1.93.076l9.98 10.392 3.302-3.302Z"
              fill="#FFD600"
            />
            <path
              d="m21.205 10.457-3.08-1.968-3.536 3.511 3.536 3.511 3.08-1.968a1.5 1.5 0 0 0 0-3.086Z"
              fill="#29B6F6"
            />
          </svg>

          <div className="flex flex-col text-left leading-tight flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] uppercase font-semibold text-[#B2AB92]">
                GET IT ON
              </span>
              {!isPublished && (
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#352E12] text-[#FFC20E] border border-[#FFC20E]/30">
                  {t.footer.comingSoon}
                </span>
              )}
            </div>
            <span className="text-[12.5px] font-extrabold tracking-tight text-[#F6F1DF]">
              Google Play
            </span>
          </div>
        </a>

        {/* Apple App Store Badge */}
        <a
          href={isPublished ? appStoreUrl : undefined}
          aria-disabled={!isPublished}
          onClick={(e) => {
            if (!isPublished) e.preventDefault();
          }}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[#3B3727] bg-[#1C1A14] text-[#F6F1DF] transition-all duration-150 no-underline shadow-xs select-none focus:outline-none focus-visible:outline-[#FFC20E] focus-visible:outline-3 focus-visible:outline-offset-2 ${
            isPublished
              ? "hover:border-[#FFC20E] hover:text-[#FFC20E] cursor-pointer"
              : "opacity-90 cursor-default"
          }`}
          aria-label="Apple App Store - Sithumina Driver & Cargo App"
        >
          {/* Apple Logo */}
          <svg className="w-5 h-5 fill-current text-[#F6F1DF] flex-none" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.66-.99 1.72-.85 2.74 1 .08 2.02-.51 2.56-1.24" />
          </svg>

          <div className="flex flex-col text-left leading-tight flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] uppercase font-semibold text-[#B2AB92]">
                DOWNLOAD ON
              </span>
              {!isPublished && (
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#352E12] text-[#FFC20E] border border-[#FFC20E]/30">
                  {t.footer.comingSoon}
                </span>
              )}
            </div>
            <span className="text-[12.5px] font-extrabold tracking-tight text-[#F6F1DF]">
              App Store
            </span>
          </div>
        </a>
      </div>
    </div>
  );
};
