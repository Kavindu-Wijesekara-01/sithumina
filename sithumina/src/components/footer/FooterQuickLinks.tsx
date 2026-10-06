"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface QuickLinkItem {
  key: "home" | "about" | "find" | "book" | "reg" | "qa" | "reviews";
  href: string;
}

const QUICK_LINKS: QuickLinkItem[] = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "find", href: "/find-empty-lorry" },
  { key: "book", href: "/book-vehicle" },
  { key: "reg", href: "/register-vehicle" },
  { key: "qa", href: "/faq" },
  { key: "reviews", href: "/reviews" },
];

export const FooterQuickLinks: React.FC = () => {
  const { t } = useLanguage();

  return (
    <nav aria-label="Footer quick links">
      <ul className="grid grid-cols-2 sm:grid-cols-1 gap-y-1.5 gap-x-4 list-none p-0 m-0 text-[13px]">
        {QUICK_LINKS.map((link) => (
          <li key={link.key}>
            <Link
              href={link.href}
              className="text-[#3B3528] hover:text-[#C51616] font-semibold transition-colors py-0.5 inline-block no-underline rounded focus:outline-none focus-visible:outline-[#26231B] focus-visible:outline-2"
            >
              {t.nav[link.key]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
