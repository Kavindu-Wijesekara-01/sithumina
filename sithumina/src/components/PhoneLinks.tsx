"use client";

import React from "react";
import { siteConfig } from "@/lib/site-config";

interface PhoneLinksProps {
  className?: string;
  itemClassName?: string;
  size?: "xs" | "sm" | "md";
  limit?: number;
}

export const PhoneLinks: React.FC<PhoneLinksProps> = ({
  className = "",
  itemClassName = "",
  size = "md",
  limit,
}) => {
  const isXs = size === "xs";
  const isSm = size === "sm";

  // Select phone numbers according to limit
  let phones = siteConfig.phoneNumbers;
  if (limit === 2) {
    // 1 Call Hotline + 1 WhatsApp chat for ideal mobile utility
    phones = [siteConfig.phoneNumbers[0], siteConfig.phoneNumbers[2]];
  } else if (limit && limit > 0) {
    phones = siteConfig.phoneNumbers.slice(0, limit);
  }

  return (
    <div
      className={`flex items-center ${
        isXs
          ? "text-[10.5px] font-black"
          : isSm
          ? "text-[12.5px] sm:text-[13px] font-black tracking-tight"
          : "justify-center gap-4 text-[13px] font-black"
      } text-[#26231B] ${className}`}
    >
      {phones.map((phone, idx) => (
        <a
          key={idx}
          href={phone.link}
          target={phone.type === "whatsapp" ? "_blank" : undefined}
          rel={phone.type === "whatsapp" ? "noopener noreferrer" : undefined}
          className={`inline-flex items-center ${
            isXs
              ? "gap-1 text-[10.5px]"
              : isSm
              ? "gap-1 text-[12.5px] sm:text-[13px]"
              : "gap-1.5 text-[13px]"
          } text-[#26231B] font-black no-underline hover:text-[#C51616] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B] rounded whitespace-nowrap ${itemClassName}`}
          aria-label={`${phone.type === "whatsapp" ? "WhatsApp" : "Call"} ${phone.display}`}
        >
          {phone.type === "call" ? (
            <svg
              className={`${
                isXs ? "w-2.5 h-2.5" : isSm ? "w-3.5 h-3.5" : "w-[15px] h-[15px]"
              } text-[#26231B] flex-none`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
            </svg>
          ) : (
            <svg
              className={`${
                isXs ? "w-2.5 h-2.5" : isSm ? "w-3.5 h-3.5" : "w-[15px] h-[15px]"
              } fill-[#128C4A] flex-none`}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.7-.1 1.3z" />
            </svg>
          )}
          <span>{phone.display}</span>
        </a>
      ))}
    </div>
  );
};
