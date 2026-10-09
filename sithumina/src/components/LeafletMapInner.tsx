"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Lorry, LorryStatus } from "@/lib/mock-lorries";
import { LorryStatusBadge } from "./LorryStatusBadge";

interface LeafletMapInnerProps {
  lorries: Lorry[];
  selectedLorryId?: string | null;
  onSelectLorry?: (id: string) => void;
  userLocation: [number, number] | null;
}

export function isValidLatLng(coords: unknown): coords is [number, number] {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) return false;
  const lat = Number(coords[0]);
  const lng = Number(coords[1]);
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= 4.0 &&
    lat <= 12.0 &&
    lng >= 78.0 &&
    lng <= 84.0
  );
}

// Controller component to handle programmatically centering and flying on the map
function MapController({
  selectedLorry,
  userLocation,
}: {
  selectedLorry: Lorry | null;
  userLocation: [number, number] | null;
}) {
  const map = useMap();
  const prevUserLocation = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!isValidLatLng(userLocation)) return;

    const isSame =
      prevUserLocation.current &&
      prevUserLocation.current[0] === userLocation[0] &&
      prevUserLocation.current[1] === userLocation[1];

    if (!isSame) {
      prevUserLocation.current = userLocation;
      try {
        const size = map.getSize();
        if (size && size.x > 0 && size.y > 0) {
          map.flyTo(userLocation, 12, { animate: true, duration: 1.5 });
        } else {
          map.setView(userLocation, 12);
        }
      } catch {
        try {
          map.setView(userLocation, 12);
        } catch {}
      }
    }
  }, [userLocation, map]);

  useEffect(() => {
    if (selectedLorry) {
      const lat = Number(selectedLorry.lat);
      const lng = Number(selectedLorry.lng);
      if (isValidLatLng([lat, lng])) {
        try {
          const size = map.getSize();
          if (size && size.x > 0 && size.y > 0) {
            map.flyTo([lat, lng], 11, {
              animate: true,
              duration: 1.2,
            });
          } else {
            map.setView([lat, lng], 11);
          }
        } catch {
          try {
            map.setView([lat, lng], 11);
          } catch {}
        }
      }
    }
  }, [selectedLorry, map]);

  return null;
}

export const LeafletMapInner: React.FC<LeafletMapInnerProps> = ({
  lorries,
  selectedLorryId,
  onSelectLorry,
  userLocation,
}) => {
  const defaultCenter: [number, number] = [7.8731, 80.7718]; // Sri Lanka geographic center
  const defaultZoom = 7.5;

  const selectedLorry = useMemo(() => {
    return lorries.find((l) => l.id === selectedLorryId) || null;
  }, [lorries, selectedLorryId]);

  // Create custom marker icon with pulsing yellow ring
  const createMarkerIcon = (status: LorryStatus, isSelected: boolean) => {
    const ringClass = "lorry-marker-ring";
    const statusBorder = status === "empty" ? "#FFC20E" : "#1E9E5A";
    const transformScale = isSelected ? "transform: scale(1.25);" : "";

    return L.divIcon({
      className: "custom-lorry-pin",
      html: `
        <div class="${ringClass}"></div>
        <div class="lorry-marker-core" style="border-color: ${statusBorder}; ${transformScale}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 7h13v10H1zM14 10h5l3 3v4h-8"/>
            <circle cx="6" cy="18" r="2"/>
            <circle cx="17" cy="18" r="2"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  // User location marker icon
  const userIcon = useMemo(() => {
    return L.divIcon({
      className: "user-loc-pin",
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:28px;height:28px;background:rgba(30,158,90,0.3);border-radius:50%;animation:pu 1.5s infinite;"></div>
          <div style="width:14px;height:14px;background:#1E9E5A;border:2.5px solid #FFFFFF;border-radius:50%;box-shadow:0 0 8px rgba(0,0,0,0.4);"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }, []);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      minZoom={6.5}
      maxZoom={15}
      scrollWheelZoom={true}
      attributionControl={true}
      zoomControl={false}
      className="w-full h-full z-0"
      style={{ background: "var(--y3)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        selectedLorry={selectedLorry}
        userLocation={userLocation}
      />

      {/* User GPS location marker */}
      {isValidLatLng(userLocation) && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="p-1 font-sans">
              <b className="text-[12px] text-[#26231B]">You are here</b>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Live Lorry Markers */}
      {lorries.map((lorry) => {
        if (!lorry) return null;
        const lat = Number(lorry.lat);
        const lng = Number(lorry.lng);
        if (!isValidLatLng([lat, lng])) {
          return null;
        }

        const isSelected = lorry.id === selectedLorryId;
        const icon = createMarkerIcon(lorry.status, isSelected);

        return (
          <Marker
            key={lorry.id}
            position={[lat, lng]}
            icon={icon}
            eventHandlers={{
              click: () => onSelectLorry?.(lorry.id),
            }}
          >
            <Popup className="sithumina-popup">
              <div className="p-2 flex flex-col gap-1.5 min-w-[210px] max-w-[280px] font-sans">
                {/* Header: Plate & Status Badge */}
                <div className="flex items-center justify-between gap-2 border-b border-[#E7E2D0] pb-1.5">
                  <span className="font-black text-[14px] text-[#26231B] tracking-wide">
                    {lorry.plate}
                  </span>
                  <LorryStatusBadge status={lorry.status} />
                </div>

                {/* Driver Info & Phone */}
                <div className="flex items-center justify-between bg-[#F4F2EA] px-2 py-1 rounded-[6px]">
                  <div className="text-[11.5px] text-[#26231B]">
                    <span className="text-[#6F6A5A]">Driver: </span>
                    <b>{lorry.driverName || "Registered Driver"}</b>
                  </div>
                  {lorry.driverPhone ? (
                    <a
                      href={`tel:${lorry.driverPhone.replace(/\s+/g, "")}`}
                      className="text-[11px] font-extrabold text-[#1E9E5A] bg-white px-2 py-0.5 rounded border border-[#1E9E5A] hover:bg-[#1E9E5A] hover:text-white transition-colors"
                      title="Call Driver"
                    >
                      📞 Call
                    </a>
                  ) : null}
                </div>

                {/* Route & Destination */}
                <div className="text-[11.5px] text-[#26231B] flex flex-col gap-1">
                  <div>
                    <span className="text-[#6F6A5A] font-medium">Route: </span>
                    <span className="font-bold">{lorry.route}</span>
                  </div>

                  {/* Loaded Trip Details */}
                  {lorry.status === "on_trip" ? (
                    <div className="bg-[#FFF9E6] border border-[#FFE08A] rounded-[6px] p-1.5 flex flex-col gap-0.5 text-[11px]">
                      {lorry.startLocation && (
                        <div>
                          <span className="text-[#7A6200] font-semibold">Start:</span>{" "}
                          <b>{lorry.startLocation}</b>
                        </div>
                      )}
                      {lorry.endLocation && (
                        <div>
                          <span className="text-[#7A6200] font-semibold">Destination:</span>{" "}
                          <b>{lorry.endLocation}</b>
                        </div>
                      )}
                      {lorry.emptyTime && (
                        <div>
                          <span className="text-[#7A6200] font-semibold">Est. Empty:</span>{" "}
                          <b className="text-[#B36200]">{lorry.emptyTime}</b>
                        </div>
                      )}
                      {lorry.returnRoute && (
                        <div>
                          <span className="text-[#7A6200] font-semibold">Return:</span>{" "}
                          <b>{lorry.returnRoute}</b>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Empty Vehicle Availability Details */
                    <div className="bg-[#EBF7EE] border border-[#BDE8C8] rounded-[6px] p-1.5 flex flex-col gap-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#137333]">Space: <b>{lorry.availableSpace || "Full Space"}</b></span>
                        <span className="text-[#137333]">Cap: <b>{lorry.availableCapacityKg || "3,000 Kg"}</b></span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {lorry.hasFreezer && (
                          <span className="bg-[#137333] text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded">
                            ❄️ Freezer
                          </span>
                        )}
                        {lorry.hasHelper && (
                          <span className="bg-[#137333] text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded">
                            👷 Helper
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Live Speed / Telemetry */}
                  <div className="flex items-center justify-between text-[10.5px] text-[#6F6A5A] pt-1 border-t border-[#E7E2D0]">
                    <span className="text-[#1E9E5A] font-bold">
                      ● {lorry.speedKmH && lorry.speedKmH > 0 ? `Moving: ${lorry.speedKmH} km/h` : "Live GPS Active"}
                    </span>
                    <span className="text-[10px]">{lorry.lastUpdated || "Live"}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};
