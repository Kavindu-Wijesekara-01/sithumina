import fs from "fs";
import path from "path";

export interface StoredDriver {
  id?: string;
  driverId: string;
  name: string;
  phone: string;
  plate: string;
  vehicleType: string;
  route: string;
  lorryId: string;
  active: boolean;
  createdAt: number;
}

export interface StoredLorry {
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

export interface StoredCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface StoredBooking {
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

export interface StoredRegistration {
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

export interface StoredInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status: "unread" | "resolved";
  createdAt: number;
}

export interface StoredReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  service: string;
  createdAt: number;
}

interface FleetStoreData {
  drivers: StoredDriver[];
  lorries: StoredLorry[];
  customers: StoredCustomer[];
  bookings: StoredBooking[];
  registrations: StoredRegistration[];
  inquiries: StoredInquiry[];
  reviews: StoredReview[];
}

const STORE_PATH = path.join(process.cwd(), "data", "fleet-store.json");

function readStore(): FleetStoreData {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      const initial: FleetStoreData = {
        drivers: [],
        lorries: [],
        customers: [],
        bookings: [],
        registrations: [],
        inquiries: [],
        reviews: [],
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      drivers: Array.isArray(parsed.drivers) ? parsed.drivers : [],
      lorries: Array.isArray(parsed.lorries) ? parsed.lorries : [],
      customers: Array.isArray(parsed.customers) ? parsed.customers : [],
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
      registrations: Array.isArray(parsed.registrations) ? parsed.registrations : [],
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
    };
  } catch (err) {
    console.warn("Could not read fleet-store.json, initializing default:", err);
    return {
      drivers: [],
      lorries: [],
      customers: [],
      bookings: [],
      registrations: [],
      inquiries: [],
      reviews: [],
    };
  }
}

function writeStore(data: FleetStoreData): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to fleet-store.json:", err);
  }
}

/* ============================================================
 * DRIVERS & FLEET
 * ============================================================ */

export function getAllStoredDrivers(): StoredDriver[] {
  return readStore().drivers;
}

export function getAllStoredLorries(): StoredLorry[] {
  return readStore().lorries;
}

export function generateUniqueDriverId(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ST-DRV-${randomSuffix}`;
}

export function registerDriverInStore(input: {
  name: string;
  phone: string;
  plate: string;
  vehicleType: string;
  route: string;
  driverId?: string;
}): { driver: StoredDriver; lorry: StoredLorry } {
  const store = readStore();
  const cleanPlate = input.plate.trim().toUpperCase();
  const driverId = input.driverId || generateUniqueDriverId();
  const lorryId = `lorry-${cleanPlate.replace(/[^A-Z0-9]/gi, "").toLowerCase() || driverId.toLowerCase()}`;

  const driver: StoredDriver = {
    driverId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    plate: cleanPlate,
    vehicleType: input.vehicleType.trim() || "14ft Lorry",
    route: input.route.trim() || "Colombo – Island-wide",
    lorryId,
    active: true,
    createdAt: Date.now(),
  };

  // Upsert driver
  const existingDriverIdx = store.drivers.findIndex(
    (d) => d.driverId === driverId || d.plate === cleanPlate
  );
  if (existingDriverIdx >= 0) {
    store.drivers[existingDriverIdx] = driver;
  } else {
    store.drivers.unshift(driver);
  }

  // Upsert matching lorry
  const existingLorryIdx = store.lorries.findIndex(
    (l) => l.id === lorryId || l.plate === cleanPlate
  );

  let lorry: StoredLorry;
  if (existingLorryIdx >= 0) {
    lorry = {
      ...store.lorries[existingLorryIdx],
      plate: cleanPlate,
      driverName: driver.name,
      driverId,
      vehicleType: driver.vehicleType,
      route: driver.route,
      updatedAt: Date.now(),
    };
    store.lorries[existingLorryIdx] = lorry;
  } else {
    lorry = {
      id: lorryId,
      plate: cleanPlate,
      route: driver.route,
      driverName: driver.name,
      driverId,
      vehicleType: driver.vehicleType,
      lat: 6.9271,
      lng: 79.8612,
      heading: 0,
      speedKmH: 0,
      status: "empty",
      lastUpdated: "Just registered",
      updatedAt: Date.now(),
    };
    store.lorries.unshift(lorry);
  }

  writeStore(store);
  return { driver, lorry };
}

export function updateLorryGpsInStore(
  identifier: string,
  lat: number,
  lng: number,
  heading: number = 0,
  speedKmH: number = 0
): StoredLorry | null {
  const store = readStore();
  const clean = identifier.trim().toUpperCase();

  const idx = store.lorries.findIndex(
    (l) =>
      l.id.toUpperCase() === clean ||
      l.plate.toUpperCase() === clean ||
      (l.driverId && l.driverId.toUpperCase() === clean)
  );

  if (idx === -1) {
    return null;
  }

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  store.lorries[idx].lat = Number.isFinite(parsedLat) ? parsedLat : 6.9271;
  store.lorries[idx].lng = Number.isFinite(parsedLng) ? parsedLng : 79.8612;
  store.lorries[idx].heading = Math.round(heading) || 0;
  store.lorries[idx].speedKmH = Math.round(speedKmH) || 0;
  store.lorries[idx].lastUpdated = "Just now";
  store.lorries[idx].updatedAt = Date.now();

  writeStore(store);
  return store.lorries[idx];
}

export function updateLorryStatusInStore(
  identifier: string,
  status: "empty" | "on_trip"
): StoredLorry | null {
  const store = readStore();
  const clean = identifier.trim().toUpperCase();

  const idx = store.lorries.findIndex(
    (l) =>
      l.id.toUpperCase() === clean ||
      l.plate.toUpperCase() === clean ||
      (l.driverId && l.driverId.toUpperCase() === clean)
  );

  if (idx === -1) return null;

  store.lorries[idx].status = status;
  store.lorries[idx].lastUpdated = "Just now";
  store.lorries[idx].updatedAt = Date.now();

  writeStore(store);
  return store.lorries[idx];
}

export function deleteLorryFromStore(id: string): boolean {
  const store = readStore();
  const clean = id.trim().toLowerCase();
  const initialLen = store.lorries.length;

  store.lorries = store.lorries.filter((l) => l.id.toLowerCase() !== clean);
  store.drivers = store.drivers.filter(
    (d) => d.lorryId.toLowerCase() !== clean && d.driverId.toLowerCase() !== clean
  );

  if (store.lorries.length !== initialLen) {
    writeStore(store);
    return true;
  }
  return false;
}

/* ============================================================
 * CUSTOMERS
 * ============================================================ */

export function getAllStoredCustomers(): StoredCustomer[] {
  return readStore().customers;
}

export function upsertCustomerInStore(input: {
  name: string;
  phone: string;
  email?: string;
  city?: string;
}): StoredCustomer {
  const store = readStore();
  const cleanPhone = input.phone.trim().replace(/\s+/g, "");
  const id = `CUST-${cleanPhone}`;

  const existingIdx = store.customers.findIndex(
    (c) => c.phone.replace(/\s+/g, "") === cleanPhone || c.id === id
  );

  const customer: StoredCustomer = {
    id,
    name: input.name.trim() || "Customer",
    phone: input.phone.trim(),
    email: input.email?.trim() || "",
    city: input.city?.trim() || "",
    createdAt: existingIdx >= 0 ? store.customers[existingIdx].createdAt : Date.now(),
    lastLoginAt: Date.now(),
  };

  if (existingIdx >= 0) {
    store.customers[existingIdx] = customer;
  } else {
    store.customers.unshift(customer);
  }

  writeStore(store);
  return customer;
}

/* ============================================================
 * BOOKINGS
 * ============================================================ */

export function getAllStoredBookings(): StoredBooking[] {
  return readStore().bookings;
}

export function getBookingsByCustomerPhone(phone: string): StoredBooking[] {
  const cleanPhone = phone.trim().replace(/\s+/g, "");
  return readStore().bookings.filter(
    (b) => b.customerPhone.replace(/\s+/g, "") === cleanPhone
  );
}

export function createBookingInStore(input: {
  customerName: string;
  customerPhone: string;
  pickupCity: string;
  deliveryCity: string;
  date: string;
  vehicleType: string;
  packageDetails?: string;
}): StoredBooking {
  const store = readStore();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `ST-BK-${randomSuffix}`;

  const booking: StoredBooking = {
    id,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    pickupCity: input.pickupCity.trim(),
    deliveryCity: input.deliveryCity.trim(),
    date: input.date.trim() || new Date().toISOString().split("T")[0],
    vehicleType: input.vehicleType.trim(),
    packageDetails: input.packageDetails?.trim() || "",
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  store.bookings.unshift(booking);

  // Auto-record customer in customer store
  upsertCustomerInStore({
    name: booking.customerName,
    phone: booking.customerPhone,
  });

  writeStore(store);
  return booking;
}

export function updateBookingStatusInStore(
  id: string,
  status: "pending" | "assigned" | "in_transit" | "delivered" | "cancelled",
  assignment?: {
    assignedLorryId?: string;
    assignedDriverName?: string;
    assignedDriverPhone?: string;
    assignedPlate?: string;
  }
): StoredBooking | null {
  const store = readStore();
  const idx = store.bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  store.bookings[idx].status = status;
  store.bookings[idx].updatedAt = Date.now();

  if (assignment) {
    if (assignment.assignedLorryId) {
      store.bookings[idx].assignedLorryId = assignment.assignedLorryId;
    }
    if (assignment.assignedDriverName) {
      store.bookings[idx].assignedDriverName = assignment.assignedDriverName;
    }
    if (assignment.assignedDriverPhone) {
      store.bookings[idx].assignedDriverPhone = assignment.assignedDriverPhone;
    }
    if (assignment.assignedPlate) {
      store.bookings[idx].assignedPlate = assignment.assignedPlate;
    }
  }

  writeStore(store);
  return store.bookings[idx];
}

/* ============================================================
 * VEHICLE REGISTRATIONS / PARTNER APPLICATIONS
 * ============================================================ */

export function getAllStoredRegistrations(): StoredRegistration[] {
  return readStore().registrations;
}

export function addRegistrationInStore(input: {
  ownerName: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  capacity: string;
  province: string;
}): StoredRegistration {
  const store = readStore();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `ST-REG-${randomSuffix}`;

  const reg: StoredRegistration = {
    id,
    ownerName: input.ownerName.trim(),
    phone: input.phone.trim(),
    vehicleNumber: input.vehicleNumber.trim().toUpperCase(),
    vehicleType: input.vehicleType.trim(),
    capacity: input.capacity.trim(),
    province: input.province.trim(),
    status: "pending",
    createdAt: Date.now(),
  };

  store.registrations.unshift(reg);
  writeStore(store);
  return reg;
}

export function updateRegistrationStatusInStore(
  id: string,
  status: "pending" | "approved" | "rejected"
): StoredRegistration | null {
  const store = readStore();
  const idx = store.registrations.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  store.registrations[idx].status = status;
  writeStore(store);
  return store.registrations[idx];
}

/* ============================================================
 * INQUIRIES & REVIEWS
 * ============================================================ */

export function getAllStoredInquiries(): StoredInquiry[] {
  return readStore().inquiries;
}

export function addInquiryInStore(input: {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
}): StoredInquiry {
  const store = readStore();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `ST-INQ-${randomSuffix}`;

  const inq: StoredInquiry = {
    id,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || "",
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: "unread",
    createdAt: Date.now(),
  };

  store.inquiries.unshift(inq);
  writeStore(store);
  return inq;
}

export function updateInquiryStatusInStore(
  id: string,
  status: "unread" | "resolved"
): StoredInquiry | null {
  const store = readStore();
  const idx = store.inquiries.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  store.inquiries[idx].status = status;
  writeStore(store);
  return store.inquiries[idx];
}

export function getAllStoredReviews(): StoredReview[] {
  return readStore().reviews;
}

export function addReviewInStore(input: {
  name: string;
  rating: number;
  comment: string;
  service: string;
}): StoredReview {
  const store = readStore();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `ST-REV-${randomSuffix}`;

  const rev: StoredReview = {
    id,
    name: input.name.trim(),
    rating: Math.max(1, Math.min(5, Math.round(input.rating))),
    comment: input.comment.trim(),
    service: input.service.trim() || "Island-wide Transport",
    createdAt: Date.now(),
  };

  store.reviews.unshift(rev);
  writeStore(store);
  return rev;
}
