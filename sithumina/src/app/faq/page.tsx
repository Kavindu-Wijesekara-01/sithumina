"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface FAQItem {
  qEn: string;
  qSi: string;
  aEn: string;
  aSi: string;
}

const FAQS: FAQItem[] = [
  {
    qEn: "How does live lorry tracking work?",
    qSi: "සජීවී ලොරි ලුහුබැඳීම ක්‍රියාත්මක වන්නේ කෙසේද?",
    aEn: "Our lorries are equipped with GPS tracking transponders and the driver app. Real-time satellite coordinates are updated on our live map every few seconds so you always know where your goods are.",
    aSi: "අපගේ සියලුම ලොරි GPS තාක්ෂණය සහ රියදුරු යෙදුම සමඟ සම්බන්ධ වී ඇත. ඔබේ භාණ්ඩ ඇති ස්ථානය සිතියමෙන් සජීවීව බලාගත හැක.",
  },
  {
    qEn: "What is an empty lorry and why is it cheaper?",
    qSi: "හිස් ලොරියක් යනු කුමක්ද? එය ලාභදායී වන්නේ ඇයි?",
    aEn: "When a lorry completes a delivery (for instance, Colombo to Jaffna), it typically drives back empty. By booking that return leg, cargo owners get discounted freight rates up to 35% and lorry owners avoid wasted fuel.",
    aSi: "භාණ්ඩ ගමනාන්තයට භාරදී ආපසු එන ලොරි වලට නැවත බඩු පැටවීමෙන් ලොරි හිමියාගේ ඉන්ධන පිරිවැය ඉතිරි වන අතර, පාරිභෝගිකයාට 35%ක් දක්වා අඩු මුදලකට ප්‍රවාහනය කරගත හැක.",
  },
  {
    qEn: "How do I book an individual vehicle for my cargo?",
    qSi: "මගේ බඩු සඳහා පමණක් තනි ලොරියක් වෙන්කර ගන්නේ කෙසේද?",
    aEn: "Simply visit the 'Book individual vehicle' page or call our 24/7 hotline. Choose your vehicle size and pickup time, and we will dispatch a nearby driver immediately.",
    aSi: "'තනි වාහන වෙන්කිරීම' පිටුවට පිවිස හෝ අපගේ ක්ෂණික දුරකථන අංක අමතා ඔබට අවශ්‍ය වාහන ප්‍රමාණය වෙන්කරවා ගත හැක.",
  },
  {
    qEn: "Can I register my own lorry on Sithumina?",
    qSi: "මගේ ලොරිය සිතුමිණ සේවාවට ඇතුළත් කළ හැකිද?",
    aEn: "Yes! Lorry owners and transport companies can register via the 'Register vehicle' page. After quick document verification, you can receive trip requests island-wide.",
    aSi: "ඔව්! 'වාහනය ලියාපදිංචිය' පිටුව හරහා ඔබේ ලොරිය ලියාපදිංචි කර දිවයින පුරා සවාරි ලබාගත හැක.",
  },
];

export default function FAQPage() {
  const { locale } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <main className="p-4 lg:p-[24px_32px] flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--y3)] text-[#5B4300] text-xs font-bold w-fit border border-[var(--y2)]">
          <span>❓</span>
          <span>{locale === "en" ? "Common Questions" : "ප්‍රශ්න සහ පිළිතුරු"}</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--ink)]">
          {locale === "en" ? "Frequently Asked Questions (Q&A)" : "නිතර අසන ප්‍රශ්න සහ පිළිතුරු"}
        </h1>
        <p className="text-[var(--mut)] text-sm leading-relaxed">
          {locale === "en"
            ? "Everything you need to know about live tracking, lorry booking, and partnering with Sithumina Transport."
            : "සිතුමිණ ප්‍රවාහන සේවාව භාවිතය සහ වාහන වෙන්කිරීම පිළිබඳ සියලු තොරතුරු මෙතැනින් දැනගන්න."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FAQS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="border border-[var(--line)] rounded-2xl bg-[var(--card)] overflow-hidden shadow-xs transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4.5 text-left font-bold text-sm lg:text-base text-[var(--ink)] flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--y3)] transition-colors border-0"
              >
                <span>{locale === "en" ? item.qEn : item.qSi}</span>
                <span className="text-lg font-extrabold text-[var(--mut)]">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs lg:text-sm text-[var(--mut)] leading-relaxed border-t border-[var(--line)] pt-3">
                  {locale === "en" ? item.aEn : item.aSi}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
