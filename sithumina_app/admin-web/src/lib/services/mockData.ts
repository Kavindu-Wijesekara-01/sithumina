import {
  RiderRecord,
  VehicleRecord,
  VehicleRequestRecord,
  ReviewRecord,
  LorryRecord,
  RevenueMetric,
} from "./types";

export const INITIAL_RIDERS: RiderRecord[] = [
  { name: "Nuwan Perera", id: "R-1001", phone: "077 234 5678", vehicle: "WP LB-4521", status: 1 },
];

export const INITIAL_VEHICLES: VehicleRecord[] = [
  { plate: "WP LB-4521", type: "Lorry 10ft", capacity: "3 t", rider: "Nuwan Perera", status: "Empty" },
];

export const INITIAL_REQUESTS: VehicleRequestRecord[] = [];

export const INITIAL_REVIEWS: ReviewRecord[] = [];

// Lorries appear only when a rider starts live broadcasting
export const INITIAL_LORRIES: LorryRecord[] = [];

export const REVENUE_METRICS: Record<"w" | "m" | "y", RevenueMetric> = {
  w: {
    period: "w",
    total: "LKR 0",
    completedTrips: "0",
    avgPerTrip: "LKR 0",
    commission: "LKR 0",
    chartData: [
      { label: "Mon", amount: 0 },
      { label: "Tue", amount: 0 },
      { label: "Wed", amount: 0 },
      { label: "Thu", amount: 0 },
      { label: "Fri", amount: 0 },
      { label: "Sat", amount: 0, isMax: true },
      { label: "Sun", amount: 0 },
    ],
  },
  m: {
    period: "m",
    total: "LKR 0",
    completedTrips: "0",
    avgPerTrip: "LKR 0",
    commission: "LKR 0",
    chartData: [
      { label: "W1", amount: 0 },
      { label: "W2", amount: 0 },
      { label: "W3", amount: 0 },
      { label: "W4", amount: 0, isMax: true },
    ],
  },
  y: {
    period: "y",
    total: "LKR 0",
    completedTrips: "0",
    avgPerTrip: "LKR 0",
    commission: "LKR 0",
    chartData: [
      { label: "J", amount: 0 },
      { label: "F", amount: 0 },
      { label: "M", amount: 0 },
      { label: "A", amount: 0 },
      { label: "M", amount: 0 },
      { label: "J", amount: 0 },
      { label: "J", amount: 0 },
      { label: "A", amount: 0 },
      { label: "S", amount: 0 },
      { label: "O", amount: 0, isMax: true },
      { label: "N", amount: 0 },
      { label: "D", amount: 0 },
    ],
  },
};
