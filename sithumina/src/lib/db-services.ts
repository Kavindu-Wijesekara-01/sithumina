import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { Lorry, LorryStatus } from "./mock-lorries";
import { StoredBooking } from "./server-store";

/* ============================================================
 * LORRIES / FLEET SERVICE
 * ============================================================ */

const LORRIES_COL = "lorries";

/**
 * Disabled dummy seeding - only real registered drivers appear
 */
export async function seedInitialLorriesIfEmpty(): Promise<boolean> {
  return false;
}

/**
 * Subscribe to live lorries in real time.
 * Uses Firebase Firestore onSnapshot as the primary zero-cost real-time streaming channel,
 * with a single initial fallback check to Next.js API.
 */
export function subscribeLorries(
  callback: (lorries: Lorry[]) => void,
  onError?: (error: Error) => void
): () => void {
  let isMounted = true;

  // Single fallback fetch for local offline dev
  const fetchLiveLorriesFallback = async () => {
    try {
      const res = await fetch("/api/lorries", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (isMounted && Array.isArray(data.lorries) && data.lorries.length > 0) {
          callback(data.lorries);
        }
      }
    } catch (err: unknown) {
      if (onError && isMounted) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };

  // Primary: Firestore onSnapshot real-time WebSocket listener (Zero Vercel Function Invocations)
  let unsubscribeFirestore = () => {};
  try {
    const colRef = collection(db, LORRIES_COL);
    unsubscribeFirestore = onSnapshot(
      colRef,
      (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
          const items: Lorry[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const summaryRoute =
              data.route ||
              (data.startLocation && data.endLocation
                ? `${data.startLocation} → ${data.endLocation}`
                : "Island-wide Fleet");

            items.push({
              id: docSnap.id,
              plate: data.plate || "WP LK-0000",
              route: summaryRoute,
              driverName: data.driverName || "Driver",
              driverPhone: data.driverPhone || data.phone || "",
              driverId: data.driverId || "",
              vehicleType: data.vehicleType || "Lorry",
              lat: Number.isFinite(Number(data.lat)) ? Number(data.lat) : 6.9271,
              lng: Number.isFinite(Number(data.lng)) ? Number(data.lng) : 79.8612,
              heading: Number(data.heading) || 0,
              speedKmH: Number(data.speedKmH) || 0,
              status: (data.status as LorryStatus) || "empty",
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
          callback(items);
        } else {
          // If Firestore collection has no items yet, check fallback store once
          fetchLiveLorriesFallback();
        }
      },
      (err) => {
        console.warn("Firestore snapshot error, falling back:", err);
        fetchLiveLorriesFallback();
      }
    );
  } catch {
    fetchLiveLorriesFallback();
  }

  return () => {
    isMounted = false;
    unsubscribeFirestore();
  };
}

/**
 * Update lorry status ("empty" vs "on_trip")
 */
export async function updateLorryStatus(
  lorryId: string,
  status: LorryStatus
): Promise<void> {
  // 1. Update central API
  try {
    await fetch(`/api/lorries/${encodeURIComponent(lorryId)}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  } catch (e) {
    console.warn("API status update warning:", e);
  }

  // 2. Update Firestore if accessible
  try {
    const docRef = doc(db, LORRIES_COL, lorryId);
    await updateDoc(docRef, {
      status,
      lastUpdated: "Just now",
      updatedAt: Date.now(),
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Update lorry GPS location & heading/speed in real time
 */
export async function updateLorryLocation(
  lorryId: string,
  lat: number,
  lng: number,
  heading: number = 0,
  speedKmH: number = 0
): Promise<void> {
  // 1. Update central API
  try {
    await fetch(`/api/lorries/${encodeURIComponent(lorryId)}/location`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng, heading, speedKmH }),
    });
  } catch (e) {
    console.warn("API location update warning:", e);
  }

  // 2. Update Firestore if accessible
  try {
    const docRef = doc(db, LORRIES_COL, lorryId);
    await updateDoc(docRef, {
      lat,
      lng,
      heading,
      speedKmH,
      lastUpdated: "Just now",
      updatedAt: Date.now(),
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Add a new lorry directly to Fleet
 */
export async function addNewLorry(lorry: Omit<Lorry, "id">): Promise<string> {
  const lorryId = `lorry-${lorry.plate.replace(/[^A-Z0-9]/gi, "").toLowerCase()}`;

  // 1. Direct to Firestore first
  try {
    const docRef = doc(db, LORRIES_COL, lorryId);
    await setDoc(
      docRef,
      {
        ...lorry,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("Firestore add lorry warning:", e);
  }

  // 2. Also notify API
  try {
    const res = await fetch("/api/lorries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lorry),
    });
    const data = await res.json();
    return data.lorry?.id || lorryId;
  } catch (e) {
    console.warn("API add lorry notice:", e);
    return lorryId;
  }
}

/**
 * Delete a lorry from Fleet
 */
export async function deleteLorry(lorryId: string): Promise<void> {
  try {
    const docRef = doc(db, LORRIES_COL, lorryId);
    await deleteDoc(docRef);
  } catch {}

  try {
    await fetch(`/api/lorries?id=${encodeURIComponent(lorryId)}`, {
      method: "DELETE",
    });
  } catch (e) {
    console.warn("API delete lorry warning:", e);
  }
}

/* ============================================================
 * BOOKINGS SERVICE
 * ============================================================ */

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface Booking {
  id: string;
  trackingId: string;
  pickup: string;
  destination: string;
  vehicleType: string;
  weight?: string;
  date: string;
  phone: string;
  notes?: string;
  status: BookingStatus;
  assignedLorryPlate?: string;
  createdAt: number;
}

export type BookingInput = Omit<Booking, "id" | "trackingId" | "createdAt" | "status">;

const BOOKINGS_COL = "bookings";

export function generateTrackingId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ST-2026-${rand}`;
}

/**
 * Create a new freight booking in Firestore
 */
export async function createBooking(
  input: BookingInput
): Promise<{ id: string; trackingId: string }> {
  const trackingId = generateTrackingId();

  // 1. Direct to Firestore first
  let bookingId = trackingId;
  try {
    const colRef = collection(db, BOOKINGS_COL);
    const docRef = await addDoc(colRef, {
      ...input,
      trackingId,
      status: "pending" as BookingStatus,
      createdAt: Date.now(),
    });
    bookingId = docRef.id;
  } catch (err) {
    console.warn("Firestore create booking notice:", err);
  }

  // 2. Post to Central Shared API (/api/bookings)
  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: input.phone || "Customer",
        customerPhone: input.phone,
        pickupCity: input.pickup,
        deliveryCity: input.destination,
        date: input.date,
        vehicleType: input.vehicleType,
        packageDetails: input.notes,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.booking?.id) {
        return { id: data.booking.id, trackingId: data.booking.id };
      }
    }
  } catch (err) {
    console.warn("API create booking notice:", err);
  }

  return { id: bookingId, trackingId };
}

/**
 * Subscribe to all bookings in real time (for Admin / Dispatch manager)
 * Uses Firestore onSnapshot stream with single fallback fetch (Zero polling loops)
 */
export function subscribeBookings(
  callback: (bookings: Booking[]) => void
): () => void {
  let isMounted = true;

  // Single fallback fetch for local offline dev
  const fetchBookingsApiFallback = async () => {
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      if (res.ok && isMounted) {
        const data = await res.json();
        if (Array.isArray(data.bookings) && data.bookings.length > 0) {
          const mapped: Booking[] = data.bookings.map((b: StoredBooking) => ({
            id: b.id,
            trackingId: b.id,
            pickup: b.pickupCity || "",
            destination: b.deliveryCity || "",
            vehicleType: b.vehicleType || "14ft",
            date: b.date || "",
            phone: b.customerPhone || "",
            notes: b.packageDetails || "",
            status: (b.status as BookingStatus) || "pending",
            assignedLorryPlate: b.assignedPlate,
            createdAt: b.createdAt || Date.now(),
          }));
          callback(mapped);
        }
      }
    } catch {
      // Non-blocking
    }
  };

  // Primary: Firestore onSnapshot
  let unsubFs = () => {};
  try {
    const colRef = collection(db, BOOKINGS_COL);
    unsubFs = onSnapshot(
      query(colRef, orderBy("createdAt", "desc")),
      (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
          const items: Booking[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            items.push({
              id: d.id,
              trackingId: data.trackingId || d.id.slice(0, 8).toUpperCase(),
              pickup: data.pickup || "",
              destination: data.destination || "",
              vehicleType: data.vehicleType || "14ft",
              weight: data.weight || "",
              date: data.date || "",
              phone: data.phone || "",
              notes: data.notes || "",
              status: (data.status as BookingStatus) || "pending",
              assignedLorryPlate: data.assignedLorryPlate,
              createdAt: data.createdAt || Date.now(),
            });
          });
          callback(items);
        } else {
          fetchBookingsApiFallback();
        }
      },
      () => {
        fetchBookingsApiFallback();
      }
    );
  } catch {
    fetchBookingsApiFallback();
  }

  return () => {
    isMounted = false;
    unsubFs();
  };
}

/**
 * Get booking by Tracking ID (e.g. "ST-2026-4821") or Phone number
 */
export async function findBookingByTrackingOrPhone(
  queryStr: string
): Promise<Booking[]> {
  const clean = queryStr.trim().replace(/\s+/g, "");

  // 1. Query API
  try {
    const res = await fetch(`/api/bookings?phone=${encodeURIComponent(clean)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.bookings) && data.bookings.length > 0) {
        return data.bookings.map((b: StoredBooking) => ({
          id: b.id,
          trackingId: b.id,
          pickup: b.pickupCity,
          destination: b.deliveryCity,
          vehicleType: b.vehicleType,
          date: b.date,
          phone: b.customerPhone,
          notes: b.packageDetails,
          status: b.status as BookingStatus,
          assignedLorryPlate: b.assignedPlate,
          createdAt: b.createdAt,
        }));
      }
    }
  } catch {}

  // 2. Query Firestore fallback
  try {
    const colRef = collection(db, BOOKINGS_COL);
    const snap = await getDocs(colRef);
    const matches: Booking[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (
        (data.trackingId && data.trackingId.toUpperCase() === clean.toUpperCase()) ||
        (data.phone && data.phone.replace(/\s+/g, "").includes(clean))
      ) {
        matches.push({
          id: d.id,
          trackingId: data.trackingId || d.id.slice(0, 8),
          pickup: data.pickup || "",
          destination: data.destination || "",
          vehicleType: data.vehicleType || "14ft",
          weight: data.weight || "",
          date: data.date || "",
          phone: data.phone || "",
          notes: data.notes || "",
          status: (data.status as BookingStatus) || "pending",
          assignedLorryPlate: data.assignedLorryPlate,
          createdAt: data.createdAt || Date.now(),
        });
      }
    });
    return matches;
  } catch {
    return [];
  }
}

/**
 * Update booking status or assign lorry
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  assignedLorryPlate?: string
): Promise<void> {
  const docRef = doc(db, BOOKINGS_COL, bookingId);
  const updates: Record<string, unknown> = { status, updatedAt: Date.now() };
  if (assignedLorryPlate !== undefined) {
    updates.assignedLorryPlate = assignedLorryPlate;
  }
  await updateDoc(docRef, updates);
}

/* ============================================================
 * VEHICLE REGISTRATION SERVICE (Partner Lorry Owners)
 * ============================================================ */

export interface VehicleRegistration {
  id: string;
  ownerName: string;
  phone: string;
  plateNumber: string;
  vehicleType: string;
  baseCity: string;
  driverCount: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

export type VehicleRegistrationInput = Omit<
  VehicleRegistration,
  "id" | "status" | "createdAt"
>;

const REGISTRATIONS_COL = "vehicle_registrations";

export async function createVehicleRegistration(
  input: VehicleRegistrationInput
): Promise<string> {
  const colRef = collection(db, REGISTRATIONS_COL);
  const docRef = await addDoc(colRef, {
    ...input,
    status: "pending",
    createdAt: Date.now(),
  });
  return docRef.id;
}

export function subscribeVehicleRegistrations(
  callback: (regs: VehicleRegistration[]) => void
): () => void {
  const colRef = collection(db, REGISTRATIONS_COL);
  return onSnapshot(
    query(colRef, orderBy("createdAt", "desc")),
    (snapshot) => {
      const items: VehicleRegistration[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          ownerName: data.ownerName || "",
          phone: data.phone || "",
          plateNumber: data.plateNumber || "",
          vehicleType: data.vehicleType || "14ft",
          baseCity: data.baseCity || "",
          driverCount: data.driverCount || "1",
          status: data.status || "pending",
          createdAt: data.createdAt || Date.now(),
        });
      });
      callback(items);
    },
    (err) => {
      console.warn("Error subscribing to registrations:", err);
    }
  );
}

export async function updateRegistrationStatus(
  regId: string,
  status: "pending" | "approved" | "rejected"
): Promise<void> {
  const docRef = doc(db, REGISTRATIONS_COL, regId);
  await updateDoc(docRef, { status, updatedAt: Date.now() });
}

/**
 * Approve registration and immediately add it to the live fleet on the map
 */
export async function approveAndAddToFleet(
  reg: VehicleRegistration,
  lat: number = 6.9271,
  lng: number = 79.8612
): Promise<void> {
  await updateRegistrationStatus(reg.id, "approved");
  await addNewLorry({
    plate: reg.plateNumber,
    route: `${reg.baseCity} – Island-wide`,
    driverName: reg.ownerName,
    vehicleType: reg.vehicleType,
    lat,
    lng,
    heading: 0,
    speedKmH: 0,
    status: "empty",
    lastUpdated: "Just now",
  });
}

/* ============================================================
 * CUSTOMER REVIEWS SERVICE
 * ============================================================ */

export interface Review {
  id: string;
  name: string;
  role: string;
  stars: number;
  route: string;
  commentEn: string;
  commentSi: string;
  date: string;
  createdAt: number;
}

export type ReviewInput = Omit<Review, "id" | "createdAt">;

const REVIEWS_COL = "reviews";

const INITIAL_REVIEWS_SEED: Omit<Review, "id">[] = [
  {
    name: "Dinesh Bandara",
    role: "Hardware Store Owner",
    stars: 5,
    route: "Colombo – Kandy",
    commentEn:
      "Saved over 30% by catching an empty returning lorry from Colombo harbour. Driver was punctual and goods arrived without a single scratch.",
    commentSi:
      "කොළඹ වරායෙන් ආපසු එන හිස් ලොරියක් ලැබීම නිසා විශාල මුදලක් ඉතිරි විය. රියදුරු නියමිත වේලාවට පැමිණියේය.",
    date: "2 days ago",
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    name: "Priyantha Jayawardena",
    role: "Vegetable Wholesaler",
    stars: 5,
    route: "Dambulla – Galle",
    commentEn:
      "The live GPS map is a game changer. I could monitor the exact location of the truck carrying fresh produce down the southern expressway.",
    commentSi:
      "සජීවී GPS සිතියම නිසා වාහනය ඇති ස්ථානය ඕනෑම වේලාවක බලාගැනීමට හැකි වීම ඉතා ප්‍රයෝජනවත්ය.",
    date: "1 week ago",
    createdAt: Date.now() - 7 * 86400000,
  },
  {
    name: "Kamani Wickramasinghe",
    role: "Home Relocation Client",
    stars: 5,
    route: "Kurunegala – Gampaha",
    commentEn:
      "Booked an individual 14ft vehicle for house moving. Very professional driver and friendly customer care on the hotline.",
    commentSi:
      "ගෙවල් මාරු කිරීම සඳහා අඩි 14 ලොරියක් වෙන්කරවා ගත්තෙමි. ඉතා සුහදශීලී සහ විශ්වාසදායක සේවාවක්.",
    date: "2 weeks ago",
    createdAt: Date.now() - 14 * 86400000,
  },
];

export async function seedInitialReviewsIfEmpty(): Promise<boolean> {
  try {
    const colRef = collection(db, REVIEWS_COL);
    const snap = await getDocs(query(colRef, limit(1)));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const rev of INITIAL_REVIEWS_SEED) {
        const docRef = doc(colRef);
        batch.set(docRef, rev);
      }
      await batch.commit();
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Could not seed reviews:", err);
    return false;
  }
}

export function subscribeReviews(callback: (reviews: Review[]) => void): () => void {
  const colRef = collection(db, REVIEWS_COL);
  return onSnapshot(
    query(colRef, orderBy("createdAt", "desc")),
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialReviewsIfEmpty();
        callback(
          INITIAL_REVIEWS_SEED.map((r, i) => ({ ...r, id: `rev-init-${i}` }))
        );
        return;
      }
      const items: Review[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          name: data.name || "Customer",
          role: data.role || "Client",
          stars: data.stars || 5,
          route: data.route || "Sri Lanka",
          commentEn: data.commentEn || "",
          commentSi: data.commentSi || data.commentEn || "",
          date: data.date || "Recently",
          createdAt: data.createdAt || Date.now(),
        });
      });
      callback(items);
    },
    (err) => {
      console.warn("Reviews subscription error:", err);
      callback(INITIAL_REVIEWS_SEED.map((r, i) => ({ ...r, id: `rev-init-${i}` })));
    }
  );
}

export async function createReview(input: ReviewInput): Promise<string> {
  const colRef = collection(db, REVIEWS_COL);
  const docRef = await addDoc(colRef, {
    ...input,
    createdAt: Date.now(),
  });
  return docRef.id;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const docRef = doc(db, REVIEWS_COL, reviewId);
  await deleteDoc(docRef);
}

/* ============================================================
 * CONTACT INQUIRIES SERVICE
 * ============================================================ */

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  type: "quote" | "support" | "general";
  createdAt: number;
  status: "unread" | "resolved";
}

export type InquiryInput = Omit<Inquiry, "id" | "createdAt" | "status">;

const INQUIRIES_COL = "inquiries";

export async function createInquiry(input: InquiryInput): Promise<string> {
  const colRef = collection(db, INQUIRIES_COL);
  const docRef = await addDoc(colRef, {
    ...input,
    status: "unread",
    createdAt: Date.now(),
  });
  return docRef.id;
}

export function subscribeInquiries(
  callback: (inquiries: Inquiry[]) => void
): () => void {
  const colRef = collection(db, INQUIRIES_COL);
  return onSnapshot(
    query(colRef, orderBy("createdAt", "desc")),
    (snapshot) => {
      const items: Inquiry[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          name: data.name || "",
          phone: data.phone || "",
          message: data.message || "",
          type: data.type || "general",
          createdAt: data.createdAt || Date.now(),
          status: data.status || "unread",
        });
      });
      callback(items);
    },
    (err) => {
      console.warn("Inquiries subscription error:", err);
    }
  );
}
