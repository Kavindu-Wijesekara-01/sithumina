"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface WebMapLorry {
  id?: string;
  plate: string;
  route: string;
  driverName?: string;
  driverPhone?: string;
  status: "On trip" | "Empty";
  lat: number;
  lng: number;
  speedKmH?: number;
  startLocation?: string;
  endLocation?: string;
  travelRoute?: string;
  emptyTime?: string;
  returnRoute?: string;
  finalDestination?: string;
  availableSpace?: string;
  availableCapacityKg?: string;
  hasFreezer?: boolean;
  hasHelper?: boolean;
  isOnline?: boolean;
}

interface LiveLeafletMapProps {
  lorries: WebMapLorry[];
  selectedPlate: string | null;
  filter: "all" | "Empty" | "On trip";
  onSelectLorry: (plate: string) => void;
  height?: string | number;
}

export default function LiveLeafletMap({
  lorries,
  selectedPlate,
  filter,
  onSelectLorry,
  height = "100%",
}: LiveLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [plate: string]: L.Marker }>({});
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  // Initialize Map with Smooth Zoom and Inertia Physics
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [7.8731, 80.7718],
        zoom: 8,
        minZoom: 6,
        maxZoom: 18,
        zoomControl: true,
        attributionControl: false,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
        wheelDebounceTime: 40,
        wheelPxPerZoomLevel: 60,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        dragging: true,
        inertia: true,
        inertiaDeceleration: 3000,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Invalidate map size on fullscreen toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isFullScreen]);

  // Update Markers (Only show lorries that have started live / are online)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const filtered = lorries.filter(
      (l) => l.isOnline !== false && (filter === "all" || l.status === filter)
    );

    filtered.forEach((lorry) => {
      const isSelected = lorry.plate === selectedPlate;
      const isOnTrip = lorry.status === "On trip";

      const pulseHtml = isOnTrip
        ? `<div class="absolute -inset-2.5 rounded-full bg-primary/40 animate-ping pointer-events-none"></div>`
        : "";

      const ringHtml = isSelected
        ? `<div class="absolute -inset-1 rounded-full border-2 border-ink pointer-events-none"></div>`
        : "";

      const badgeBg = isOnTrip ? "bg-ink text-primary border-primary" : "bg-ok text-white border-white";

      const html = `
        <div class="relative flex items-center justify-center cursor-pointer select-none">
          ${pulseHtml}
          ${ringHtml}
          <div class="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-md border-2 ${badgeBg} whitespace-nowrap transition-transform hover:scale-105">
            <span>🚚</span>
            <span>${lorry.plate}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html,
        iconSize: [94, 32],
        iconAnchor: [47, 16],
        popupAnchor: [0, -16],
      });

      const tripDetails = isOnTrip
        ? `
          <div class="mt-2 pt-2 border-t border-[#E7E2D0]/30 text-[11px] space-y-1">
            <div class="flex justify-between gap-2"><span class="text-muted">Start:</span><span class="font-bold text-ink">${lorry.startLocation || "Colombo"}</span></div>
            <div class="flex justify-between gap-2"><span class="text-muted">Dest:</span><span class="font-bold text-ink">${lorry.endLocation || lorry.route}</span></div>
            ${lorry.travelRoute ? `<div class="flex justify-between gap-2"><span class="text-muted">Route:</span><span class="font-bold text-ink">${lorry.travelRoute}</span></div>` : ""}
            ${lorry.emptyTime ? `<div class="flex justify-between gap-2"><span class="text-muted">Est. Empty:</span><span class="font-extrabold text-primary">${lorry.emptyTime}</span></div>` : ""}
            ${lorry.returnRoute ? `<div class="flex justify-between gap-2"><span class="text-muted">Return:</span><span class="font-bold text-ink">${lorry.returnRoute}</span></div>` : ""}
            ${lorry.finalDestination ? `<div class="flex justify-between gap-2"><span class="text-muted">Final Stop:</span><span class="font-bold text-ink">${lorry.finalDestination}</span></div>` : ""}
          </div>
        `
        : `
          <div class="mt-2 pt-2 border-t border-[#E7E2D0]/30 text-[11px] space-y-1">
            <div class="flex justify-between gap-2"><span class="text-muted">Location:</span><span class="font-bold text-ink">${lorry.startLocation || lorry.route || "Standby"}</span></div>
            ${lorry.endLocation ? `<div class="flex justify-between gap-2"><span class="text-muted">Bound For:</span><span class="font-bold text-ink">${lorry.endLocation}</span></div>` : ""}
            <div class="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-[#E7E2D0]/20">
              <span class="bg-[#26231B]/10 text-ink px-1.5 py-0.5 rounded text-[10px] font-bold">Space: ${lorry.availableSpace || "Full Space"}</span>
              <span class="bg-[#26231B]/10 text-ink px-1.5 py-0.5 rounded text-[10px] font-bold">Capacity: ${lorry.availableCapacityKg || "3,000 Kg"}</span>
              ${lorry.hasFreezer ? `<span class="bg-[#DDF3E7] text-[#12663A] px-1.5 py-0.5 rounded text-[10px] font-bold">Freezer</span>` : ""}
              ${lorry.hasHelper ? `<span class="bg-[#DDF3E7] text-[#12663A] px-1.5 py-0.5 rounded text-[10px] font-bold">Helper</span>` : ""}
            </div>
          </div>
        `;

      const popupHtml = `
        <div class="p-2 min-w-[220px] max-w-[280px] font-sans text-ink">
          <div class="flex items-center justify-between pb-1 mb-1 border-b border-line">
            <span class="text-[14px] font-black text-ink">${lorry.plate}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-black ${isOnTrip ? "bg-primary text-ink" : "bg-ok text-white"}">
              ${isOnTrip ? "Loaded" : "Empty"}
            </span>
          </div>
          <div class="text-[11.5px] font-bold text-ink mb-1">
            ${lorry.driverName || "Driver"}
          </div>
          ${tripDetails}
        </div>
      `;

      const marker = L.marker([lorry.lat, lorry.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        onSelectLorry(lorry.plate);
      });

      markersRef.current[lorry.plate] = marker;
    });

    // Pan to selected lorry if available
    if (selectedPlate && markersRef.current[selectedPlate]) {
      const selectedMarker = markersRef.current[selectedPlate];
      selectedMarker.openPopup();
    }
  }, [lorries, selectedPlate, filter, onSelectLorry]);

  return (
    <div
      className={
        isFullScreen
          ? "fixed inset-0 z-[9999] bg-[#EFECE1] w-screen h-screen flex flex-col"
          : "relative w-full h-full rounded-card overflow-hidden border border-line bg-[#EFECE1]"
      }
    >
      {/* Fullscreen Header Bar */}
      {isFullScreen && (
        <div className="bg-ink text-[#F6F1DF] px-4 py-3 flex items-center justify-between z-[1000] border-b border-primary/30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇱🇰</span>
            <span className="font-extrabold text-primary text-base">Sri Lanka Live Fleet Map</span>
            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-bold">
              {lorries.filter((l) => l.isOnline !== false).length} Online
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsFullScreen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-ink text-xs font-black shadow hover:bg-yellow-400 transition-colors cursor-pointer"
          >
            <span>✕</span>
            <span>Exit Fullscreen</span>
          </button>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className={isFullScreen ? "w-full flex-1" : "w-full h-full min-h-[460px]"}
        style={!isFullScreen ? { height } : undefined}
      />

      {/* On-Map Floating Actions */}
      <div className="absolute bottom-4 right-4 z-[999] flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([7.8731, 80.7718], 8, { animate: true });
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-ink text-primary text-[12px] font-bold border border-primary shadow-md hover:bg-primary hover:text-ink transition-colors cursor-pointer"
        >
          <span>🇱🇰</span>
          <span>Recenter</span>
        </button>

        {!isFullScreen ? (
          <button
            type="button"
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-ink text-primary text-[12px] font-bold border border-primary shadow-md hover:bg-primary hover:text-ink transition-colors cursor-pointer"
          >
            <span>⛶</span>
            <span>Fullscreen</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsFullScreen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-brand text-white text-[12px] font-bold shadow-md hover:bg-red-700 transition-colors cursor-pointer"
          >
            <span>✕</span>
            <span>Exit</span>
          </button>
        )}
      </div>
    </div>
  );
}
