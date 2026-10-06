"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS } from "@/lib/nav-items";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { profile } = useAuth();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Esc key handler & Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    // Focus close button on open
    closeButtonRef.current?.focus();

    // Prevent background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-200 lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Drawer"
        className={`fixed inset-y-0 right-0 w-full max-w-[340px] bg-[var(--card)] z-[9999] flex flex-col transition-transform duration-250 ease-out lg:hidden shadow-2xl overflow-hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header (Yellow Background, Red Text, Black X button) */}
        <header className="flex items-center justify-between px-4 py-3.5 bg-[var(--y)] text-[#26231B] border-b border-black/10 select-none flex-none shadow-xs">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Sithumina Transport"
              width={36}
              height={28}
              className="h-[30px] w-auto object-contain flex-none drop-shadow-xs"
              priority
            />
            <span className="font-black text-[17px] text-[#C51616] tracking-tight leading-none">
              සිතුමිණ ට්‍රාන්ස්පෝට්
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="w-[36px] h-[36px] rounded-[10px] bg-[rgba(38,35,27,0.12)] hover:bg-[rgba(38,35,27,0.22)] active:scale-95 text-[#26231B] flex items-center justify-center cursor-pointer border-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 overflow-y-auto flex-1 p-3.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
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
                <span>{t.nav[item.key]}</span>
              </Link>
            );
          })}
        </nav>

        {/* Drawer Bottom Actions: Login */}
        <div className="p-3.5 pt-2 border-t border-[var(--line)] mt-auto flex-none bg-[var(--card)] flex flex-col gap-2">
          <Link
            href="/login"
            onClick={onClose}
            className="w-full block text-center border-0 bg-[#26231B] text-[var(--y)] text-[14px] font-extrabold py-3 px-4 rounded-[10px] cursor-pointer hover:bg-[#1a1813] transition-all no-underline shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {profile ? (
              <span>
                {profile.role === "driver"
                  ? "🚚 Driver Account"
                  : profile.role === "admin"
                  ? "🔐 Dispatch Admin"
                  : "👤 My Profile"}
              </span>
            ) : (
              <span>{t.login}</span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
};
