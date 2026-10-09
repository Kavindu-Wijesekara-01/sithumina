"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { WebMapLorry } from "@/components/map/LiveLeafletMap";

// Dynamic import with ssr: false to prevent window errors with Leaflet
const LiveLeafletMap = dynamic(() => import("@/components/map/LiveLeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] bg-card border border-line rounded-card flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-3 border-line border-t-primary animate-spin" />
      <span className="text-muted text-[13px] font-bold">Loading Sri Lanka Live Map...</span>
    </div>
  ),
});

// Fleet lorries only appear when riders start live broadcasting
const INITIAL_LORRIES: WebMapLorry[] = [];

export default function LiveMapPage() {
  const [lorries] = useState<WebMapLorry[]>(INITIAL_LORRIES);
  const [filter, setFilter] = useState<"all" | "Empty" | "On trip">("all");
  const [selectedPlate, setSelectedPlate] = useState<string>("");

  const filteredLorries = lorries.filter((l) => filter === "all" || l.status === filter);
  const selectedLorry = lorries.find((l) => l.plate === selectedPlate) || lorries[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header / Filter Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-[#EAE7DC] p-1 rounded-card border border-line">
          {(["all", "Empty", "On trip"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-[9px] text-[13px] font-bold transition-all cursor-pointer ${
                filter === f
                  ? "bg-primary text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[12px] font-extrabold bg-[#DDF3E7] text-[#12663A] border border-[#A6E1BF]">
            <span className="w-2 h-2 rounded-full bg-[#1E9E5A] animate-pulse" />
            Live · {filteredLorries.length} lorries online
          </span>
        </div>
      </div>

      {/* Main Grid: Sri Lanka Map (Left) + Fleet Inspector & List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 h-[calc(100vh-170px)] min-h-[540px]">
        {/* Leaflet OpenStreetMap Container */}
        <div className="h-full min-h-[460px]">
          <LiveLeafletMap
            lorries={lorries}
            selectedPlate={selectedPlate}
            filter={filter}
            onSelectLorry={setSelectedPlate}
            height="100%"
          />
        </div>

        {/* Right Panel: Selected Card & Fleet List */}
        <div className="flex flex-col gap-3 h-full overflow-hidden">
          {/* Selected Lorry Inspector */}
          {selectedLorry && (
            <div className="bg-card border border-line rounded-card p-4 shadow-card shrink-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-[16px] font-extrabold text-ink">{selectedLorry.plate}</h3>
                  <p className="text-[12px] font-semibold text-muted">{selectedLorry.route}</p>
                </div>
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-pill ${
                    selectedLorry.status === "Empty"
                      ? "bg-[#DDF3E7] text-[#12663A]"
                      : "bg-[#FFE08A] text-[#5B4300]"
                  }`}
                >
                  {selectedLorry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-line text-[12px]">
                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Driver</span>
                  <span className="font-extrabold text-ink">{selectedLorry.driverName || "Assigned Driver"}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Speed</span>
                  <span className="font-extrabold text-ok">
                    {selectedLorry.speedKmH ? `${selectedLorry.speedKmH} km/h` : "Parked"}
                  </span>
                </div>
              </div>

              {/* Trip Availability Specifications */}
              {selectedLorry.status === "Empty" ? (
                <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-line text-[11px]">
                  <span className="bg-surface text-ink px-2 py-0.5 rounded font-bold border border-line">
                    Space: {selectedLorry.availableSpace || "Full Space"}
                  </span>
                  <span className="bg-surface text-ink px-2 py-0.5 rounded font-bold border border-line">
                    Capacity: {selectedLorry.availableCapacityKg || "3,000 Kg Max"}
                  </span>
                  {selectedLorry.hasFreezer && (
                    <span className="bg-[#DDF3E7] text-[#12663A] px-2 py-0.5 rounded font-extrabold border border-[#A6E1BF]">
                      Freezer
                    </span>
                  )}
                  {selectedLorry.hasHelper && (
                    <span className="bg-[#DDF3E7] text-[#12663A] px-2 py-0.5 rounded font-extrabold border border-[#A6E1BF]">
                      Helper
                    </span>
                  )}
                </div>
              ) : (
                selectedLorry.emptyTime && (
                  <div className="mt-2.5 pt-2.5 border-t border-line text-[11px] text-muted font-bold">
                    Est. Empty: <span className="text-ink font-extrabold">{selectedLorry.emptyTime}</span>
                  </div>
                )
              )}
            </div>
          )}

          {/* Lorries List Scroll */}
          <div className="bg-card border border-line rounded-card p-3 shadow-card flex-1 flex flex-col overflow-hidden">
            <h4 className="text-[13px] font-extrabold text-ink mb-2">
              Fleet Lorries ({filteredLorries.length})
            </h4>
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
              {filteredLorries.map((lorry) => {
                const isSelected = lorry.plate === selectedPlate;
                return (
                  <button
                    key={lorry.plate}
                    type="button"
                    onClick={() => setSelectedPlate(lorry.plate)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-[#FFF6D6]"
                        : "border-line bg-card hover:bg-[#FAF8F2]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[13px] text-ink">{lorry.plate}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                      </div>
                      <span className="text-[11px] text-muted block">{lorry.route}</span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-pill shrink-0 ${
                        lorry.status === "Empty"
                          ? "bg-[#DDF3E7] text-[#12663A]"
                          : "bg-[#FFE08A] text-[#5B4300]"
                      }`}
                    >
                      {lorry.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
