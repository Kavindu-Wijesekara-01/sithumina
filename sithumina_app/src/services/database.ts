import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "../config/api";
import { db } from "../config/firebase";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

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
      const firestoreDriverPromise = setDoc(doc(db, "drivers", driverId), driverData);
      const firestoreLorryPromise = setDoc(
        doc(db, "lorries", lorryId),
        {
          id: lorryId,
          plate: cleanPlate,
          route: driverData.route,
          driverName: driverData.name,
          driverId,
          vehicleType: driverData.vehicleType,
          lat: 6.9271,
          lng: 79.8612,
          heading: 0,
          speedKmH: 0,
          status: "empty",
          lastUpdated: "Just registered",
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      await Promise.race([
        Promise.all([firestoreDriverPromise, firestoreLorryPromise]),
        timeoutPromise,
      ]);
    } catch {
      // Ignored - API and local storage handle persistence
    }
  })();

  return { driverId, lorryId };
}

/**
 * Register a Rider with a custom/specified Rider ID (Admin action)
 * Automatically syncs with local storage and Firestore so the rider can log in immediately.
 */
export async function registerCustomRider(input: {
  driverId: string;
  name: string;
  phone: string;
  nic?: string;
}): Promise<DriverRecord> {
  const cleanId = input.driverId.trim().toUpperCase();
  const cleanPlate = `WP-${cleanId.replace(/[^A-Z0-9]/g, "")}`;
  const lorryId = `lorry-${cleanId.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  const driverData: DriverRecord = {
    driverId: cleanId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    plate: cleanPlate,
    vehicleType: "Lorry Fleet",
    route: "Island-wide Fleet",
    lorryId,
    active: true,
    createdAt: Date.now(),
  };

  // 1. Immediately cache locally on device (0ms latency, login works immediately)
  await saveCachedDriver(driverData);

  // 2. Also sync to central API and Firestore with timeout
  apiFetch("/api/drivers", {
    method: "POST",
    body: JSON.stringify({
      ...driverData,
      driverId: cleanId,
    }),
  }).catch(() => {});

  (async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 1800)
      );
      const firestoreDriverPromise = setDoc(
        doc(db, "drivers", cleanId),
        driverData,
        { merge: true }
      );
      const firestoreLorryPromise = setDoc(
        doc(db, "lorries", lorryId),
        {
          id: lorryId,
          plate: cleanPlate,
          route: driverData.route,
          driverName: driverData.name,
          driverId: cleanId,
          vehicleType: driverData.vehicleType,
          lat: 6.9271,
          lng: 79.8612,
          heading: 0,
          speedKmH: 0,
          status: "empty",
          lastUpdated: "Just registered",
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      await Promise.race([
        Promise.all([firestoreDriverPromise, firestoreLorryPromise]),
        timeoutPromise,
      ]);
    } catch {
      // Ignored
    }
  })();

  return driverData;
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

  // 1b. Built-in prototype riders fallback (Only ID 1001 / R-1001)
  const DEMO_RIDERS: Record<string, { name: string; phone: string; plate: string }> = {
    "R-1001": { name: "Nuwan Perera", phone: "077 234 5678", plate: "WP LB-4521" },
    "1001": { name: "Nuwan Perera", phone: "077 234 5678", plate: "WP LB-4521" },
  };

  if (DEMO_RIDERS[cleanId]) {
    const d = DEMO_RIDERS[cleanId];
    const demoRec: DriverRecord = {
      driverId: cleanId,
      name: d.name,
      phone: d.phone,
      plate: d.plate,
      vehicleType: "Lorry Fleet",
      route: "Island-wide Fleet",
      lorryId: `lorry-${cleanId.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      active: true,
      createdAt: Date.now(),
    };
    await saveCachedDriver(demoRec);
    return demoRec;
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
  speedKmH: number = 0,
  extra?: Partial<LorryRecord>
): Promise<void> {
  const payload = {
    id: lorryId,
    lat,
    lng,
    heading: Math.round(heading) || 0,
    speedKmH: Math.round(speedKmH) || 0,
    lastUpdated: "Just now",
    updatedAt: Date.now(),
    isLive: true,
    isOnline: true,
    ...(extra || {}),
  };

  // 1. Broadcast to Central Web Platform API (/api/lorries/[id]/location)
  apiFetch(`/api/lorries/${encodeURIComponent(lorryId)}/location`, {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch((e) => console.warn("API GPS sync notice:", e));

  // 2. Fire and forget to Firestore with timeout
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 1500)
    );
    const firestorePromise = setDoc(
      doc(db, "lorries", lorryId),
      payload,
      { merge: true }
    );
    await Promise.race([firestorePromise, timeoutPromise]);
  } catch {
    // Handled by central API
  }
}

/**
 * Stop live broadcasting in Firestore for a lorry
 */
export async function stopLorryLiveBroadcasting(lorryId: string): Promise<void> {
  try {
    await setDoc(
      doc(db, "lorries", lorryId),
      {
        isLive: false,
        isOnline: false,
        lastUpdated: "Offline",
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch {}
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

export interface LiveTripDetails {
  lorryId: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  vehicleType?: string;
  plate: string;
  status: "empty" | "on_trip";
  startLocation: string;
  endLocation: string;
  travelRoute?: string;
  // If loaded
  emptyTime?: string;
  returnRoute?: string;
  finalDestination?: string;
  // If empty
  availableSpace?: string;
  availableCapacityKg?: string;
  hasFreezer?: boolean;
  hasHelper?: boolean;
  // GPS
  lat?: number;
  lng?: number;
  speedKmH?: number;
  heading?: number;
  isLive: boolean;
  isOnline?: boolean;
  updatedAt: number;
}

/**
 * Broadcast full Live Trip and Lorry availability specifications
 * Updates both the central server and Firestore real-time map.
 */
export async function updateLorryLiveTripDetails(
  trip: LiveTripDetails
): Promise<void> {
  const summaryRoute =
    trip.startLocation && trip.endLocation
      ? `${trip.startLocation} → ${trip.endLocation}`
      : trip.travelRoute || "Island-wide Fleet";

  const payload = {
    ...trip,
    id: trip.lorryId,
    route: summaryRoute,
    status: trip.status,
    isLive: true,
    isOnline: true,
    lastUpdated: "Just now",
    updatedAt: Date.now(),
  };

  // 1. Sync to central API
  apiFetch(`/api/lorries/${encodeURIComponent(trip.lorryId)}/trip`, {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch(() => {});

  // 2. Sync to Firestore with timeout protection
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 1800)
    );
    const firestorePromise = setDoc(
      doc(db, "lorries", trip.lorryId),
      payload,
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
  driverPhone?: string;
  driverId: string;
  vehicleType: string;
  lat: number;
  lng: number;
  heading: number;
  speedKmH: number;
  status: "empty" | "on_trip";
  lastUpdated: string;
  updatedAt: number;
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
  isLive?: boolean;
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

/**
 * Subscribe to all live lorries in real time via Firestore onSnapshot
 * Streams live GPS broadcasts from drivers directly to the Admin Dashboard.
 */
export function subscribeAdminLorries(
  callback: (lorries: LorryRecord[]) => void
): () => void {
  let isMounted = true;

  // Real-time Firestore onSnapshot listener
  let unsubscribeFs = () => {};
  try {
    const colRef = collection(db, "lorries");
    unsubscribeFs = onSnapshot(
      colRef,
      (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
          const list: LorryRecord[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              plate: data.plate || "WP LK-0000",
              route: data.route || "Island-wide",
              driverName: data.driverName || "Driver",
              driverPhone: data.driverPhone || data.phone || "",
              driverId: data.driverId || "",
              vehicleType: data.vehicleType || "Lorry",
              lat: Number.isFinite(Number(data.lat)) ? Number(data.lat) : 6.9271,
              lng: Number.isFinite(Number(data.lng)) ? Number(data.lng) : 79.8612,
              heading: Number(data.heading) || 0,
              speedKmH: Number(data.speedKmH) || 0,
              status: (data.status as "empty" | "on_trip") || "empty",
              lastUpdated: data.lastUpdated || "Just now",
              updatedAt: data.updatedAt || Date.now(),
              isOnline: data.isOnline ?? data.isLive ?? true,
              isLive: data.isLive ?? true,
              startLocation: data.startLocation || "",
              endLocation: data.endLocation || "",
              travelRoute: data.travelRoute || "",
              emptyTime: data.emptyTime || "",
              returnRoute: data.returnRoute || "",
              finalDestination: data.finalDestination || "",
              availableSpace: data.availableSpace || "",
              availableCapacityKg: data.availableCapacityKg || "",
              hasFreezer: !!data.hasFreezer,
              hasHelper: !!data.hasHelper,
            });
          });
          callback(list);
        }
      },
      (err) => {
        console.warn("Admin Firestore subscription notice:", err);
      }
    );
  } catch {}

  // Fallback initial API load
  getAllLorries().then((initial) => {
    if (isMounted && initial.length > 0) {
      callback(initial);
    }
  });

  return () => {
    isMounted = false;
    unsubscribeFs();
  };
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

/**
 * Real-time subscription to Customer Bookings from Firestore
 * Ensures customer bookings created on the Web Portal appear instantly in Admin Dashboard.
 */
export function subscribeAdminBookings(
  callback: (bookings: BookingRecord[]) => void
): () => void {
  let isMounted = true;

  let unsubscribeFs = () => {};
  try {
    const colRef = collection(db, "bookings");
    unsubscribeFs = onSnapshot(
      query(colRef),
      (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
          const list: BookingRecord[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              customerName: data.customerName || data.phone || "Customer",
              customerPhone: data.customerPhone || data.phone || "",
              pickupCity: data.pickupCity || data.pickup || "",
              deliveryCity: data.deliveryCity || data.destination || "",
              date: data.date || "",
              vehicleType: data.vehicleType || "14ft Lorry",
              packageDetails: data.packageDetails || data.notes || "",
              status: data.status || "pending",
              assignedLorryId: data.assignedLorryId,
              assignedDriverName: data.assignedDriverName,
              assignedDriverPhone: data.assignedDriverPhone,
              assignedPlate: data.assignedPlate || data.assignedLorryPlate,
              createdAt: data.createdAt || Date.now(),
              updatedAt: data.updatedAt || Date.now(),
            });
          });
          list.sort((a, b) => b.createdAt - a.createdAt);
          callback(list);
        }
      },
      (err) => {
        console.warn("Bookings Firestore subscription warning:", err);
      }
    );
  } catch {}

  // Fallback initial API load
  getAllBookings().then((initial) => {
    if (isMounted && initial.length > 0) {
      callback(initial);
    }
  });

  return () => {
    isMounted = false;
    unsubscribeFs();
  };
}

export async function updateBookingDispatch(input: {
  id: string;
  status: "pending" | "assigned" | "in_transit" | "delivered" | "cancelled";
  assignedLorryId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  assignedPlate?: string;
}): Promise<boolean> {
  // 1. Direct Firestore update
  try {
    const docRef = doc(db, "bookings", input.id);
    await setDoc(
      docRef,
      {
        ...input,
        assignedLorryPlate: input.assignedPlate,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("Firestore booking dispatch update notice:", e);
  }

  // 2. Notify API
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

/* ============================================================
 * VEHICLES PERSISTENCE & FIRESTORE SYNC
 * ============================================================ */

export const LOCAL_VEHICLES_KEY = "@sithumina_vehicles_cache";

export interface VehicleItem {
  plate: string;
  type: string;
  capacity: string;
  rider: string;
  status: "On trip" | "Empty";
  createdAt?: number;
}

export async function getCachedVehicles(): Promise<VehicleItem[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_VEHICLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function subscribeAdminVehicles(
  callback: (vehicles: VehicleItem[]) => void
): () => void {
  let isMounted = true;

  // 1. Immediately provide locally cached vehicles
  getCachedVehicles().then((cached) => {
    if (isMounted && cached.length > 0) {
      callback(cached);
    }
  });

  // 2. Real-time Firestore sync
  let unsubscribeFs = () => {};
  try {
    const colRef = collection(db, "lorries");
    unsubscribeFs = onSnapshot(
      colRef,
      (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
          const list: VehicleItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              plate: data.plate || d.id,
              type: data.vehicleType || "Lorry 10ft",
              capacity: data.capacity || data.availableCapacityKg ? `${data.capacity || data.availableCapacityKg}` : "3 t",
              rider: data.driverName || data.driverId || "Unassigned",
              status: data.status === "on_trip" ? "On trip" : "Empty",
              createdAt: data.createdAt || data.updatedAt || Date.now(),
            });
          });
          // Cache locally
          AsyncStorage.setItem(LOCAL_VEHICLES_KEY, JSON.stringify(list)).catch(() => {});
          callback(list);
        }
      },
      (err) => {
        console.warn("Vehicles Firestore subscription notice:", err);
      }
    );
  } catch {}

  return () => {
    isMounted = false;
    unsubscribeFs();
  };
}

export async function saveAdminVehicle(veh: VehicleItem): Promise<void> {
  const cleanPlate = veh.plate.trim().toUpperCase();
  const lorryId = `lorry-${cleanPlate.replace(/[^A-Z0-9]/gi, "").toLowerCase()}`;

  // 1. Save to local cache immediately (works offline, zero latency)
  try {
    const current = await getCachedVehicles();
    const filtered = current.filter((v) => v.plate.toUpperCase() !== cleanPlate);
    const updated = [veh, ...filtered];
    await AsyncStorage.setItem(LOCAL_VEHICLES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Vehicle local cache error:", err);
  }

  // 2. Save to Firestore
  try {
    const lorryDoc = doc(db, "lorries", lorryId);
    await setDoc(
      lorryDoc,
      {
        id: lorryId,
        plate: cleanPlate,
        vehicleType: veh.type,
        capacity: veh.capacity,
        driverName: veh.rider,
        route: "Island-wide Fleet",
        status: veh.status === "On trip" ? "on_trip" : "empty",
        lat: 6.9271,
        lng: 79.8612,
        heading: 0,
        speedKmH: 0,
        isLive: false,
        isOnline: true,
        lastUpdated: "Registered",
        updatedAt: Date.now(),
        createdAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore save vehicle notice:", err);
  }

  // 3. Sync to API if available
  apiFetch("/api/lorries", {
    method: "POST",
    body: JSON.stringify({
      plate: cleanPlate,
      route: "Island-wide Fleet",
      driverName: veh.rider,
      vehicleType: veh.type,
      capacity: veh.capacity,
    }),
  }).catch(() => {});
}

export async function deleteAdminVehicle(plate: string): Promise<void> {
  const cleanPlate = plate.trim().toUpperCase();
  const lorryId = `lorry-${cleanPlate.replace(/[^A-Z0-9]/gi, "").toLowerCase()}`;

  try {
    const current = await getCachedVehicles();
    const updated = current.filter((v) => v.plate.toUpperCase() !== cleanPlate);
    await AsyncStorage.setItem(LOCAL_VEHICLES_KEY, JSON.stringify(updated));
  } catch {}

  try {
    await deleteDoc(doc(db, "lorries", lorryId));
  } catch {}
}

/* ============================================================
 * RIDERS / DRIVERS PERSISTENCE & FIRESTORE SYNC
 * ============================================================ */

export function subscribeAdminDrivers(
  callback: (drivers: DriverRecord[]) => void
): () => void {
  let isMounted = true;

  // 1. Immediately provide locally cached drivers
  getCachedDrivers().then((cached) => {
    if (isMounted && cached.length > 0) {
      callback(cached);
    }
  });

  // 2. Real-time Firestore sync
  let unsubscribeFs = () => {};
  try {
    const colRef = collection(db, "drivers");
    unsubscribeFs = onSnapshot(
      colRef,
      (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
          const list: DriverRecord[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              driverId: data.driverId || d.id,
              name: data.name || "Driver",
              phone: data.phone || "",
              plate: data.plate || "—",
              vehicleType: data.vehicleType || "Lorry Fleet",
              route: data.route || "Island-wide",
              lorryId: data.lorryId || `lorry-${d.id.toLowerCase()}`,
              active: data.active !== false,
              createdAt: data.createdAt || Date.now(),
            });
          });
          // Cache locally
          AsyncStorage.setItem(LOCAL_DRIVERS_KEY, JSON.stringify(list)).catch(() => {});
          callback(list);
        }
      },
      (err) => {
        console.warn("Drivers Firestore subscription notice:", err);
      }
    );
  } catch {}

  return () => {
    isMounted = false;
    unsubscribeFs();
  };
}

/* ============================================================
 * BANNERS PERSISTENCE & FIRESTORE SYNC
 * ============================================================ */

export const LOCAL_BANNERS_KEY = "@sithumina_app_banners";

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  target: "all" | "riders" | "customers";
  viewMode?: "all" | "mobile" | "desktop";
  desktopImage?: string;
  mobileImage?: string;
  ctaText?: string;
  isActive: boolean;
  createdAt: number;
}

export async function getCachedBanners(): Promise<BannerItem[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_BANNERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function subscribeAdminBanners(
  callback: (banners: BannerItem[]) => void
): () => void {
  let isMounted = true;

  // 1. Immediately provide locally cached banners
  getCachedBanners().then((cached) => {
    if (isMounted && cached.length > 0) {
      callback(cached);
    }
  });

  // 2. Real-time Firestore sync
  let unsubscribeFs = () => {};
  try {
    const colRef = collection(db, "banners");
    unsubscribeFs = onSnapshot(
      colRef,
      (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
          const list: BannerItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              title: data.title || "",
              subtitle: data.subtitle || "",
              tag: data.tag || "PROMO",
              target: data.target || "all",
              viewMode: data.viewMode || "all",
              desktopImage: data.desktopImage,
              mobileImage: data.mobileImage,
              ctaText: data.ctaText || "Book Now",
              isActive: data.isActive !== false,
              createdAt: data.createdAt || Date.now(),
            });
          });
          list.sort((a, b) => b.createdAt - a.createdAt);
          AsyncStorage.setItem(LOCAL_BANNERS_KEY, JSON.stringify(list)).catch(() => {});
          callback(list);
        }
      },
      (err) => {
        console.warn("Banners Firestore subscription notice:", err);
      }
    );
  } catch {}

  return () => {
    isMounted = false;
    unsubscribeFs();
  };
}

export async function saveAdminBanner(banner: BannerItem): Promise<void> {
  // 1. Save to local cache immediately
  try {
    const current = await getCachedBanners();
    const filtered = current.filter((b) => b.id !== banner.id);
    const updated = [banner, ...filtered];
    await AsyncStorage.setItem(LOCAL_BANNERS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Banner local cache error:", err);
  }

  // 2. Save to Firestore
  try {
    const docRef = doc(db, "banners", banner.id);
    await setDoc(docRef, banner, { merge: true });
  } catch (err) {
    console.warn("Firestore save banner notice:", err);
  }
}

export async function deleteAdminBanner(id: string): Promise<void> {
  try {
    const current = await getCachedBanners();
    const updated = current.filter((b) => b.id !== id);
    await AsyncStorage.setItem(LOCAL_BANNERS_KEY, JSON.stringify(updated));
  } catch {}

  try {
    await deleteDoc(doc(db, "banners", id));
  } catch {}
}

export async function toggleAdminBanner(id: string): Promise<void> {
  try {
    const current = await getCachedBanners();
    let nextState = true;
    const updated = current.map((b) => {
      if (b.id === id) {
        nextState = !b.isActive;
        return { ...b, isActive: nextState };
      }
      return b;
    });
    await AsyncStorage.setItem(LOCAL_BANNERS_KEY, JSON.stringify(updated));

    await updateDoc(doc(db, "banners", id), {
      isActive: nextState,
      updatedAt: Date.now(),
    });
  } catch {}
}

