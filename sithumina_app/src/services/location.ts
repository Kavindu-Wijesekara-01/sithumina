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
 * Start continuous GPS position streaming
 * Calls callback whenever location changes (every 5 meters or 5 seconds)
 */
export async function startGpsTracking(
  onLocationUpdate: LocationCallback
): Promise<boolean> {
  try {
    const hasPermission = await requestGpsPermissions();
    if (!hasPermission) return false;

    // Stop any existing tracking first
    stopGpsTracking();

    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 4000, // every 4 seconds
        distanceInterval: 5, // or every 5 meters
      },
      (loc) => {
        onLocationUpdate({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          heading: loc.coords.heading ?? 0,
          speed: loc.coords.speed ? Math.max(0, loc.coords.speed * 3.6) : 0,
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
