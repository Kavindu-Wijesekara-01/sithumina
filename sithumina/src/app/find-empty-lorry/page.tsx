"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useLiveLorries } from "@/hooks/useLiveLorries";
import { LorryStatusBadge } from "@/components/LorryStatusBadge";

export default function FindEmptyLorryPage() {
  const { locale } = useLanguage();
  const { lorries } = useLiveLorries();
  const [searchTerm, setSearchTerm] = useState("");

  const emptyLorries = lorries.filter((l) => l.status === "empty");
  const filtered = emptyLorries.filter(
    (l) =>
      l.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.vehicleType && l.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="p-4 lg:p-[24px_32px] flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--y2)] text-[#5B4300] text-xs font-bold w-fit">
          <span>🚚</span>
          <span>{emptyLorries.length} {locale === "en" ? "Empty Lorries Available Now" : "හිස් ලොරි සූදානම්"}</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--ink)]">
          {locale === "en" ? "Find an Empty Lorry Near You" : "ඔබ ළඟ ඇති හිස් ලොරි සොයන්න"}
        </h1>
        <p className="text-[var(--mut)] text-sm leading-relaxed max-w-2xl">
          {locale === "en"
            ? "Book empty return lorries at discounted rates across Sri Lanka. Instant contact with drivers and live GPS tracking."
            : "දිවයින පුරා ආපසු පැමිණෙන හිස් ලොරි අඩු ගාස්තු යටතේ වෙන්කරවා ගන්න. සෘජුවම රියදුරු සම්බන්ධ කරගැනීමේ පහසුකම."}
        </p>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-[var(--card)] p-3 rounded-2xl border border-[var(--line)] shadow-xs max-w-md">
        <svg
          className="w-5 h-5 text-[var(--mut)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" strokeWidth="2" />
          <path d="M21 21l-5-5" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={locale === "en" ? "Filter by city or plate (e.g. Galle, WP LB)..." : "නගරය හෝ අංකය අනුව සොයන්න..."}
          className="bg-transparent border-0 text-sm w-full outline-none text-[var(--ink)] placeholder:text-[var(--mut)]"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-xs text-[var(--mut)] hover:text-[var(--ink)] px-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Grid of Empty Lorries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((lorry) => (
          <div
            key={lorry.id}
            className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] hover:border-[#FFC20E] transition-all shadow-xs flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-[var(--ink)]">
                  {lorry.plate}
                </span>
                <LorryStatusBadge status={lorry.status} />
              </div>
              <div className="text-xs text-[var(--mut)] flex flex-col gap-1">
                <div>
                  <strong className="text-[var(--ink)]">
                    {locale === "en" ? "Location / Route:" : "ස්ථානය / ගමන් මඟ:"}
                  </strong>{" "}
                  {lorry.route}
                </div>
                {lorry.vehicleType && (
                  <div>
                    <strong className="text-[var(--ink)]">
                      {locale === "en" ? "Vehicle Type:" : "වාහන වර්ගය:"}
                    </strong>{" "}
                    {lorry.vehicleType}
                  </div>
                )}
                {lorry.driverName && (
                  <div>
                    <strong className="text-[var(--ink)]">
                      {locale === "en" ? "Driver:" : "රියදුරු:"}
                    </strong>{" "}
                    {lorry.driverName}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[var(--line)]">
              <a
                href="tel:+94771234567"
                className="flex-1 py-2 text-center rounded-xl bg-[var(--y)] text-[#26231B] font-bold text-xs no-underline hover:opacity-90"
              >
                {locale === "en" ? "Call" : "අමතන්න"}
              </a>
              <Link
                href="/book-vehicle"
                className="flex-1 py-2 text-center rounded-xl bg-[#26231B] text-[var(--y)] font-bold text-xs no-underline hover:bg-[#1a1813]"
              >
                {locale === "en" ? "Book Online" : "වෙන්කරන්න"}
              </Link>
              <a
                href="https://wa.me/94765550123"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-[#1E9E5A] text-white font-bold text-xs no-underline hover:opacity-90 flex items-center justify-center"
                aria-label="WhatsApp"
              >
                WA
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
