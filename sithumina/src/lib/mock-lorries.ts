export type LorryStatus = "empty" | "on_trip";

export interface Lorry {
  id: string;
  plate: string;
  route: string;
  driverName?: string;
  driverPhone?: string;
  driverId?: string;
  vehicleType?: string;
  lat: number;
  lng: number;
  heading?: number;
  speedKmH?: number;
  status: LorryStatus;
  lastUpdated: string;
  updatedAt?: number;
  isOnline?: boolean;
  isLive?: boolean;
  // Live trip / cargo details
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
}

// Real dynamic fleet only - all dummy/mock data removed
export const INITIAL_LORRIES: Lorry[] = [];

