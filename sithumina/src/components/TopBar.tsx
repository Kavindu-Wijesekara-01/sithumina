"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "./Logo";
import { PhoneLinks } from "./PhoneLinks";
import { LanguageSwitch } from "./LanguageSwitch";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

interface TopBarProps {
  onOpenMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const { t } = useLanguage();
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--y)] text-[#26231B] shadow-sm select-none">
      {/* DESKTOP TOP BAR (≥1024px, ~84px high, 3 columns) */}
      <div className="hidden lg:grid grid-cols-[240px_1fr_auto] items-center h-[84px] px-6 gap-4 max-w-[1920px] mx-auto">
        {/* Left Column: Logo mark from public/logo.png */}
        <div className="flex items-center">
          <Logo variant="desktop" />
        </div>

        {/* Centre Column: Logo from public/logo.png + Sithumina Transport bold Sinhala text in red + Phone links */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center gap-3.5">
            <Image
              src="/logo.png"
              alt="Sithumina Transport Logo"
              width={68}
              height={52}
              className="h-[50px] sm:h-[54px] w-auto object-contain flex-none drop-shadow-xs"
              priority
            />
            <div className="flex flex-col items-center">
              <h1 className="text-[28px] sm:text-[31px] font-black tracking-tight text-[#C51616] leading-none m-0">
                සිතුමිණ ට්‍රාන්ස්පෝට්
              </h1>
              <PhoneLinks
                size="sm"
                className="mt-1 w-full flex items-center justify-between"
              />
            </div>

            {/* 24 Hours / 365 Days Authentic Service Badge */}
            <div className="flex items-center justify-center flex-none pl-1.5 select-none">
              <Image
                src="/service-badge.png"
                alt="දින 365 පැය 24 පුරා"
                width={80}
                height={197}
                className="h-[62px] sm:h-[68px] w-auto object-contain drop-shadow-xs select-none"
                priority
              />
            </div>
          </div>
        </div>

        {/* Right Column: Login/Profile button + Language Switch */}
        <div className="flex items-center justify-end gap-2.5">
          <Link
            href="/login"
            className="border-0 bg-[#26231B] text-[var(--y)] text-[13px] font-extrabold py-[9px] px-[18px] rounded-[10px] cursor-pointer hover:bg-[#1a1813] transition-all no-underline shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B] flex items-center gap-1.5"
          >
            {profile ? (
              <span>👤 {profile.name ? profile.name.split(" ")[0] : "Customer"}</span>
            ) : (
              <span>{t.login}</span>
            )}
          </Link>
          <LanguageSwitch variant="desktop" />
        </div>
      </div>

      {/* MOBILE TOP BAR (<1024px, compact height ~62px) */}
      <div className="lg:hidden flex items-center justify-between h-[62px] px-1.5 sm:px-3 max-w-full">
        {/* Left Aligned: Logo & Sinhala Text Horizontally + Phone numbers underneath matching text width */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center justify-center no-underline select-none flex-none"
            aria-label="Sithumina Transport Home"
          >
            <Image
              src="/logo.png"
              alt="Sithumina Transport Logo"
              width={56}
              height={44}
              className="h-[46px] w-auto object-contain drop-shadow-xs"
              priority
            />
          </Link>

          {/* Sinhala Text (Top) & Phone numbers (Bottom, matching text width) */}
          <div className="flex flex-col justify-center flex-none">
            <Link href="/" className="no-underline select-none">
              <h1 className="text-[16px] sm:text-[19px] font-black tracking-tight text-[#C51616] leading-tight m-0 whitespace-nowrap">
                සිතුමිණ ට්‍රාන්ස්පෝට්
              </h1>
            </Link>
            <PhoneLinks
              size="xs"
              limit={2}
              className="w-full flex items-center justify-between text-[9px] sm:text-[10px] mt-0.5"
            />
          </div>

          {/* 24 Hours / 365 Days Authentic Service Badge */}
          <div className="flex items-center justify-center flex-none pl-0.5 select-none">
            <Image
              src="/service-badge.png"
              alt="දින 365 පැය 24 පුරා"
              width={60}
              height={148}
              className="h-[46px] sm:h-[50px] w-auto object-contain drop-shadow-xs select-none"
              priority
            />
          </div>
        </div>

        {/* Right: Language toggle button and hamburger menu button */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-none pl-1">
          <LanguageSwitch variant="mobile" />
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label={t.menu}
            className="w-[34px] h-[34px] rounded-[10px] bg-[rgba(38,35,27,0.12)] hover:bg-[rgba(38,35,27,0.2)] text-[#26231B] text-[18px] font-extrabold flex items-center justify-center cursor-pointer border-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            <svg
              className="w-5 h-5 text-[#26231B]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
