"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/context/LanguageContext";
import { LorryList } from "./LorryList";
import { useLiveLorries } from "@/hooks/useLiveLorries";

// Dynamic import with SSR disabled so Leaflet window/document references are purely client-side
const DynamicLeafletMap = dynamic(
  () => import("./LeafletMapInner").then((mod) => mod.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--y3)] text-[var(--ink)] gap-3 p-4">
        <div className="w-10 h-10 border-4 border-[var(--y)] border-t-[var(--ink)] rounded-full animate-spin" />
        <span className="text-[13px] font-bold text-[var(--ink)] opacity-80">
          Loading Sri Lanka Live Map...
        </span>
      </div>
    ),
  }
);

interface LiveMapProps {
  className?: string;
}

export const LiveMap: React.FC<LiveMapProps> = ({ className = "" }) => {
  const { t } = useLanguage();
  const {
    lorries,
    nearbyLorries,
    selectedLorryId,
    selectLorry,
  } = useLiveLorries();

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Geolocation trigger
  const handleGetLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position?.coords?.latitude);
        const lng = Number(position?.coords?.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setUserLocation([lat, lng]);
        } else {
          setUserLocation([6.9271, 79.8612]);
        }
        setGpsLoading(false);
      },
      (error) => {
        console.warn("Geolocation error:", error?.message);
        // Default fallback to Colombo center if permission denied/testing
        setUserLocation([6.9271, 79.8612]);
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  }, []);

  return (
    <div
      id="live-map"
      className={`w-full border border-[var(--line)] rounded-[16px] overflow-hidden bg-[var(--y3)] shadow-xs select-none scroll-mt-24 relative isolate z-0 ${className}`}
    >
      {/* DESKTOP MAP CARD (≥1024px): 1fr + 260px Lorry List */}
      <div className="hidden lg:grid grid-cols-[1fr_260px] h-[520px] xl:h-[580px]">
        {/* Map Canvas with overlay controls */}
        <div className="relative w-full h-full overflow-hidden bg-[var(--y3)]">
          <DynamicLeafletMap
            lorries={lorries}
            selectedLorryId={selectedLorryId}
            onSelectLorry={selectLorry}
            userLocation={userLocation}
          />

          {/* Desktop "Live · 24 lorries on the road" Pill */}
          <div
            className="absolute left-3 top-3 z-[1000] bg-[var(--card)] text-[var(--ink)] rounded-full px-3 py-1.5 text-[12px] font-bold flex items-center gap-2 shadow-md border border-[var(--line)] select-none pointer-events-none"
            aria-live="polite"
          >
            <i
              className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pu"
              aria-hidden="true"
            />
            <span>
              {lorries.length > 0
                ? `Live · ${lorries.length} ${
                    lorries.length === 1 ? "lorry" : "lorries"
                  } on the road`
                : "Live · Fleet standby"}
            </span>
          </div>

          {/* Desktop "My location" GPS Button */}
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={gpsLoading}
            className="absolute right-3 top-3 z-[1000] bg-[var(--y)] text-[#26231B] border-0 rounded-[10px] px-3 py-2 text-[12px] font-extrabold cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
            aria-label="Find my current location on map"
          >
            <svg
              className={`w-3.5 h-3.5 text-[#26231B] ${gpsLoading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9" />
            </svg>
            <span>{gpsLoading ? "..." : t.map.gps}</span>
          </button>
        </div>

        {/* Right side: Nearby Lorries list */}
        <LorryList
          lorries={nearbyLorries}
          selectedLorryId={selectedLorryId}
          onSelectLorry={selectLorry}
          className="h-full"
        />
      </div>

      {/* MOBILE MAP CARD (<1024px): Map filling height with GPS button and live pill */}
      <div className="lg:hidden relative w-full h-[460px] sm:h-[520px] overflow-hidden bg-[var(--y3)]">
        <DynamicLeafletMap
          lorries={lorries}
          selectedLorryId={selectedLorryId}
          onSelectLorry={selectLorry}
          userLocation={userLocation}
        />

        {/* Mobile GPS Button (Top Right) */}
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={gpsLoading}
          className="absolute right-3 top-3 z-[1000] bg-[var(--y)] text-[#26231B] border-0 rounded-[10px] px-3 py-1.5 text-[12px] font-extrabold cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          aria-label="Find my location"
        >
          {gpsLoading ? "..." : t.map.gpsShort}
        </button>

        {/* Mobile Live Pill */}
        <div
          className="absolute left-3 top-3 z-[1000] bg-[var(--card)] text-[var(--ink)] rounded-full px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5 shadow-md border border-[var(--line)] select-none pointer-events-none"
          aria-live="polite"
        >
          <i
            className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pu"
            aria-hidden="true"
          />
          <span>{lorries.length > 0 ? `${lorries.length} live` : "0 live"}</span>
        </div>
      </div>
    </div>
  );
};
