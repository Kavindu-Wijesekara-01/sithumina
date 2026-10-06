"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { createVehicleRegistration } from "@/lib/db-services";

export default function RegisterVehiclePage() {
  const { locale } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    ownerName: "",
    phone: "",
    plateNumber: "",
    vehicleType: "14ft",
    baseCity: "",
    driverCount: "1",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const docId = await createVehicleRegistration(form);
      setSubmittedId(docId);
      setForm({
        ownerName: "",
        phone: "",
        plateNumber: "",
        vehicleType: "14ft",
        baseCity: "",
        driverCount: "1",
      });
    } catch (err) {
      console.error("Registration error:", err);
      alert(
        locale === "en"
          ? "Failed to save registration to database. Please call our hotline."
          : "ලියාපදිංචිය සුරැකීමට නොහැකි විය. කරුණාකර දුරකථනයෙන් අමතන්න."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-4 lg:p-[24px_32px] flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--y3)] text-[#5B4300] text-xs font-bold w-fit border border-[var(--y2)]">
          <span>🚛</span>
          <span>{locale === "en" ? "Lorry Owner Network" : "ලොරි හිමියන් සඳහා"}</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--ink)]">
          {locale === "en" ? "Register Your Vehicle" : "ඔබගේ ලොරිය ලියාපදිංචි කරන්න"}
        </h1>
        <p className="text-[var(--mut)] text-sm leading-relaxed">
          {locale === "en"
            ? "Own a lorry or manage a transport fleet? Partner with Sithumina Transport to get consistent loads, eliminate empty return runs, and connect with customers across Sri Lanka."
            : "ලොරියක් සතු ඔබත් සිතුමිණ ට්‍රාන්ස්පෝර්ට් සමඟ එක්වී වැඩි ගමන් වාර සහ ආදායම් ලබාගන්න."}
        </p>
      </div>

      {submittedId ? (
        <div className="p-8 rounded-2xl bg-[var(--card)] border border-[#1E9E5A] flex flex-col items-center text-center gap-3 shadow-sm animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-full bg-[#DDF3E7] text-[#12663A] grid place-items-center text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-xl font-extrabold text-[var(--ink)]">
            {locale === "en"
              ? "Registration Submitted to Fleet Database!"
              : "ලියාපදිංචි කිරීම සාර්ථකව පද්ධතියේ සටහන් විය!"}
          </h2>
          <div className="p-2.5 px-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs font-mono text-[var(--ink)]">
            Registration Ref: <span className="font-bold text-[#1E9E5A]">{submittedId.slice(0, 10).toUpperCase()}</span>
          </div>
          <p className="text-sm text-[var(--mut)] max-w-md">
            {locale === "en"
              ? "Welcome to the Sithumina network! Our dispatch operations coordinator will review your lorry and approve it into the live fleet shortly."
              : "අපගේ නියෝජිතයෙකු ඔබ අමතා ලියකියවිලි තහවුරු කර සජීවී සිතියම වෙත ඔබගේ වාහනය එක්කරනු ඇත."}
          </p>
          <button
            onClick={() => setSubmittedId(null)}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--y)] text-[#26231B] font-bold text-xs cursor-pointer hover:opacity-90"
          >
            {locale === "en" ? "Register Another Lorry" : "තවත් වාහනයක් ඇතුළත් කරන්න"}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--ink)]">
                {locale === "en" ? "Owner / Company Name" : "හිමිකරුගේ නම"} *
              </label>
              <input
                required
                type="text"
                placeholder={locale === "en" ? "e.g. Sunil Perera" : "නම ඇතුළත් කරන්න"}
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="p-3 text-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[#FFC20E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--ink)]">
                {locale === "en" ? "Contact Number" : "දුරකථන අංකය"} *
              </label>
              <input
                required
                type="tel"
                placeholder="077 123 4567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="p-3 text-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[#FFC20E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--ink)]">
                {locale === "en" ? "Vehicle Number Plate" : "වාහන අංකය"} *
              </label>
              <input
                required
                type="text"
                placeholder="WP LB-4521"
                value={form.plateNumber}
                onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                className="p-3 text-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[#FFC20E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--ink)]">
                {locale === "en" ? "Vehicle Type" : "වාහන වර්ගය"}
              </label>
              <select
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                className="p-3 text-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[#FFC20E]"
              >
                <option value="10ft">10ft Light Truck</option>
                <option value="14ft">14ft Lorry (Canter / Isuzu)</option>
                <option value="18ft">18ft Container</option>
                <option value="22ft">22ft Flatbed / Tipper</option>
                <option value="40ft">40ft Prime Mover</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--ink)]">
                {locale === "en" ? "Operating Base City" : "ප්‍රධාන නගරය"} *
              </label>
              <input
                required
                type="text"
                placeholder={locale === "en" ? "e.g. Kurunegala" : "උදා: කුරුණෑගල"}
                value={form.baseCity}
                onChange={(e) => setForm({ ...form, baseCity: e.target.value })}
                className="p-3 text-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[#FFC20E]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 py-3.5 px-6 rounded-xl bg-[var(--y)] text-[#26231B] font-extrabold text-sm cursor-pointer hover:opacity-90 transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#26231B] border-t-transparent rounded-full animate-spin" />
                <span>
                  {locale === "en" ? "Submitting Registration..." : "ලියාපදිංචි වෙමින් පවතී..."}
                </span>
              </>
            ) : (
              <span>
                {locale === "en" ? "Submit Lorry Registration" : "ලියාපදිංචි කිරීම සම්පූර්ණ කරන්න"}
              </span>
            )}
          </button>
        </form>
      )}
    </main>
  );
}
