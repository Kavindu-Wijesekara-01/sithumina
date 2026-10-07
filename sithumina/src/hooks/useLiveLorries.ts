"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Lorry, LorryStatus } from "@/lib/mock-lorries";
import {
  subscribeLorries,
  seedInitialLorriesIfEmpty,
  updateLorryStatus,
  updateLorryLocation,
} from "@/lib/db-services";

export interface UseLiveLorriesOptions {
  pollingIntervalMs?: number;
  simulateMovement?: boolean;
}

export interface UseLiveLorriesReturn {
  lorries: Lorry[];
  nearbyLorries: Lorry[];
  loading: boolean;
  error: Error | null;
  isLive: boolean;
  activeCount: number;
  emptyCount: number;
  onTripCount: number;
  selectedLorryId: string | null;
  selectLorry: (id: string | null) => void;
  filterStatus: LorryStatus | "all";
  setFilterStatus: (status: LorryStatus | "all") => void;
  filteredLorries: Lorry[];
  toggleLorryStatus: (id: string, currentStatus: LorryStatus) => Promise<void>;
  updateLocation: (id: string, lat: number, lng: number) => Promise<void>;
}

/**
 * Hook to retrieve and subscribe to live lorry locations in Firebase Firestore.
 * Receives real-time updates from Firebase and provides functions to mutate status.
 */
export function useLiveLorries({
  pollingIntervalMs = 4000,
  simulateMovement = false,
}: UseLiveLorriesOptions = {}): UseLiveLorriesReturn {
  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedLorryId, setSelectedLorryId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<LorryStatus | "all">("all");

  // Subscribe to real-time Firestore fleet updates
  useEffect(() => {
    let isSubscribed = true;

    // Trigger background seed check if empty
    seedInitialLorriesIfEmpty().catch(() => {});

    const unsubscribe = subscribeLorries(
      (firestoreLorries) => {
        if (!isSubscribed) return;
        setLorries(firestoreLorries);
        setLoading(false);
      },
      (err) => {
        if (!isSubscribed) return;
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  // Simulate subtle real-time movement for vehicles currently "on_trip"
  useEffect(() => {
    if (!simulateMovement) return;

    const intervalId = setInterval(() => {
      setLorries((prevLorries) =>
        prevLorries.map((lorry) => {
          if (lorry.status !== "on_trip") {
            return lorry;
          }

          // Small jitter simulating highway movement (~0.0003 deg is roughly 30m)
          const angle = ((lorry.heading ?? 45) * Math.PI) / 180;
          const delta = 0.00035;
          const deltaLat = Math.cos(angle) * delta + (Math.random() - 0.5) * 0.0001;
          const deltaLng = Math.sin(angle) * delta + (Math.random() - 0.5) * 0.0001;

          // Keep within Sri Lanka bounding box (5.9 to 9.8 lat, 79.6 to 81.9 lng)
          const baseLat = Number.isFinite(Number(lorry.lat)) ? Number(lorry.lat) : 6.9271;
          const baseLng = Number.isFinite(Number(lorry.lng)) ? Number(lorry.lng) : 79.8612;
          let newLat = baseLat + deltaLat;
          let newLng = baseLng + deltaLng;
          let newHeading = lorry.heading ?? 45;

          if (newLat < 6.0 || newLat > 9.7) {
            newHeading = (newHeading + 180) % 360;
            newLat = Math.max(6.0, Math.min(9.7, newLat));
          }
          if (newLng < 79.7 || newLng > 81.8) {
            newHeading = (newHeading + 180) % 360;
            newLng = Math.max(79.7, Math.min(81.8, newLng));
          }

          return {
            ...lorry,
            lat: newLat,
            lng: newLng,
            heading: newHeading,
            lastUpdated: "Just now",
          };
        })
      );
    }, pollingIntervalMs);

    return () => clearInterval(intervalId);
  }, [simulateMovement, pollingIntervalMs]);

  const selectLorry = useCallback((id: string | null) => {
    setSelectedLorryId(id);
  }, []);

  const toggleLorryStatus = useCallback(
    async (id: string, currentStatus: LorryStatus) => {
      const nextStatus: LorryStatus = currentStatus === "empty" ? "on_trip" : "empty";
      // Optimistic update
      setLorries((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: nextStatus } : l))
      );
      try {
        await updateLorryStatus(id, nextStatus);
      } catch (e) {
        console.warn("Could not sync status change to Firebase:", e);
      }
    },
    []
  );

  const updateLocation = useCallback(
    async (id: string, lat: number, lng: number) => {
      setLorries((prev) =>
        prev.map((l) => (l.id === id ? { ...l, lat, lng } : l))
      );
      try {
        await updateLorryLocation(id, lat, lng);
      } catch (e) {
        console.warn("Could not sync location to Firebase:", e);
      }
    },
    []
  );

  // Primary prototype shows 4 prominent lorries in the sidebar panel
  const nearbyLorries = useMemo(() => {
    return lorries.slice(0, 4);
  }, [lorries]);

  const activeCount = lorries.length;

  const emptyCount = useMemo(() => {
    return lorries.filter((l) => l.status === "empty").length;
  }, [lorries]);

  const onTripCount = useMemo(() => {
    return lorries.filter((l) => l.status === "on_trip").length;
  }, [lorries]);

  const filteredLorries = useMemo(() => {
    if (filterStatus === "all") return lorries;
    return lorries.filter((l) => l.status === filterStatus);
  }, [lorries, filterStatus]);

  return {
    lorries,
    nearbyLorries,
    loading,
    error,
    isLive: true,
    activeCount,
    emptyCount,
    onTripCount,
    selectedLorryId,
    selectLorry,
    filterStatus,
    setFilterStatus,
    filteredLorries,
    toggleLorryStatus,
    updateLocation,
  };
}
