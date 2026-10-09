"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { clearClientSession } from "@/lib/auth";

interface SidebarProps {
  pendingRequestsCount?: number;
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      </svg>
    ),
  },
  {
    href: "/riders",
    label: "Riders",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M21 21v-2a4 4 0 0 0-3-3.800M16 3.200a4 4 0 0 1 0 7.600" />
      </svg>
    ),
  },
  {
    href: "/vehicles",
    label: "Vehicles",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M1 7h13v10H1zM14 10h5l3 3v4h-8M6 17.500a1.500 1.500 0 1 0 0 .1M17 17.500a1.500 1.500 0 1 0 0 .1" />
      </svg>
    ),
  },
  {
    href: "/requests",
    label: "Vehicle requests",
    badgeKey: "req",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3 3 9-9M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
      </svg>
    ),
  },
  {
    href: "/reviews",
    label: "Reviews",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z" />
      </svg>
    ),
  },
  {
    href: "/revenue",
    label: "Revenue",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M17 6H9.500a3.500 3.500 0 0 0 0 7h5a3.500 3.500 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: "/live-map",
    label: "Live map",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2zM9 3v16M15 5v16" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export function Sidebar({ pendingRequestsCount = 3 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearClientSession();
    router.push("/login");
  };

  return (
    <aside
      aria-label="Main Navigation"
      className="bg-[#26231B] text-[#F6F1DF] shrink-0 z-30
        /* Desktop: sticky 240px sidebar */
        max-[899px]:w-full max-[899px]:h-auto max-[899px]:flex max-[899px]:flex-row max-[899px]:overflow-x-auto max-[899px]:p-2 max-[899px]:gap-1
        min-[900px]:w-[240px] min-[900px]:h-screen min-[900px]:sticky min-[900px]:top-0 min-[900px]:flex min-[900px]:flex-col min-[900px]:p-3 min-[900px]:gap-1"
    >
      {/* Brand Header (Desktop only) */}
      <div className="hidden min-[900px]:flex items-center gap-2.5 px-2 pt-1 pb-4">
        <div className="w-[44px] h-[40px] flex items-center justify-center shrink-0">
          <Image
            src="/logo.png"
            alt="Sithumina Transport"
            width={44}
            height={36}
            className="object-contain w-auto h-auto max-h-[38px]"
          />
        </div>
        <div>
          <b className="text-[#FFC20E] text-[15.5px] font-black leading-tight block">
            Sithumina Transport
          </b>
          <small className="text-[#B2AB92] text-[11px] font-semibold block">
            Admin console
          </small>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex max-[899px]:flex-row max-[899px]:gap-1 min-[900px]:flex-col min-[900px]:gap-1 w-full">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-btn font-semibold text-[13.5px] whitespace-nowrap transition-colors outline-none focus-visible:outline-[3px] focus-visible:outline-[#FFC20E] ${
                isActive
                  ? "bg-[#FFC20E] text-[#26231B]"
                  : "text-[#D9D3BD] hover:bg-[#363227]"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badgeKey === "req" && pendingRequestsCount > 0 && (
                <span
                  className="ml-auto bg-[#B3121F] text-white text-[11px] font-bold rounded-pill px-2 py-0.5 leading-none shrink-0"
                  aria-label={`${pendingRequestsCount} pending requests`}
                >
                  {pendingRequestsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile Footer (Desktop only) */}
      <div className="hidden min-[900px]:flex mt-auto items-center justify-between gap-2.5 p-2.5 border-t border-[#3B3727] text-[12px]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[34px] h-[34px] rounded-full bg-[#FFC20E] text-[#26231B] grid place-items-center font-extrabold shrink-0 text-[13px]">
            AD
          </div>
          <div className="truncate">
            <b className="block text-[#F6F1DF] truncate">Admin</b>
            <span className="text-[#B2AB92] text-[11px] block truncate">Head office</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
          className="p-1.5 rounded-lg text-[#B2AB92] hover:text-[#FFC20E] hover:bg-[#363227] transition-colors"
        >
          <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
