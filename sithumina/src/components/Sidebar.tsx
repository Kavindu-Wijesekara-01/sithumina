"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { NAV_ITEMS } from "@/lib/nav-items";
import { siteConfig } from "@/lib/site-config";

// Official brand SVG icons for Facebook, WhatsApp, YouTube, TikTok
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <svg
      className="w-4 h-4 fill-current flex-none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  whatsapp: (
    <svg
      className="w-4 h-4 fill-current flex-none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.16c-.24.68-1.4 1.26-1.94 1.33-.51.07-1.16.1-3.37-.8-2.82-1.15-4.64-4.04-4.78-4.23-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.36.26-.29.58-.36.77-.36.2 0 .39 0 .56.01.18.01.42-.07.65.49.24.58.82 2.01.89 2.16.07.15.12.33.02.53-.1.2-.15.32-.3.49-.15.17-.31.38-.45.51-.15.15-.3.32-.13.62.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.45.29.15.46.13.63-.07.17-.2.74-.86.94-1.16.2-.29.39-.24.66-.14.27.1 1.72.81 2.02.96.29.15.49.22.56.34.07.12.07.71-.17 1.39z" />
    </svg>
  ),
  youtube: (
    <svg
      className="w-4 h-4 fill-current flex-none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  tiktok: (
    <svg
      className="w-4 h-4 fill-current flex-none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside
      className="hidden lg:flex w-[240px] flex-none flex-col border-r border-[var(--line)] bg-[var(--card)] p-3 py-4 sticky top-[84px] h-[calc(100vh-84px)] select-none"
      aria-label="Main Navigation"
    >
      <nav className="flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-semibold transition-colors no-underline ${
                isActive
                  ? "bg-[var(--y)] text-[#26231B] font-bold shadow-xs"
                  : "text-[var(--ink)] hover:bg-[var(--y3)]"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <svg
                className="w-[18px] h-[18px] flex-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {item.iconPath}
              </svg>
              <span className="truncate">{t.nav[item.key]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Social Icons row at the bottom with real official brand logos */}
      <div className="mt-auto pt-4 border-t border-[var(--line)] flex items-center justify-between px-1">
        {siteConfig.socialLinks.map((soc) => (
          <a
            key={soc.key}
            href={soc.url}
            target={soc.url.startsWith("http") ? "_blank" : undefined}
            rel={soc.url.startsWith("http") ? "noopener noreferrer" : undefined}
            className="w-[36px] h-[36px] rounded-full border border-[var(--line)] bg-[var(--card)] hover:bg-[var(--y)] hover:border-[var(--y)] text-[var(--ink)] hover:text-[#26231B] grid place-items-center transition-all duration-200 no-underline shadow-xs hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
            aria-label={soc.label}
            title={soc.label}
          >
            {SOCIAL_ICONS[soc.key]}
          </a>
        ))}
      </div>
    </aside>
  );
};
