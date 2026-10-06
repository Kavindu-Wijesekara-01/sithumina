"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useLiveLorries } from "@/hooks/useLiveLorries";
import { StoredBooking } from "@/lib/server-store";

export default function CustomerPortalPage() {
  const { locale } = useLanguage();
  const { profile, loginWithPhone, logout } = useAuth();
  const { lorries } = useLiveLorries();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Customer bookings state
  const [myBookings, setMyBookings] = useState<StoredBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const fetchCustomerBookings = useCallback(async (customerPhone: string) => {
    if (!customerPhone) return;
    setLoadingBookings(true);
    try {
      const res = await fetch(
        `/api/bookings?phone=${encodeURIComponent(customerPhone)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.bookings)) {
          setMyBookings(data.bookings);
        }
      }
    } catch {
      // Non-blocking
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    if (profile?.phone) {
      const initialTimer = setTimeout(() => {
        void fetchCustomerBookings(profile.phone);
      }, 0);
      const interval = setInterval(() => {
        void fetchCustomerBookings(profile.phone);
      }, 3500);
      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
      };
    }
  }, [profile?.phone, fetchCustomerBookings]);

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMessage(
        locale === "en"
          ? "Please enter your mobile phone number."
          : "කරුණාකර ඔබගේ ජංගම දුරකථන අංකය ඇතුළත් කරන්න."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const success = await loginWithPhone(phone, "1234", "customer", {
        name: name.trim() || "Valued Customer",
      });
      if (!success) {
        setErrorMessage(
          locale === "en"
            ? "Could not sign in. Please verify your connection."
            : "ලොග් වීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
            <span className="w-2 h-2 rounded-full bg-[#137333]" />
            {locale === "en" ? "Vehicle Assigned" : "වාහනයක් වෙන් කර ඇත"}
          </span>
        );
      case "in_transit":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC]">
            <span className="w-2 h-2 rounded-full bg-[#1A73E8] animate-pulse" />
            {locale === "en" ? "In Transit" : "ගමනේ යෙදෙමින් පවතී"}
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#F1F3F4] text-[#3C4043] border border-[#DADCE0]">
            ✓ {locale === "en" ? "Delivered" : "භාර දී අවසන්"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[var(--y3)] text-[#5B4300] border border-[var(--y2)]">
            ⏳ {locale === "en" ? "Pending Dispatch" : "නැව්ගත කිරීමට නියමිතයි"}
          </span>
        );
    }
  };

  return (
    <main className="p-4 lg:p-[32px] flex flex-col gap-8 max-w-4xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--y3)] text-[#5B4300] text-xs font-bold w-fit border border-[var(--y2)]">
          <span>👤</span>
          <span>
            {locale === "en" ? "Customer Portal" : "පාරිභෝගික ද්වාරය"}
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-[var(--ink)]">
          {locale === "en"
            ? "Track Your Bookings & Live Vehicles"
            : "ඔබගේ වෙන්කිරීම් සහ සජීවී වාහන ස්ථාන"}
        </h1>
        <p className="text-sm text-[var(--mut)] max-w-2xl">
          {locale === "en"
            ? "Sign in with your phone number to check consignment progress, view driver contact details, and track your assigned lorry live across Sri Lanka."
            : "ඔබගේ දුරකථන අංකය ඇතුළත් කර භාණ්ඩ ප්‍රවාහන ප්‍රගතිය, රියදුරු විස්තර සහ සිතියම මත සජීවීව වාහනය ගමන් කරන ආකාරය නිරීක්ෂණය කරන්න."}
        </p>
      </div>

      {/* STATE 1: CUSTOMER NOT LOGGED IN */}
      {!profile ? (
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--line)] p-6 lg:p-8 shadow-xs max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--y)] flex items-center justify-center text-xl shadow-xs">
              📦
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--ink)]">
                {locale === "en" ? "Customer Sign In" : "පාරිභෝගික ගිණුමට පිවිසෙන්න"}
              </h2>
              <p className="text-xs text-[var(--mut)]">
                {locale === "en"
                  ? "Enter your phone to view your live deliveries"
                  : "ඔබගේ දුරකථන අංකය මඟින් පහසුවෙන් පිවිසෙන්න"}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleCustomerLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-extrabold text-[var(--ink)] mb-1.5">
                {locale === "en" ? "Your Name (Optional)" : "ඔබගේ නම (විකල්ප)"}
              </label>
              <input
                type="text"
                placeholder={locale === "en" ? "e.g. Kamal Perera" : "උදා: කමල් පෙරේරා"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[var(--ink)] mb-1.5">
                {locale === "en" ? "Mobile Phone Number *" : "ජංගම දුරකථන අංකය *"}
              </label>
              <input
                type="tel"
                placeholder="07X XXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--ink)]"
              />
              <p className="text-[11px] text-[var(--mut)] mt-1">
                {locale === "en"
                  ? "Use the phone number you entered when booking a lorry."
                  : "වාහනයක් වෙන්කරන විට ඔබ ලබාදුන් දුරකථන අංකය යොදන්න."}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-3 rounded-xl bg-[var(--y)] text-[#26231B] text-sm font-black border-0 cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <span>⏳ {locale === "en" ? "Signing In..." : "පිවිසෙමින්..."}</span>
              ) : (
                <span>🚀 {locale === "en" ? "Sign In / View My Bookings" : "ඇතුල් වන්න / මගේ වෙන්කිරීම් බලන්න"}</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--mut)]">
            <span>{locale === "en" ? "Need a vehicle right now?" : "දැන්ම වාහනයක් අවශ්‍යද?"}</span>
            <Link href="/book-vehicle" className="font-extrabold text-[#5B4300] hover:underline">
              {locale === "en" ? "Book Vehicle →" : "වෙන්කරන්න →"}
            </Link>
          </div>
        </div>
      ) : (
        /* STATE 2: CUSTOMER LOGGED IN */
        <div className="flex flex-col gap-6">
          {/* PROFILE SUMMARY BAR */}
          <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[var(--y)] flex items-center justify-center text-xl font-black text-[#26231B] shadow-xs">
                👤
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-[var(--ink)]">
                    {profile.name || "Customer"}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E6F4EA] text-[#137333]">
                    {locale === "en" ? "Verified Customer" : "පාරිභෝගික ගිණුම"}
                  </span>
                </div>
                <p className="text-xs text-[var(--mut)] font-mono">
                  📞 {profile.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link
                href="/book-vehicle"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[var(--y)] text-[#26231B] text-xs font-black no-underline hover:opacity-90 text-center"
              >
                + {locale === "en" ? "New Booking" : "නව වෙන්කිරීමක්"}
              </Link>
              <button
                onClick={logout}
                className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--mut)] text-xs font-bold hover:text-red-600 cursor-pointer"
              >
                {locale === "en" ? "Sign Out" : "ඉවත් වන්න"}
              </button>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/"
              className="p-4 rounded-xl bg-[var(--card)] border border-[var(--line)] no-underline hover:border-[var(--y)] transition-all flex items-center gap-3"
            >
              <span className="text-2xl">🗺️</span>
              <div>
                <p className="text-xs font-extrabold text-[var(--ink)]">
                  {locale === "en" ? "Live Island-wide Map" : "සජීවී සිතියම"}
                </p>
                <p className="text-[11px] text-[var(--mut)]">
                  {lorries.length} {locale === "en" ? "lorries active" : "ලොරි සක්‍රීයයි"}
                </p>
              </div>
            </Link>

            <Link
              href="/find-empty-lorry"
              className="p-4 rounded-xl bg-[var(--card)] border border-[var(--line)] no-underline hover:border-[var(--y)] transition-all flex items-center gap-3"
            >
              <span className="text-2xl">🚚</span>
              <div>
                <p className="text-xs font-extrabold text-[var(--ink)]">
                  {locale === "en" ? "Find Empty Lorries" : "හිස් ලොරි සොයන්න"}
                </p>
                <p className="text-[11px] text-[var(--mut)]">
                  {locale === "en" ? "Lower return freight rates" : "අඩු මිලට ආපසු සවාරි"}
                </p>
              </div>
            </Link>

            <Link
              href="/contact"
              className="p-4 rounded-xl bg-[var(--card)] border border-[var(--line)] no-underline hover:border-[var(--y)] transition-all flex items-center gap-3"
            >
              <span className="text-2xl">☎️</span>
              <div>
                <p className="text-xs font-extrabold text-[var(--ink)]">
                  {locale === "en" ? "Customer Support" : "පාරිභෝගික සහාය"}
                </p>
                <p className="text-[11px] text-[var(--mut)]">
                  077 123 4567 (24/7)
                </p>
              </div>
            </Link>
          </div>

          {/* MY BOOKINGS LIST */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[var(--ink)]">
                  {locale === "en" ? "My Bookings & Deliveries" : "මගේ වෙන්කිරීම් සහ භාණ්ඩ ප්‍රවාහන"}
                </h3>
                <p className="text-xs text-[var(--mut)]">
                  {locale === "en"
                    ? "Real-time status updates from Sithumina Transport central operations"
                    : "සිතුමිණ මෙහෙයුම් මැදිරිය මඟින් තහවුරු කළ සජීවී තොරතුරු"}
                </p>
              </div>
              <button
                onClick={() => fetchCustomerBookings(profile.phone)}
                disabled={loadingBookings}
                className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--card)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--y3)] cursor-pointer"
              >
                🔄 {loadingBookings ? "..." : (locale === "en" ? "Refresh" : "යාවත්කාලීන")}
              </button>
            </div>

            {myBookings.length === 0 ? (
              <div className="p-10 text-center bg-[var(--card)] rounded-2xl border border-[var(--line)] flex flex-col items-center justify-center gap-3">
                <span className="text-4xl">📦</span>
                <p className="text-sm font-bold text-[var(--ink)]">
                  {locale === "en"
                    ? "No active bookings found for your phone number."
                    : "ඔබගේ දුරකථන අංකයට අදාළව වෙන්කිරීම් කිසිවක් හමු නොවීය."}
                </p>
                <p className="text-xs text-[var(--mut)] max-w-md">
                  {locale === "en"
                    ? "When you book a vehicle, your booking and assigned driver will appear here automatically."
                    : "ඔබ වාහනයක් වෙන්කළ පසු එම විස්තර සහ වෙන්කළ රියදුරුගේ තොරතුරු මෙහි දිස්වනු ඇත."}
                </p>
                <Link
                  href="/book-vehicle"
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--y)] text-[#26231B] text-xs font-black no-underline hover:opacity-90"
                >
                  🚀 {locale === "en" ? "Book a Vehicle Now" : "දැන්ම වාහනයක් වෙන්කරන්න"}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {myBookings.map((b) => {
                  // Check if assigned lorry is in live lorries
                  const assignedLorry = lorries.find(
                    (l) =>
                      l.id === b.assignedLorryId ||
                      (b.assignedPlate && l.plate === b.assignedPlate)
                  );

                  return (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col gap-4 shadow-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[var(--y3)] text-[#5B4300] border border-[var(--y2)]">
                            {b.id}
                          </span>
                          <span className="text-xs text-[var(--mut)]">
                            📅 {b.date}
                          </span>
                        </div>
                        <div>{getStatusBadge(b.status)}</div>
                      </div>

                      {/* Route Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]/50">
                          <span className="text-[10px] font-bold text-[var(--mut)] uppercase block mb-1">
                            {locale === "en" ? "Pickup Point" : "පැටවුම් ස්ථානය"}
                          </span>
                          <p className="font-bold text-[var(--ink)] text-sm">
                            📍 {b.pickupCity}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]/50">
                          <span className="text-[10px] font-bold text-[var(--mut)] uppercase block mb-1">
                            {locale === "en" ? "Destination Point" : "බෙදාහැරුම් ස්ථානය"}
                          </span>
                          <p className="font-bold text-[var(--ink)] text-sm">
                            🏁 {b.deliveryCity}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-[var(--mut)] pt-1">
                        <div>
                          <span>🚚 {b.vehicleType}</span>
                          {b.packageDetails && (
                            <span className="ml-3">📦 {b.packageDetails}</span>
                          )}
                        </div>
                      </div>

                      {/* ASSIGNED DRIVER & VEHICLE TELEMETRY CARD */}
                      {(b.assignedPlate || b.assignedDriverName || assignedLorry) && (
                        <div className="p-4 rounded-xl bg-[var(--y3)] border border-[var(--y2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black text-[#5B4300] uppercase block">
                              {locale === "en" ? "Assigned Vehicle & Driver" : "වෙන්කළ වාහනය සහ රියදුරු"}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-bold text-[var(--ink)] text-sm">
                                👨‍✈️ {b.assignedDriverName || assignedLorry?.driverName || "Assigned Driver"}
                              </span>
                              <span className="font-mono text-xs font-bold text-[#5B4300]">
                                ({b.assignedPlate || assignedLorry?.plate})
                              </span>
                            </div>
                            {(b.assignedDriverPhone) && (
                              <a
                                href={`tel:${b.assignedDriverPhone}`}
                                className="text-xs text-[#5B4300] font-bold underline mt-1 inline-block"
                              >
                                📞 Call Driver: {b.assignedDriverPhone}
                              </a>
                            )}
                          </div>

                          {assignedLorry && (
                            <Link
                              href={`/#live-map`}
                              className="px-4 py-2 rounded-xl bg-[var(--y)] text-[#26231B] text-xs font-black no-underline hover:opacity-90 flex items-center gap-1.5 shadow-xs"
                            >
                              <span>🛰️</span>
                              <span>{locale === "en" ? "Track Live on Map" : "සිතියමෙන් බලන්න"}</span>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
