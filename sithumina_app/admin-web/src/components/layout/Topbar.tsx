"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/riders": "Riders",
  "/vehicles": "Vehicles",
  "/requests": "Vehicle requests",
  "/reviews": "Reviews",
  "/revenue": "Revenue",
  "/live-map": "Live map",
};

export function Topbar() {
  const pathname = usePathname();
  const { showToast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const currentTitle = PAGE_TITLES[pathname] || "Admin Console";

  useEffect(() => {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      (!document.documentElement.getAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("sithumina_theme", next);
  };

  return (
    <header className="h-[68px] flex items-center gap-3.5 px-6 max-[899px]:px-4 bg-card border-b border-line sticky top-0 z-20">
      <h1 className="text-[20px] font-[800] text-ink tracking-tight whitespace-nowrap">
        {currentTitle}
      </h1>

      <div className="flex-1" />

      {/* Search Input (Hidden on mobile <900px per prototype) */}
      <label className="hidden min-[900px]:flex items-center gap-2 bg-surface rounded-btn px-3 h-10 w-[260px] text-muted border border-transparent focus-within:border-primary transition-colors">
        <svg className="w-[18px] h-[18px] shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5-5" />
        </svg>
        <input
          type="search"
          placeholder="Search riders, vehicles, plates"
          aria-label="Search"
          className="border-none bg-transparent font-inherit w-full text-ink text-[13px] outline-none"
        />
      </label>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        className="w-10 h-10 rounded-btn border border-line bg-card text-ink grid place-items-center cursor-pointer hover:bg-surface transition-colors"
      >
        {theme === "light" ? (
          <svg className="w-[18px] h-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-[18px] h-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>

      {/* Notification Button */}
      <button
        onClick={() => showToast("3 new vehicle dispatch requests pending")}
        aria-label="Notifications"
        title="Notifications"
        className="relative w-10 h-10 rounded-btn border border-line bg-card text-ink grid place-items-center cursor-pointer hover:bg-surface transition-colors"
      >
        <svg className="w-[18px] h-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 6 3 7 3 7H3s3-1 3-7M10 20a2 2 0 0 0 4 0" />
        </svg>
        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brandred" />
      </button>
    </header>
  );
}
