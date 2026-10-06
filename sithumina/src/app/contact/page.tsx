"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { siteConfig } from "@/lib/site-config";
import { createInquiry, InquiryInput } from "@/lib/db-services";

export default function ContactPage() {
  const { locale } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [inquiry, setInquiry] = useState<InquiryInput>({
    name: "",
    phone: "",
    message: "",
    type: "quote",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createInquiry(inquiry);
      setSentSuccess(true);
      setInquiry({
        name: "",
        phone: "",
        message: "",
        type: "quote",
      });
    } catch (err) {
      console.error("Inquiry error:", err);
      alert("Failed to submit inquiry. Please call our hotline.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-4 lg:p-[24px_32px] flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--y3)] text-[#5B4300] text-xs font-bold w-fit border border-[var(--y2)]">
          <span>📞</span>
          <span>{locale === "en" ? "24/7 Operations Desk" : "24/7 පාරිභෝගික සහාය"}</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--ink)]">
          {locale === "en" ? "Contact Details & Support" : "අප හා සම්බන්ධ වන්න"}
        </h1>
        <p className="text-[var(--mut)] text-sm leading-relaxed">
          {locale === "en"
            ? "Reach out for emergency vehicle dispatch, freight rate quotes, or partner inquiries."
            : "හදිසි ප්‍රවාහන අවශ්‍යතා, ගාස්තු විමසීම් හෝ වෙනත් ඕනෑම තොරතුරක් සඳහා අප අමතන්න."}
        </p>
      </div>

      {/* Phone Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {siteConfig.phoneNumbers.map((phone, idx) => (
          <a
            key={idx}
            href={phone.link}
            target={phone.type === "whatsapp" ? "_blank" : undefined}
            rel={phone.type === "whatsapp" ? "noopener noreferrer" : undefined}
            className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] hover:border-[#FFC20E] transition-all no-underline shadow-xs flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">
                {phone.type === "whatsapp" ? "💬" : "☎️"}
              </span>
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--y3)] text-[#5B4300]">
                {phone.type === "whatsapp" ? "WhatsApp" : "Hotline"}
              </span>
            </div>
            <span className="text-base font-extrabold text-[var(--ink)]">
              {phone.display}
            </span>
            <span className="text-xs text-[var(--mut)]">
              {phone.type === "whatsapp"
                ? locale === "en"
                  ? "Chat on WhatsApp (Instant Reply)"
                  : "වට්ස්ඇප් පණිවිඩයක් එවන්න"
                : locale === "en"
                ? "Tap to call dispatch centre"
                : "ඇමතුමක් ලබාගන්න"}
            </span>
          </a>
        ))}
      </div>

      {/* Interactive Online Inquiry Form */}
      <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-extrabold text-[var(--ink)]">
            ✉️ {locale === "en" ? "Send an Online Inquiry / Freight Rate Quote" : "ඔබගේ පණිවිඩය එවන්න"}
          </h2>
          <p className="text-xs text-[var(--mut)]">
            {locale === "en"
              ? "Leave your requirements and our coordinator will respond directly."
              : "ඔබගේ ප්‍රවාහන අවශ්‍යතාවය පහතින් ඇතුළත් කරන්න. අපගේ මෙහෙයුම් නිලධාරී ඔබව අමතනු ඇත."}
          </p>
        </div>

        {sentSuccess ? (
          <div className="p-5 rounded-xl bg-[#DDF3E7] text-[#12663A] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold">✓</span>
              <span className="text-xs font-bold">
                {locale === "en"
                  ? "Your message has been sent to our dispatch team!"
                  : "ඔබගේ පණිවිඩය සාර්ථකව යොමු කරන ලදී!"}
              </span>
            </div>
            <button
              onClick={() => setSentSuccess(false)}
              className="text-xs font-bold underline bg-transparent border-0 cursor-pointer text-[#12663A]"
            >
              {locale === "en" ? "Send Another" : "තවත් පණිවිඩයක්"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {locale === "en" ? "Your Name" : "ඔබගේ නම"} *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Nimal Perera"
                  value={inquiry.name}
                  onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                  className="p-2.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[#FFC20E]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {locale === "en" ? "Phone Number" : "දුරකථන අංකය"} *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="077 123 4567"
                  value={inquiry.phone}
                  onChange={(e) => setInquiry({ ...inquiry, phone: e.target.value })}
                  className="p-2.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[#FFC20E]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {locale === "en" ? "Inquiry Type" : "වර්ගය"}
                </label>
                <select
                  value={inquiry.type}
                  onChange={(e) =>
                    setInquiry({
                      ...inquiry,
                      type: e.target.value as "quote" | "support" | "general",
                    })
                  }
                  className="p-2.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[#FFC20E]"
                >
                  <option value="quote">Freight Rate Quote</option>
                  <option value="support">Active Trip Support</option>
                  <option value="general">Fleet Partnership / Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[var(--ink)]">
                {locale === "en" ? "Message / Details" : "පණිවිඩය"} *
              </label>
              <textarea
                required
                rows={3}
                placeholder={
                  locale === "en"
                    ? "Explain your goods, routes, or questions..."
                    : "ඔබගේ භාණ්ඩ, ගමන් මාර්ගය හෝ විමසීම සඳහන් කරන්න..."
                }
                value={inquiry.message}
                onChange={(e) =>
                  setInquiry({ ...inquiry, message: e.target.value })
                }
                className="p-2.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[#FFC20E]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="py-3 px-6 rounded-xl bg-[var(--y)] text-[#26231B] font-extrabold text-xs cursor-pointer hover:opacity-90 transition-all self-start disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : locale === "en"
                ? "Submit Inquiry"
                : "පණිවිඩය යවන්න"}
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col gap-2">
          <h2 className="text-base font-bold text-[var(--ink)]">
            📍 {locale === "en" ? "Head Office & Main Depot" : "ප්‍රධාන කාර්යාලය සහ අංගනය"}
          </h2>
          <p className="text-xs text-[var(--mut)] leading-relaxed">
            Sithumina Transport Logistics Hub,<br />
            No. 142/A, Kandy Road, Peliyagoda,<br />
            Western Province, Sri Lanka.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col gap-2">
          <h2 className="text-base font-bold text-[var(--ink)]">
            ⏱️ {locale === "en" ? "Operating Hours" : "සේවා වේලාවන්"}
          </h2>
          <p className="text-xs text-[var(--mut)] leading-relaxed">
            {locale === "en"
              ? "Live Tracking: 24 Hours / 7 Days a week"
              : "සජීවී ලුහුබැඳීම: දවසේ පැය 24 පුරා"}<br />
            {locale === "en"
              ? "Customer Dispatch Desk: Open 24 Hours"
              : "මෙහෙයුම් මධ්‍යස්ථානය: පැය 24 පුරා විවෘතයි"}
          </p>
        </div>
      </div>
    </main>
  );
}
