"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsPage() {
  const { locale } = useLanguage();

  return (
    <main className="p-4 lg:p-[24px_32px] flex flex-col gap-5 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--ink)]">
          {locale === "en" ? "Terms of Service" : "සේවා කොන්දේසි"}
        </h1>
        <p className="text-xs text-[var(--mut)]">
          {locale === "en" ? "Last updated: October 2026" : "අවසන් වරට යාවත්කාලීන කළේ: 2026 ඔක්තෝබර්"}
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col gap-4 text-sm text-[var(--ink)] leading-relaxed">
        <section className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold text-[var(--ink)]">
            {locale === "en" ? "1. Lorry Bookings & Carriage" : "1. ප්‍රවාහන වෙන්කිරීම්"}
          </h2>
          <p className="text-xs text-[var(--mut)]">
            {locale === "en"
              ? "All freight bookings arranged through Sithumina Transport connect registered consignors with independent transport contractors. Vehicle capacity and weight limits must comply with national road transport regulations."
              : "සිතුමිණ ප්‍රවාහන සේවාව හරහා සිදුකරන සියලුම වෙන්කිරීම් ජාතික මාර්ග ආරක්ෂණ සහ බර සීමා නීතිරීතිවලට යටත් වේ."}
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold text-[var(--ink)]">
            {locale === "en" ? "2. Cancellation & Empty Returns" : "2. අවලංගු කිරීම්"}
          </h2>
          <p className="text-xs text-[var(--mut)]">
            {locale === "en"
              ? "Discounted empty return trips require timely pickup to ensure driver routing is preserved. Cancellations within 2 hours of scheduled departure may be subject to a nominal dispatch fee."
              : "ආපසු එන හිස් ලොරි වෙන්කිරීම් නියමිත වේලාවට පැටවීම සිදුකළ යුතුය."}
          </p>
        </section>
      </div>
    </main>
  );
}
