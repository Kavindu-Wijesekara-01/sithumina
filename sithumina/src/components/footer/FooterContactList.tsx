"use client";

import React from "react";
import { siteConfig } from "@/lib/site-config";
import { useLanguage } from "@/context/LanguageContext";

export const FooterContactList: React.FC = () => {
  const { t } = useLanguage();

  return (
    <ul className="flex flex-col gap-1.5 list-none p-0 m-0 text-[13px] text-[#26231B]">
      {/* Phone Numbers from config */}
      {siteConfig.phoneNumbers.map((phone, idx) => (
        <li key={idx} className="flex items-center">
          <a
            href={phone.link}
            target={phone.type === "whatsapp" ? "_blank" : undefined}
            rel={phone.type === "whatsapp" ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2 text-[#26231B] hover:text-[#C51616] transition-colors py-1 focus:outline-none focus-visible:outline-[#26231B] focus-visible:outline-2 rounded"
            aria-label={`${phone.type === "whatsapp" ? "WhatsApp" : "Phone call"} ${phone.display}`}
          >
            {phone.type === "call" ? (
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
                <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 fill-[#1E9E5A] flex-none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.7-.1 1.3z" />
              </svg>
            )}
            <span className="font-bold">{phone.display}</span>
          </a>
        </li>
      ))}

      {/* Email Link */}
      <li className="flex items-center">
        <a
          href={`mailto:${siteConfig.email}`}
          className="inline-flex items-center gap-2 text-[#26231B] hover:text-[#C51616] transition-colors py-1 focus:outline-none focus-visible:outline-[#26231B] focus-visible:outline-2 rounded"
          aria-label={`Email ${siteConfig.email}`}
        >
          <svg
            className="w-4 h-4 text-[#26231B] flex-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <span className="truncate font-semibold">{siteConfig.email}</span>
        </a>
      </li>

      {/* Opening Hours */}
      <li className="flex items-start gap-2 text-[#3B3528] pt-0.5 leading-snug">
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
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="text-[12px] font-medium">{t.footer.hoursText}</span>
      </li>
    </ul>
  );
};
