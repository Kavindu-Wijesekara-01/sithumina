export interface RiderRecord {
  name: string;
  id: string; // e.g. "R-1001"
  phone: string;
  vehicle?: string;
  status: 0 | 1; // 1: Active, 0: Offline
}

export interface VehicleRecord {
  plate: string;
  type: string; // "Lorry 10ft" | "Lorry 14ft" | "Canter" | "Lorry 20ft"
  capacity: string; // e.g. "3 t"
  rider: string;
  status: "On trip" | "Empty";
}

export interface VehicleRequestRecord {
  id: string;
  customer: string;
  from: string;
  to: string;
  load: string;
  vehicleType: string;
  status: "p" | "a" | "r"; // 'p': Pending, 'a': Approved, 'r': Rejected
}

export interface ReviewRecord {
  id: string;
  author: string;
  rating: number; // 1 to 5
  text: string;
  date: string;
}

export interface LorryRecord {
  plate: string;
  route: string;
  status: "On trip" | "Empty";
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
}

export interface RevenueMetric {
  period: "w" | "m" | "y";
  total: string;
  completedTrips: string;
  avgPerTrip: string;
  commission: string;
  chartData: Array<{ label: string; amount: number; isMax?: boolean }>;
}
