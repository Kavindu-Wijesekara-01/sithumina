"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPage() {
  const { locale } = useLanguage();

  return (
    <main className="p-4 lg:p-[24px_32px] flex flex-col gap-5 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--ink)]">
          {locale === "en" ? "Privacy Policy" : "පෞද්ගලිකත්ව ප්‍රතිපත්තිය"}
        </h1>
        <p className="text-xs text-[var(--mut)]">
          {locale === "en" ? "Last updated: October 2026" : "අවසන් වරට යාවත්කාලීන කළේ: 2026 ඔක්තෝබර්"}
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col gap-4 text-sm text-[var(--ink)] leading-relaxed">
        <section className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold text-[var(--ink)]">
            {locale === "en" ? "1. Information We Collect" : "1. අප එක්රැස් කරන තොරතුරු"}
          </h2>
          <p className="text-xs text-[var(--mut)]">
            {locale === "en"
              ? "We collect consignment details, pickup/drop-off coordinates, customer telephone numbers, and driver GPS telematics to provide accurate freight dispatch."
              : "නිවැරදි භාණ්ඩ ප්‍රවාහන සේවාවක් ලබාදීම සඳහා අපි පැටවුම්/බෑමේ ස්ථාන, පාරිභෝගික දුරකථන අංක සහ රියදුරු GPS දත්ත ලබාගන්නෙමු."}
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold text-[var(--ink)]">
            {locale === "en" ? "2. How Live GPS Data is Used" : "2. සජීවී GPS දත්ත භාවිතය"}
          </h2>
          <p className="text-xs text-[var(--mut)]">
            {locale === "en"
              ? "GPS signals emitted from verified driver transponders are used strictly to calculate transit times, verify route progress, and display live map locations for cargo tracking."
              : "රියදුරු GPS සංඥා භාවිතා කරනු ලබන්නේ භාණ්ඩ ගමනාන්තය සහ ගමන් වේලාව නිරීක්ෂණය කිරීමට පමණි."}
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold text-[var(--ink)]">
            {locale === "en" ? "3. Contact Us Regarding Privacy" : "3. විමසීම් සඳහා"}
          </h2>
          <p className="text-xs text-[var(--mut)]">
            {locale === "en"
              ? "For data inquiries, contact us at info@sithuminatransport.lk or call our customer desk at +94 77 123 4567."
              : "ඕනෑම විමසීමක් සඳහා info@sithuminatransport.lk හෝ +94 77 123 4567 අමතන්න."}
          </p>
        </section>
      </div>
    </main>
  );
}
