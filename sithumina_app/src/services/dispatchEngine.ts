import { LorryRecord } from "./database";

// Main Sri Lanka Cities Geographic Centroids
const SRI_LANKA_CITY_COORDINATES: Record<string, [number, number]> = {
  colombo: [6.9271, 79.8612],
  fort: [6.9344, 79.8428],
  peliyagoda: [6.9688, 79.8895],
  kelaniya: [6.9553, 79.9154],
  negombo: [7.2008, 79.8736],
  gampaha: [7.0917, 79.9999],
  jaela: [7.0759, 79.8916],
  katunayake: [7.1698, 79.8896],
  kandy: [7.2906, 80.6337],
  peradeniya: [7.2606, 80.5968],
  katugastota: [7.3228, 80.6212],
  galle: [6.0535, 80.221],
  matara: [5.9549, 80.555],
  hikkaduwa: [6.1415, 80.1031],
  kurunegala: [7.4863, 80.3623],
  kuliyapitiya: [7.4688, 80.0435],
  dambulla: [7.8742, 80.6511],
  sigiriya: [7.957, 80.7603],
  anuradhapura: [8.3114, 80.4037],
  polonnaruwa: [7.9403, 81.0188],
  jaffna: [9.6615, 80.0255],
  vavuniya: [8.7514, 80.4971],
  kilinochchi: [9.3803, 80.377],
  ratnapura: [6.6828, 80.4037],
  avissawella: [6.9542, 80.2045],
  badulla: [6.9934, 81.055],
  bandarawela: [6.8333, 80.9833],
  nuwaraeliya: [6.9497, 80.7891],
  trincomalee: [8.5874, 81.2152],
  batticaloa: [7.717, 81.7003],
  kalutara: [6.5854, 79.9607],
  panadura: [6.7134, 79.9074],
  moratuwa: [6.773, 79.8816],
  kaduwela: [6.9333, 79.9833],
  maharagama: [6.8485, 79.9269],
  nugegoda: [6.8649, 79.8997],
  homagama: [6.8417, 80.0033],
};

/**
 * Get geographic coordinates [lat, lng] from city name
 */
export function getCityCoordinates(cityName: string): [number, number] {
  if (!cityName) return [6.9271, 79.8612]; // Default to Colombo

  const clean = cityName.toLowerCase().replace(/[^a-z]/g, "");

  // Direct match
  if (SRI_LANKA_CITY_COORDINATES[clean]) {
    return SRI_LANKA_CITY_COORDINATES[clean];
  }

  // Partial match
  for (const [key, coords] of Object.entries(SRI_LANKA_CITY_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }

  return [6.9271, 79.8612];
}

/**
 * Calculate distance in Kilometers between two coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export interface RecommendedLorryMatch {
  lorry: LorryRecord;
  distanceKm: number;
  isAvailable: boolean;
  score: number;
  reason: string;
}

export interface RecommendationResult {
  pickupCoords: [number, number];
  bestMatch: RecommendedLorryMatch | null;
  rankedMatches: RecommendedLorryMatch[];
}

/**
 * Smart Nearest Vehicle Recommendation Algorithm
 * Matches incoming customer booking with the optimal active driver:
 * 1. Proximity: Distance in km from driver's live GPS to pickup city.
 * 2. Availability: 'empty' (Available) lorries get top priority.
 * 3. Vehicle compatibility.
 */
export function recommendBestLorriesForBooking(
  pickupCity: string,
  requiredVehicleType: string,
  activeLorries: LorryRecord[]
): RecommendationResult {
  const pickupCoords = getCityCoordinates(pickupCity);
  const [pLat, pLng] = pickupCoords;

  if (!activeLorries || activeLorries.length === 0) {
    return {
      pickupCoords,
      bestMatch: null,
      rankedMatches: [],
    };
  }

  const scoredList: RecommendedLorryMatch[] = activeLorries.map((lorry) => {
    const lat = Number.isFinite(Number(lorry.lat)) ? Number(lorry.lat) : 6.9271;
    const lng = Number.isFinite(Number(lorry.lng)) ? Number(lorry.lng) : 79.8612;
    const distanceKm = calculateDistanceKm(pLat, pLng, lat, lng);
    const isAvailable = lorry.status === "empty";

    // Scoring formula:
    // Base score: 1000 - distanceKm * 10
    let score = 1000 - distanceKm * 12;

    // Availability bonus (+300 pts)
    if (isAvailable) {
      score += 300;
    } else {
      score -= 200; // On trip penalty
    }

    // Vehicle Type Match bonus
    const reqClean = (requiredVehicleType || "").toLowerCase();
    const lTypeClean = (lorry.vehicleType || "").toLowerCase();
    if (
      reqClean &&
      (lTypeClean.includes(reqClean) || reqClean.includes(lTypeClean))
    ) {
      score += 150;
    }

    // Compose human-readable reason
    let reason = `${distanceKm} km from ${pickupCity}`;
    if (isAvailable && distanceKm <= 15) {
      reason = `🟢 Nearest Available (${distanceKm} km away)`;
    } else if (isAvailable) {
      reason = `🟡 Available in Corridor (${distanceKm} km away)`;
    } else {
      reason = `🟠 On Trip (${distanceKm} km away)`;
    }

    return {
      lorry,
      distanceKm,
      isAvailable,
      score,
      reason,
    };
  });

  // Sort descending by score (Best match first)
  scoredList.sort((a, b) => b.score - a.score);

  return {
    pickupCoords,
    bestMatch: scoredList.length > 0 ? scoredList[0] : null,
    rankedMatches: scoredList,
  };
}
