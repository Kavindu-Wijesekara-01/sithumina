"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";

interface LogoProps {
  variant?: "desktop" | "mobile" | "drawer" | "footer";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = "desktop", className = "" }) => {

  if (variant === "mobile") {
    return (
      <Link
        href="/"
        className={`flex items-center gap-2.5 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B] rounded-lg select-none ${className}`}
        aria-label="Sithumina Transport Home"
      >
        <Image
          src="/logo.png"
          alt="Sithumina Transport"
          width={44}
          height={34}
          className="h-9 w-auto object-contain flex-none"
          priority
        />
        <span className="tracking-tight font-black text-[#C51616] text-[16px]">
          සිතුමිණ ට්‍රාන්ස්පෝට්
        </span>
      </Link>
    );
  }

  if (variant === "drawer") {
    return (
      <Link
        href="/"
        className={`flex items-center gap-2.5 no-underline select-none ${className}`}
        aria-label="Sithumina Transport Home"
      >
        <Image
          src="/logo.png"
          alt="Sithumina Transport"
          width={44}
          height={34}
          className="h-9 w-auto object-contain flex-none"
          priority
        />
        <span className="tracking-tight font-black text-[#C51616] text-[17px]">
          සිතුමිණ ට්‍රාන්ස්පෝට්
        </span>
      </Link>
    );
  }

  if (variant === "footer") {
    return (
      <Link
        href="/"
        className={`inline-flex items-center gap-2.5 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B] rounded-lg select-none group ${className}`}
        aria-label="Sithumina Transport Home"
      >
        <Image
          src="/logo.png"
          alt="Sithumina Transport Logo"
          width={48}
          height={38}
          className="h-[38px] sm:h-[42px] w-auto object-contain flex-none drop-shadow-xs transition-transform group-hover:scale-105"
        />
        <span className="tracking-tight font-black text-[#C51616] text-[20px] sm:text-[22px] leading-tight drop-shadow-xs">
          සිතුමිණ ට්‍රාන්ස්පෝට්
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B] rounded-lg select-none ${className}`}
      aria-label="Sithumina Transport Home"
    >
      <Image
        src="/logo.png"
        alt="Sithumina Transport Logo"
        width={95}
        height={74}
        className="h-[68px] sm:h-[72px] w-auto object-contain transition-transform hover:scale-105"
        priority
      />
    </Link>
  );
};
