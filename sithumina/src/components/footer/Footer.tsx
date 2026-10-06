"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { siteConfig } from "@/lib/site-config";
import { Logo } from "@/components/Logo";
import { FooterColumn } from "./FooterColumn";
import { FooterSocialLinks } from "./FooterSocialLinks";
import { FooterQuickLinks } from "./FooterQuickLinks";
import { FooterContactList } from "./FooterContactList";
import { FooterOfficeMap } from "./FooterOfficeMap";

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      aria-label={t.footer.ariaLabel}
      className="w-full bg-[#FFC20E] text-[#26231B] flex flex-col mt-auto select-none border-t border-[#26231B]/20"
    >
      {/* Signature road-marking strip: compact 5px asphalt strip with dashed yellow road centre line */}
      <div
        className="w-full h-[5px] bg-[#26231B] flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="w-full h-[2px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, #FFC20E 0, #FFC20E 20px, transparent 20px, transparent 36px)",
          }}
        />
      </div>

      {/* Main Footer Content Container - Compact & Sleek */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        {/* DESKTOP LAYOUT (≥1024px, 4 Columns) */}
        <div className="hidden lg:grid grid-cols-[1.1fr_0.75fr_1.1fr_1.25fr] gap-6 xl:gap-8 items-start">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-2.5">
            <Logo variant="footer" />
            <p className="text-[12.5px] text-[#3B3528] leading-relaxed max-w-[320px] font-medium m-0">
              {t.footer.shortDescription}
            </p>
            <div className="pt-0.5">
              <FooterSocialLinks />
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <FooterColumn title={t.footer.quickLinksHeading}>
            <FooterQuickLinks />
          </FooterColumn>

          {/* Column 3: Contact Details */}
          <FooterColumn title={t.footer.contactHeading}>
            <FooterContactList />
          </FooterColumn>

          {/* Column 4: Head Office & Location Map */}
          <FooterColumn title={t.footer.officeAddress}>
            <FooterOfficeMap />
          </FooterColumn>
        </div>

        {/* MOBILE LAYOUT (<1024px, Compact Ordered Single Column) */}
        <div className="lg:hidden flex flex-col gap-4">
          {/* 1. Brand Block */}
          <div className="flex flex-col gap-2">
            <Logo variant="footer" />
            <p className="text-[12.5px] text-[#3B3528] leading-relaxed m-0 font-medium">
              {t.footer.shortDescription}
            </p>
            <div className="pt-1">
              <FooterSocialLinks />
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#26231B]/15">
            <h3 className="text-[13.5px] font-black text-[#26231B] m-0">
              {t.footer.quickLinksHeading}
            </h3>
            <FooterQuickLinks />
          </div>

          {/* 3. Contact Block */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#26231B]/15">
            <h3 className="text-[13.5px] font-black text-[#26231B] m-0">
              {t.footer.contactHeading}
            </h3>
            <FooterContactList />
          </div>

          {/* 4. Head Office Location Map */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#26231B]/15">
            <h3 className="text-[13.5px] font-black text-[#26231B] m-0">
              {t.footer.officeAddress}
            </h3>
            <FooterOfficeMap />
          </div>
        </div>
      </div>

      {/* Bottom Bar Divider & Info - Slim & Crisp Centered Copyright */}
      <div className="border-t border-[#26231B]/15 w-full bg-[#E5AC0D]">
        <div
          className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-center text-[12px] text-[#332E22] text-center"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 8px))" }}
        >
          {/* Copyright notice */}
          <div className="text-[#332E22] font-semibold">
            © {currentYear} {siteConfig.companyName}. {t.footer.copyright}
          </div>
        </div>
      </div>
    </footer>
  );
};
