import React from "react";

export interface NavItemConfig {
  key: "home" | "about" | "find" | "book" | "reg" | "qa" | "contact" | "reviews";
  href: string;
  iconPath: React.ReactNode;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    key: "home",
    href: "/",
    iconPath: (
      <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    ),
  },
  {
    key: "about",
    href: "/about",
    iconPath: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
  },
  {
    key: "find",
    href: "/find-empty-lorry",
    iconPath: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-5-5" />
      </>
    ),
  },
  {
    key: "book",
    href: "/book-vehicle",
    iconPath: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
  {
    key: "reg",
    href: "/register-vehicle",
    iconPath: (
      <>
        <path d="M1 7h13v10H1zM14 10h5l3 3v4h-8" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </>
    ),
  },
  {
    key: "qa",
    href: "/faq",
    iconPath: <path d="M4 4h16v12H8l-4 4z" />,
  },
  {
    key: "contact",
    href: "/contact",
    iconPath: (
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
    ),
  },
  {
    key: "reviews",
    href: "/reviews",
    iconPath: (
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
    ),
  },
];
