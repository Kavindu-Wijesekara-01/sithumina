"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  createBooking,
  findBookingByTrackingOrPhone,
  Booking,
} from "@/lib/db-services";

export default function BookVehiclePage() {
  const { locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<"book" | "track">("book");
  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<{
    id: string;
    trackingId: string;
  } | null>(null);

  const [form, setForm] = useState({
    pickup: "",
    destination: "",
    vehicleType: "14ft",
    weight: "",
    date: "",
    phone: "",
    notes: "",
  });

  // Tracking query state
  const [trackQuery, setTrackQuery] = useState("");
  const [trackResults, setTrackResults] = useState<Booking[] | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createBooking(form);
      setSubmittedBooking(res);
      setForm({
        pickup: "",
        destination: "",
        vehicleType: "14ft",
        weight: "",
        date: "",
        phone: "",
        notes: "",
      });
    } catch (err) {
      console.error("Booking submission error:", err);
      alert(
        locale === "en"
          ? "Failed to save booking. Please try again or call dispatch."
          : "වෙන්කිරීම සුරැකීමට නොහැකි විය. කරුණාකර දුරකථනයෙන් අමතන්න."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    setTrackLoading(true);
    setTrackError("");
    setTrackResults(null);
    try {
      const results = await findBookingByTrackingOrPhone(trackQuery);
      if (results.length === 0) {
        setTrackError(
          locale === "en"
            ? "No bookings found matching that Tracking ID or Phone Number."
            : "මෙම අංකයට අදාළ වෙන්කිරීම් කිසිවක් හමු නොවීය."
        );
      } else {
        setTrackResults(results);
      }
    } catch {
      setTrackError(
        locale === "en"
          ? "Error searching for bookings. Please try again."
          : "සොයාගැනීමේ දෝෂයක්. කරුණාකර නැවත උත්සාහ කරන්න."
      );
    } finally {
      setTrackLoading(false);
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            ⏳ {locale === "en" ? "Pending Dispatch" : "තහවුරු කිරීමේ අදියර"}
          </span>
        );
      case "confirmed":
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            ✓ {locale === "en" ? "Confirmed" : "තහවුරු කරන ලදී"}
          </span>
        );
      case "assigned":
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
            🚚 {locale === "en" ? "Lorry Assigned" : "වාහනයක් වෙන්කෙරුණි"}
          </span>
        );
      case "in_transit":
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            🛣️ {locale === "en" ? "In Transit" : "ගමනේ යෙදෙමින්"}
          </span>
        );
      case "delivered":
        return (
          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
            📦 {locale === "en" ? "Delivered" : "භාරදෙන ලදී"}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <main className="p-4 lg:p-[24px_32px] flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--y3)] text-[#5B4300] text-xs font-bold w-fit border border-[var(--y2)]">
          <span>📦</span>
          <span>
            {locale === "en" ? "Custom Freight Booking" : "තනි වාහන වෙන්කිරීම"}
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--ink)]">
          {locale === "en"
            ? "Book an Individual Vehicle"
            : "ඔබගේ බඩු සඳහාම වාහනයක් වෙන්කරන්න"}
        </h1>
        <p className="text-[var(--mut)] text-sm leading-relaxed">
          {locale === "en"
            ? "Reserve a dedicated lorry exclusively for your cargo. Live synced directly with Sithumina 24/7 Dispatch."
            : "ඔබගේ භාණ්ඩ ප්‍රවාහනය සඳහා පමණක් වෙන්වූ ලොරියක් ඉක්මනින් වෙන්කරවා ගන්න. සජීවීව පද්ධතියට සම්බන්ධයි."}
        </p>
      </div>

      {/* Tabs: New Booking vs Track Existing */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
        <button
          type="button"
          onClick={() => setActiveTab("book")}
          className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer border-0 ${
            activeTab === "book"
              ? "bg-[var(--y)] text-[#26231B] shadow-xs"
              : "bg-transparent text-[var(--mut)] hover:text-[var(--ink)]"
          }`}
        >
          📝 {locale === "en" ? "New Booking" : "නව වෙන්කිරීමක්"}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("track")}
          className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer border-0 ${
            activeTab === "track"
              ? "bg-[var(--y)] text-[#26231B] shadow-xs"
              : "bg-transparent text-[var(--mut)] hover:text-[var(--ink)]"
          }`}
        >
          🔍 {locale === "en" ? "Track Booking Status" : "තත්වය පරීක්ෂා කරන්න"}
        </button>
      </div>

      {activeTab === "book" ? (
        submittedBooking ? (
          <div className="p-8 rounded-2xl bg-[var(--card)] border border-[#1E9E5A] flex flex-col items-center text-center gap-3 shadow-sm animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-full bg-[#DDF3E7] text-[#12663A] grid place-items-center text-2xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-extrabold text-[var(--ink)]">
              {locale === "en"
                ? "Booking Request Saved in Database!"
                : "වෙන්කිරීමේ ඉල්ලීම සාර්ථකව පද්ධතියේ සටහන් විය!"}
            </h2>
            <div className="p-3 px-5 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex flex-col items-center gap-1 my-1">
              <span className="text-xs text-[var(--mut)] font-bold uppercase tracking-wider">
                {locale === "en" ? "Your Tracking Reference" : "ඔබගේ ලුහුබැඳීමේ අංකය"}
              </span>
              <span className="text-xl font-black text-[#C51616] tracking-wider font-mono">
                {submittedBooking.trackingId}
              </span>
            </div>
            <p className="text-sm text-[var(--mut)] max-w-md">
              {locale === "en"
                ? "Our dispatch team has received your request in Firebase. You can use this Tracking Reference anytime in the Track Booking tab to view live driver assignments."
                : "ඔබගේ ඉල්ලීම පද්ධතියට ලැබී ඇත. ඉහත කේතය භාවිතයෙන් ඕනෑම වේලාවක වෙන්කිරීමේ තත්වය බලාගත හැක."}
            </p>
            <div className="flex gap-3 mt-2 flex-wrap justify-center">
              <button
                onClick={() => {
                  setTrackQuery(submittedBooking.trackingId);
                  setActiveTab("track");
                  setSubmittedBooking(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#26231B] text-[var(--y)] font-bold text-xs cursor-pointer hover:bg-[#1a1813]"
              >
                {locale === "en" ? "View in Tracker" : "ලුහුබැඳීම වෙත යන්න"}
              </button>
              <button
                onClick={() => setSubmittedBooking(null)}
                className="px-5 py-2.5 rounded-xl bg-[var(--y)] text-[#26231B] font-bold text-xs cursor-pointer hover:opacity-90"
              >
                {locale === "en" ? "Submit Another Booking" : "තවත් වෙන්කිරීමක් කරන්න"}
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {locale === "en" ? "Pickup Location" : "පැටවුම් ස්ථානය"} *
                </label>
                <input
                  required
                  type="text"
                  placeholder={
                    locale === "en" ? "e.g. Colombo 03, Fort" : "උදා: කොළඹ, නුවර"
                  }
                  value={form.pickup}
                  onChange={(e) => setForm({ ...form, pickup: e.target.value })}
                  className="p-3 text-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[#FFC20E]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {locale === "en" ? "Delivery Destination" : "බෑමේ ස්ථානය"} *
                </label>
                <input
                  required
                  type="text"
                  placeholder={
                    locale === "en"
                      ? "e.g. Kandy, Galle, Jaffna"
                      : "උදා: ගාල්ල, මහනුවර"
                  }
                  value={form.destination}
                  onChange={(e) =>
                    setForm({ ...form, destination: e.target.value })
                  }
                  className="p-3 text-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[#FFC20E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {locale === "en" ? "Vehicle Required" : "අවශ්‍ය වාහන ප්‍රමාණය"}
                </label>
                <select
                  value={form.vehicleType}
                  onChange={(e) =>
                    setForm({ ...form, vehicleType: e.target.value })
                  }
                  className="p-3 text-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[#FFC20E]"
                >
                  <option value="10ft">10ft (Dimo Batta / Ace)</option>
                  <option value="14ft">14ft (Isuzu / Canter)</option>
                  <option value="18ft">18ft Covered Container</option>
                  <option value="24ft">24ft Heavy Cargo</option>
                  <option value="40ft">40ft Prime Mover</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {locale === "en" ? "Preferred Date" : "දිනය"}
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="p-3 text-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[#FFC20E]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {locale === "en" ? "Your Phone Number" : "ඔබගේ දුරකථන අංකය"} *
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--ink)]">
                {locale === "en" ? "Cargo Weight / Notes" : "බර හෝ විශේෂ සටහන්"}
              </label>
              <textarea
                rows={2}
                placeholder={
                  locale === "en"
                    ? "e.g. Approx 1.5 tons machinery, loading in the morning"
                    : "බඩු ප්‍රමාණය හෝ විශේෂ උපදෙස්"
                }
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="p-3 text-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[#FFC20E]"
              />
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
                    {locale === "en" ? "Submitting to Dispatch..." : "සුරැකෙමින් පවතී..."}
                  </span>
                </>
              ) : (
                <span>
                  {locale === "en" ? "Confirm Vehicle Booking" : "වෙන්කිරීම තහවුරු කරන්න"}
                </span>
              )}
            </button>
          </form>
        )
      ) : (
        /* TRACK BOOKING TAB */
        <div className="flex flex-col gap-5">
          <form
            onSubmit={handleTrack}
            className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col gap-3"
          >
            <label className="text-xs font-bold text-[var(--ink)]">
              {locale === "en"
                ? "Enter Tracking ID (e.g. ST-2026-1234) or Your Phone Number"
                : "ලුහුබැඳීමේ අංකය හෝ ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න"}
            </label>
            <div className="flex gap-2">
              <input
                required
                type="text"
                placeholder="ST-2026-..."
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                className="flex-1 p-3 text-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[#FFC20E] font-mono"
              />
              <button
                type="submit"
                disabled={trackLoading}
                className="px-6 py-3 rounded-xl bg-[#26231B] text-[var(--y)] font-extrabold text-sm cursor-pointer hover:bg-[#1a1813] transition-colors disabled:opacity-50"
              >
                {trackLoading ? "..." : locale === "en" ? "Search" : "සොයන්න"}
              </button>
            </div>
            {trackError && (
              <p className="text-xs text-red-600 font-semibold">{trackError}</p>
            )}
          </form>

          {/* Results List */}
          {trackResults && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[var(--ink)]">
                {locale === "en"
                  ? `Found ${trackResults.length} Booking(s)`
                  : `වෙන්කිරීම් ${trackResults.length}ක් හමු විය`}
              </h3>
              {trackResults.map((bk) => (
                <div
                  key={bk.id}
                  className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[var(--line)] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[var(--ink)]">
                        {bk.trackingId}
                      </span>
                      <span className="text-xs text-[var(--mut)]">
                        {new Date(bk.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {getStatusBadge(bk.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <strong className="text-[var(--ink)]">
                        {locale === "en" ? "Route: " : "ගමන් මඟ: "}
                      </strong>
                      <span className="text-[var(--mut)]">
                        {bk.pickup} ➔ {bk.destination}
                      </span>
                    </div>
                    <div>
                      <strong className="text-[var(--ink)]">
                        {locale === "en" ? "Vehicle: " : "වාහනය: "}
                      </strong>
                      <span className="text-[var(--mut)]">{bk.vehicleType}</span>
                    </div>
                    <div>
                      <strong className="text-[var(--ink)]">
                        {locale === "en" ? "Contact: " : "දුරකථනය: "}
                      </strong>
                      <span className="text-[var(--mut)]">{bk.phone}</span>
                    </div>
                    {bk.assignedLorryPlate && (
                      <div className="col-span-full p-2.5 rounded-lg bg-[var(--y3)] border border-[var(--y2)]">
                        <strong className="text-[#5B4300]">
                          🚛 {locale === "en" ? "Assigned Lorry: " : "වෙන්කළ වාහන අංකය: "}
                        </strong>
                        <span className="font-black text-[#26231B]">
                          {bk.assignedLorryPlate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
