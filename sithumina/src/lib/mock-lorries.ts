export type LorryStatus = "empty" | "on_trip";

export interface Lorry {
  id: string;
  plate: string;
  route: string;
  driverName?: string;
  driverId?: string;
  vehicleType?: string;
  lat: number;
  lng: number;
  heading?: number;
  speedKmH?: number;
  status: LorryStatus;
  lastUpdated: string;
}

// Real dynamic fleet only - all dummy/mock data removed
export const INITIAL_LORRIES: Lorry[] = [];
