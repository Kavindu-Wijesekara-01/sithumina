import * as Location from "expo-location";

export interface GpsCoordinate {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  accuracy: number | null;
  timestamp: number;
}

export type LocationCallback = (coord: GpsCoordinate) => void;

let locationSubscription: Location.LocationSubscription | null = null;

/**
 * Request GPS Location permissions (Foreground & optionally Background)
 */
export async function requestGpsPermissions(): Promise<boolean> {
  try {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== "granted") {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error requesting GPS permissions:", error);
    return false;
  }
}

/**
 * Get current one-off GPS coordinate
 */
export async function getCurrentGpsPosition(): Promise<GpsCoordinate | null> {
  try {
    const hasPermission = await requestGpsPermissions();
    if (!hasPermission) return null;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      heading: loc.coords.heading ?? 0,
      // speed is returned in m/s; convert to km/h (1 m/s = 3.6 km/h)
      speed: loc.coords.speed ? Math.max(0, loc.coords.speed * 3.6) : 0,
      accuracy: loc.coords.accuracy,
      timestamp: loc.timestamp,
    };
  } catch (error) {
    console.warn("Error getting current GPS position:", error);
    return null;
  }
}

/**
 * Calculate approximate distance in meters between two GPS coordinates
 */
function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

let lastSentCoordinate: { lat: number; lng: number; time: number } | null = null;

/**
 * Start continuous GPS position streaming with smart debouncing
 * Only transmits updates when the vehicle actually moves (>= 15m) or after a heartbeat (every 30s)
 */
export async function startGpsTracking(
  onLocationUpdate: LocationCallback
): Promise<boolean> {
  try {
    const hasPermission = await requestGpsPermissions();
    if (!hasPermission) return false;

    // Stop any existing tracking first
    stopGpsTracking();
    lastSentCoordinate = null;

    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 8000, // sample every 8 seconds
        distanceInterval: 15, // or minimum 15 meters
      },
      (loc) => {
        const lat = loc.coords.latitude;
        const lng = loc.coords.longitude;
        const now = Date.now();
        const speedKmH = loc.coords.speed ? Math.max(0, loc.coords.speed * 3.6) : 0;

        // Debounce stationary vehicles to prevent burning quota
        if (lastSentCoordinate) {
          const distMeters = calculateDistanceMeters(
            lastSentCoordinate.lat,
            lastSentCoordinate.lng,
            lat,
            lng
          );
          const elapsedSec = (now - lastSentCoordinate.time) / 1000;

          // If vehicle has not moved at least 15m and speed is 0, skip sending unless 30s heartbeat reached
          if (distMeters < 15 && speedKmH < 3 && elapsedSec < 30) {
            return;
          }
        }

        lastSentCoordinate = { lat, lng, time: now };

        onLocationUpdate({
          latitude: lat,
          longitude: lng,
          heading: loc.coords.heading ?? 0,
          speed: speedKmH,
          accuracy: loc.coords.accuracy,
          timestamp: loc.timestamp,
        });
      }
    );

    return true;
  } catch (error) {
    console.error("Error starting GPS tracking:", error);
    return false;
  }
}

/**
 * Stop active GPS position tracking
 */
export function stopGpsTracking(): void {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
}
