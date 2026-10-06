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
    if (userLocation && userLocation !== prevUserLocation.current) {
      prevUserLocation.current = userLocation;
      map.flyTo(userLocation, 12, { animate: true, duration: 1.5 });
    }
  }, [userLocation, map]);

  useEffect(() => {
    if (selectedLorry) {
      map.flyTo([selectedLorry.lat, selectedLorry.lng], 11, {
        animate: true,
        duration: 1.2,
      });
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
  const defaultZoom = 7.4;

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
      {userLocation && (
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
        const isSelected = lorry.id === selectedLorryId;
        const icon = createMarkerIcon(lorry.status, isSelected);

        return (
          <Marker
            key={lorry.id}
            position={[lorry.lat, lorry.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onSelectLorry?.(lorry.id),
            }}
          >
            <Popup className="sithumina-popup">
              <div className="p-1.5 flex flex-col gap-1 min-w-[150px] font-sans">
                <div className="flex items-center justify-between gap-2 border-b border-[#E7E2D0] pb-1">
                  <span className="font-extrabold text-[13px] text-[#26231B]">
                    {lorry.plate}
                  </span>
                  <LorryStatusBadge status={lorry.status} />
                </div>
                <div className="text-[11.5px] text-[#6F6A5A] flex flex-col gap-0.5">
                  <div>
                    <span className="font-semibold text-[#26231B]">Route:</span>{" "}
                    {lorry.route}
                  </div>
                  {lorry.driverName && (
                    <div>
                      <span className="font-semibold text-[#26231B]">Driver:</span>{" "}
                      {lorry.driverName}
                    </div>
                  )}
                  {lorry.vehicleType && (
                    <div>
                      <span className="font-semibold text-[#26231B]">Vehicle:</span>{" "}
                      {lorry.vehicleType}
                    </div>
                  )}
                  {lorry.speedKmH !== undefined && (
                    <div className="text-[10.5px] mt-1 text-[#1E9E5A] font-bold">
                      ● Moving at {lorry.speedKmH} km/h
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};
