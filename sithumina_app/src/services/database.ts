import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "../config/api";
import { db } from "../config/firebase";
import { doc, setDoc, getDoc, getDocs, collection, query, where } from "firebase/firestore";

export const ADMIN_SECRET_ID = "sithuminaadmin$";
const LOCAL_DRIVERS_KEY = "@sithumina_local_drivers_cache";

export interface DriverRecord {
  id?: string;
  driverId: string; // Unique Driver ID, e.g. ST-DRV-8204
  name: string;
  phone: string;
  plate: string;
  vehicleType: string;
  route: string;
  lorryId: string;
  active: boolean;
  createdAt: number;
}

export interface RegisterDriverInput {
  name: string;
  phone: string;
  plate: string;
  vehicleType: string;
  route: string;
}

/**
 * Generate a unique, professional Driver ID
 * Format: ST-DRV-XXXX (e.g. ST-DRV-4921)
 */
export function generateUniqueDriverId(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ST-DRV-${randomSuffix}`;
}

/**
 * Helper to get locally cached drivers from AsyncStorage
 */
async function getCachedDrivers(): Promise<DriverRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_DRIVERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Helper to save drivers to local AsyncStorage
 */
async function saveCachedDriver(driver: DriverRecord): Promise<void> {
  try {
    const drivers = await getCachedDrivers();
    const filtered = drivers.filter(
      (d) => d.driverId !== driver.driverId && d.plate !== driver.plate
    );
    filtered.unshift(driver);
    await AsyncStorage.setItem(LOCAL_DRIVERS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn("Could not cache driver locally:", err);
  }
}

/**
 * Check if the entered ID matches Admin format
 */
export function isAdminId(id: string): boolean {
  return id.trim() === ADMIN_SECRET_ID;
}

/**
 * Register a new Driver (Admin action)
 * Guaranteed NEVER to buffer indefinitely.
 * 1. Generates unique ID immediately.
 * 2. Caches locally so login works instantly.
 * 3. Syncs with central web backend API and Firestore in parallel with timeout protection.
 */
export async function registerNewDriver(
  input: RegisterDriverInput
): Promise<{ driverId: string; lorryId: string }> {
  const driverId = generateUniqueDriverId();
  const cleanPlate = input.plate.trim().toUpperCase();
  const lorryId = `lorry-${cleanPlate.replace(/[^A-Z0-9]/gi, "").toLowerCase() || driverId.toLowerCase()}`;

  const driverData: DriverRecord = {
    driverId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    plate: cleanPlate,
    vehicleType: input.vehicleType.trim(),
    route: input.route.trim() || "Colombo – Island-wide",
    lorryId,
    active: true,
    createdAt: Date.now(),
  };

  // 1. Immediately cache locally on device (0ms latency, zero buffering)
  await saveCachedDriver(driverData);

  // 2. Sync to central Web Backend API (/api/drivers)
  apiFetch("/api/drivers", {
    method: "POST",
    body: JSON.stringify({
      ...driverData,
      driverId,
    }),
  }).catch((e) => console.warn("API register driver sync notice:", e));

  // 3. Attempt Firestore in parallel with non-blocking timeout
  (async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 1800)
      );
      const firestorePromise = setDoc(doc(db, "drivers", driverId), driverData);
      await Promise.race([firestorePromise, timeoutPromise]);
    } catch {
      // Ignored - API and local storage handle persistence
    }
  })();

  return { driverId, lorryId };
}

/**
 * Verify driver login with their generated Driver ID or plate
 * Guaranteed fast response with zero hanging/buffering.
 */
export async function verifyDriverLogin(
  rawId: string
): Promise<DriverRecord | null> {
  const cleanId = rawId.trim().toUpperCase();
  if (!cleanId) return null;

  // 1. Check local cache first (instantaneous)
  const cachedDrivers = await getCachedDrivers();
  const localMatch = cachedDrivers.find(
    (d) =>
      d.driverId.toUpperCase() === cleanId ||
      d.plate.toUpperCase() === cleanId ||
      (d.phone && d.phone.replace(/\s+/g, "") === cleanId.replace(/\s+/g, ""))
  );

  if (localMatch) {
    return localMatch;
  }

  // 2. Query central Web Backend API (/api/drivers/[id]) with timeout
  try {
    const apiRes = await apiFetch<{ driver: DriverRecord }>(
      `/api/drivers/${encodeURIComponent(cleanId)}`
    );
    if (apiRes.success && apiRes.data?.driver) {
      await saveCachedDriver(apiRes.data.driver);
      return apiRes.data.driver;
    }
  } catch (err) {
    console.warn("API driver query notice:", err);
  }

  // 3. Firestore query with strict 1.5s timeout so it NEVER hangs
  try {
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 1500)
    );

    const firestoreQuery = async () => {
      try {
        const directDoc = await getDoc(doc(db, "drivers", cleanId));
        if (directDoc.exists()) {
          const d = directDoc.data() as DriverRecord;
          await saveCachedDriver(d);
          return d;
        }
      } catch {
        // Silently handled - API and local cache provide resilience
      }
      return null;
    };

    const result = await Promise.race([firestoreQuery(), timeoutPromise]);
    if (result) return result;
  } catch {
    // Non-blocking
  }

  return null;
}

/**
 * Fetch all registered drivers for Admin dashboard
 */
export async function getAllDrivers(): Promise<DriverRecord[]> {
  // 1. Try central API first
  try {
    const apiRes = await apiFetch<{ drivers: DriverRecord[] }>("/api/drivers");
    if (apiRes.success && Array.isArray(apiRes.data?.drivers)) {
      const list = apiRes.data.drivers;
      // Merge into local cache
      for (const d of list) {
        saveCachedDriver(d);
      }
      return list;
    }
  } catch (e) {
    console.warn("API getAllDrivers notice:", e);
  }

  // 2. Return local cached drivers (always available, never buffers)
  return getCachedDrivers();
}

/**
 * Update real-time GPS coordinates of the driver's vehicle
 * Broadcasts to central Web Server and Firestore without blocking the UI.
 */
export async function updateLorryGpsLocation(
  lorryId: string,
  lat: number,
  lng: number,
  heading: number = 0,
  speedKmH: number = 0
): Promise<void> {
  // 1. Broadcast to Central Web Platform API (/api/lorries/[id]/location)
  apiFetch(`/api/lorries/${encodeURIComponent(lorryId)}/location`, {
    method: "POST",
    body: JSON.stringify({
      lat,
      lng,
      heading,
      speedKmH,
    }),
  }).catch((e) => console.warn("API GPS sync notice:", e));

  // 2. Fire and forget to Firestore with timeout
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 1500)
    );
    const firestorePromise = setDoc(
      doc(db, "lorries", lorryId),
      {
        lat,
        lng,
        heading: Math.round(heading) || 0,
        speedKmH: Math.round(speedKmH) || 0,
        lastUpdated: "Just now",
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    await Promise.race([firestorePromise, timeoutPromise]);
  } catch {
    // Handled by central API
  }
}

/**
 * Update lorry trip status: 'empty' vs 'on_trip'
 */
export async function updateLorryTripStatus(
  lorryId: string,
  status: "empty" | "on_trip"
): Promise<void> {
  apiFetch(`/api/lorries/${encodeURIComponent(lorryId)}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  }).catch(() => {});

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 1500)
    );
    const firestorePromise = setDoc(
      doc(db, "lorries", lorryId),
      { status, lastUpdated: "Just now", updatedAt: Date.now() },
      { merge: true }
    );
    await Promise.race([firestorePromise, timeoutPromise]);
  } catch {}
}

/* ============================================================
 * ENTERPRISE ADMIN METHODS (Fleet, Bookings, Customers, etc.)
 * ============================================================ */

export interface LorryRecord {
  id: string;
  plate: string;
  route: string;
  driverName: string;
  driverId: string;
  vehicleType: string;
  lat: number;
  lng: number;
  heading: number;
  speedKmH: number;
  status: "empty" | "on_trip";
  lastUpdated: string;
  updatedAt: number;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface BookingRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupCity: string;
  deliveryCity: string;
  date: string;
  vehicleType: string;
  packageDetails?: string;
  status: "pending" | "assigned" | "in_transit" | "delivered" | "cancelled";
  assignedLorryId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  assignedPlate?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RegistrationRecord {
  id: string;
  ownerName: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  capacity: string;
  province: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

export interface InquiryRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status: "unread" | "resolved";
  createdAt: number;
}

export interface ReviewRecord {
  id: string;
  name: string;
  rating: number;
  comment: string;
  service: string;
  createdAt: number;
}

export async function getAllLorries(): Promise<LorryRecord[]> {
  try {
    const res = await apiFetch<{ lorries: LorryRecord[] }>("/api/lorries");
    if (res.success && Array.isArray(res.data?.lorries)) {
      return res.data.lorries;
    }
  } catch {}
  return [];
}

export async function addNewLorryToFleet(input: {
  plate: string;
  route: string;
  driverName?: string;
  vehicleType?: string;
}): Promise<boolean> {
  const res = await apiFetch("/api/lorries", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.success;
}

export async function deleteLorryFromFleet(id: string): Promise<boolean> {
  const res = await apiFetch(`/api/lorries?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return res.success;
}

export async function getAllCustomers(): Promise<CustomerRecord[]> {
  try {
    const res = await apiFetch<{ customers: CustomerRecord[] }>("/api/customers");
    if (res.success && Array.isArray(res.data?.customers)) {
      return res.data.customers;
    }
  } catch {}
  return [];
}

export async function getAllBookings(): Promise<BookingRecord[]> {
  try {
    const res = await apiFetch<{ bookings: BookingRecord[] }>("/api/bookings");
    if (res.success && Array.isArray(res.data?.bookings)) {
      return res.data.bookings;
    }
  } catch {}
  return [];
}

export async function updateBookingDispatch(input: {
  id: string;
  status: "pending" | "assigned" | "in_transit" | "delivered" | "cancelled";
  assignedLorryId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  assignedPlate?: string;
}): Promise<boolean> {
  const res = await apiFetch("/api/bookings", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.success;
}

export async function getAllRegistrations(): Promise<RegistrationRecord[]> {
  try {
    const res = await apiFetch<{ registrations: RegistrationRecord[] }>(
      "/api/registrations"
    );
    if (res.success && Array.isArray(res.data?.registrations)) {
      return res.data.registrations;
    }
  } catch {}
  return [];
}

export async function updateRegistrationStatus(
  id: string,
  status: "pending" | "approved" | "rejected"
): Promise<boolean> {
  const res = await apiFetch("/api/registrations", {
    method: "PATCH",
    body: JSON.stringify({ id, status }),
  });
  return res.success;
}

export async function getAllInquiries(): Promise<InquiryRecord[]> {
  try {
    const res = await apiFetch<{ inquiries: InquiryRecord[] }>("/api/inquiries");
    if (res.success && Array.isArray(res.data?.inquiries)) {
      return res.data.inquiries;
    }
  } catch {}
  return [];
}

export async function updateInquiryStatus(
  id: string,
  status: "unread" | "resolved"
): Promise<boolean> {
  const res = await apiFetch("/api/inquiries", {
    method: "PATCH",
    body: JSON.stringify({ id, status }),
  });
  return res.success;
}

export async function getAllReviews(): Promise<ReviewRecord[]> {
  try {
    const res = await apiFetch<{ reviews: ReviewRecord[] }>("/api/reviews");
    if (res.success && Array.isArray(res.data?.reviews)) {
      return res.data.reviews;
    }
  } catch {}
  return [];
}
