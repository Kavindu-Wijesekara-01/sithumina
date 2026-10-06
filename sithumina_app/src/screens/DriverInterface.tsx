import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import {
  DriverRecord,
  updateLorryGpsLocation,
  updateLorryTripStatus,
} from "../services/database";
import {
  startGpsTracking,
  stopGpsTracking,
  getCurrentGpsPosition,
  GpsCoordinate,
} from "../services/location";

interface DriverInterfaceProps {
  driver: DriverRecord;
  onLogout: () => void;
}

export const DriverInterface: React.FC<DriverInterfaceProps> = ({
  driver,
  onLogout,
}) => {
  // GPS State
  const [isTracking, setIsTracking] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<GpsCoordinate | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Not yet synced");
  const [syncCount, setSyncCount] = useState(0);
  const [syncingNow, setSyncingNow] = useState(false);
  const [tripStatus, setTripStatus] = useState<"empty" | "on_trip">("empty");

  const driverRef = useRef(driver);
  driverRef.current = driver;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopGpsTracking();
    };
  }, []);

  // Handle live GPS updates sent to Firestore
  const handleLocationUpdate = async (coord: GpsCoordinate) => {
    setCurrentCoords(coord);
    try {
      await updateLorryGpsLocation(
        driverRef.current.lorryId,
        coord.latitude,
        coord.longitude,
        coord.heading,
        coord.speed
      );
      setSyncCount((prev) => prev + 1);
      const timeStr = new Date().toLocaleTimeString();
      setLastSyncTime(timeStr);
    } catch (err) {
      console.warn("Failed to stream GPS to Firestore:", err);
    }
  };

  // Toggle Tracking On / Off
  const toggleTracking = async () => {
    if (isTracking) {
      stopGpsTracking();
      setIsTracking(false);
    } else {
      setSyncingNow(true);
      const started = await startGpsTracking(handleLocationUpdate);
      setSyncingNow(false);

      if (started) {
        setIsTracking(true);
      } else {
        Alert.alert(
          "Permission Required",
          "Please grant Location / GPS permission in device settings to enable live tracking."
        );
      }
    }
  };

  // One-off Manual Location Ping
  const handleManualPing = async () => {
    setSyncingNow(true);
    const pos = await getCurrentGpsPosition();
    if (pos) {
      await handleLocationUpdate(pos);
      Alert.alert("GPS Ping Sent", `Location synced successfully!\nLat: ${pos.latitude.toFixed(4)}, Lng: ${pos.longitude.toFixed(4)}`);
    } else {
      Alert.alert("GPS Error", "Could not fetch current coordinates. Check device GPS settings.");
    }
    setSyncingNow(false);
  };

  // Toggle Lorry Trip Status
  const handleToggleTripStatus = async (newStatus: "empty" | "on_trip") => {
    try {
      setTripStatus(newStatus);
      await updateLorryTripStatus(driver.lorryId, newStatus);
    } catch (err: any) {
      Alert.alert("Status Update Error", err?.message || "Failed to update trip status.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Driver Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.badgeRow}>
            <View style={styles.driverBadge}>
              <Text style={styles.driverBadgeText}>🚚 DRIVER ON DUTY</Text>
            </View>
            <View
              style={[
                styles.liveDot,
                isTracking ? styles.dotLive : styles.dotOffline,
              ]}
            />
          </View>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverSub}>
            ID: <Text style={styles.monoId}>{driver.driverId}</Text> • {driver.plate}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Real-time GPS Broadcasting Status Card */}
        <View
          style={[
            styles.gpsCard,
            isTracking ? styles.gpsCardActive : styles.gpsCardInactive,
          ]}
        >
          <View style={styles.gpsHeaderRow}>
            <View>
              <Text style={styles.cardHeader}>🛰️ Real-Time GPS Tracking</Text>
              <Text style={styles.statusLabel}>
                {isTracking ? "🟢 Live Broadcasting Active" : "⏸️ GPS Streaming Paused"}
              </Text>
            </View>

            <View style={styles.counterBadge}>
              <Text style={styles.counterNum}>{syncCount}</Text>
              <Text style={styles.counterLabel}>Pings Sent</Text>
            </View>
          </View>

          {/* Coordinate Readout */}
          <View style={styles.coordsGrid}>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>LATITUDE</Text>
              <Text style={styles.coordValue}>
                {currentCoords ? currentCoords.latitude.toFixed(5) : "Waiting..."}
              </Text>
            </View>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>LONGITUDE</Text>
              <Text style={styles.coordValue}>
                {currentCoords ? currentCoords.longitude.toFixed(5) : "Waiting..."}
              </Text>
            </View>
          </View>

          <View style={styles.coordsGrid}>
            <View style={styles.coordBoxSmall}>
              <Text style={styles.coordLabel}>SPEED</Text>
              <Text style={styles.coordValueSmall}>
                {currentCoords ? `${Math.round(currentCoords.speed)} km/h` : "0 km/h"}
              </Text>
            </View>
            <View style={styles.coordBoxSmall}>
              <Text style={styles.coordLabel}>HEADING</Text>
              <Text style={styles.coordValueSmall}>
                {currentCoords ? `${Math.round(currentCoords.heading)}°` : "0°"}
              </Text>
            </View>
            <View style={styles.coordBoxSmall}>
              <Text style={styles.coordLabel}>ACCURACY</Text>
              <Text style={styles.coordValueSmall}>
                {currentCoords?.accuracy
                  ? `±${Math.round(currentCoords.accuracy)}m`
                  : "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.syncRow}>
            <Text style={styles.syncTimeText}>🕒 Last Database Sync: {lastSyncTime}</Text>
          </View>

          {/* Main Action Toggle Button */}
          <TouchableOpacity
            style={[
              styles.trackingBtn,
              isTracking ? styles.trackingBtnStop : styles.trackingBtnStart,
            ]}
            onPress={toggleTracking}
            disabled={syncingNow}
            activeOpacity={0.85}
          >
            {syncingNow ? (
              <ActivityIndicator color={isTracking ? "#FFFFFF" : "#26231B"} />
            ) : (
              <Text
                style={[
                  styles.trackingBtnText,
                  isTracking ? styles.trackingBtnTextStop : styles.trackingBtnTextStart,
                ]}
              >
                {isTracking ? "⏹ Stop GPS Broadcasting" : "▶ Start Live GPS Broadcasting"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manualPingBtn}
            onPress={handleManualPing}
            disabled={syncingNow}
            activeOpacity={0.8}
          >
            <Text style={styles.manualPingBtnText}>📍 Sync Current Location Now</Text>
          </TouchableOpacity>
        </View>

        {/* Lorry Trip Availability Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.cardHeader}>📦 Vehicle Trip Status</Text>
          <Text style={styles.cardSub}>
            Choose whether your lorry is currently empty or loaded. This updates the web map instantly.
          </Text>

          <View style={styles.tripStatusButtons}>
            <TouchableOpacity
              style={[
                styles.statusBtn,
                tripStatus === "empty" && styles.statusBtnEmptyActive,
              ]}
              onPress={() => handleToggleTripStatus("empty")}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  tripStatus === "empty" && styles.statusBtnTextEmptyActive,
                ]}
              >
                🚚 Empty (Available)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusBtn,
                tripStatus === "on_trip" && styles.statusBtnTripActive,
              ]}
              onPress={() => handleToggleTripStatus("on_trip")}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  tripStatus === "on_trip" && styles.statusBtnTextTripActive,
                ]}
              >
                🛣️ On Trip (Loaded)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle & Assignment Summary */}
        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>🚛 Assigned Vehicle Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plate Number:</Text>
            <Text style={styles.infoValue}>{driver.plate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle Type:</Text>
            <Text style={styles.infoValue}>{driver.vehicleType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Primary Route:</Text>
            <Text style={styles.infoValue}>{driver.route}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registered Phone:</Text>
            <Text style={styles.infoValue}>{driver.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Web Map Lorry ID:</Text>
            <Text style={styles.monoId}>{driver.lorryId}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F2EA",
  },
  header: {
    backgroundColor: "#26231B",
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  driverBadge: {
    backgroundColor: "#FFC20E",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  driverBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#26231B",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotLive: {
    backgroundColor: "#1E9E5A",
  },
  dotOffline: {
    backgroundColor: "#8C877A",
  },
  driverName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  driverSub: {
    fontSize: 12,
    color: "#B2AB92",
    marginTop: 2,
  },
  monoId: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#FFC20E",
    fontWeight: "800",
  },
  logoutBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  logoutBtnText: {
    color: "#FFC20E",
    fontSize: 12.5,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  gpsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gpsCardActive: {
    borderColor: "#1E9E5A",
    backgroundColor: "#FAFDFB",
  },
  gpsCardInactive: {
    borderColor: "#E7E2D0",
  },
  gpsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardHeader: {
    fontSize: 17,
    fontWeight: "800",
    color: "#26231B",
  },
  cardSub: {
    fontSize: 12.5,
    color: "#6F6A5A",
    lineHeight: 17,
    marginBottom: 14,
  },
  statusLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#4A4537",
    marginTop: 2,
  },
  counterBadge: {
    backgroundColor: "#FFF6D6",
    borderWidth: 1,
    borderColor: "#FFC20E",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  counterNum: {
    fontSize: 16,
    fontWeight: "900",
    color: "#26231B",
  },
  counterLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#6F6A5A",
  },
  coordsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  coordBox: {
    flex: 1,
    backgroundColor: "#F8F7F2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E1D2",
  },
  coordBoxSmall: {
    flex: 1,
    backgroundColor: "#F8F7F2",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E1D2",
    alignItems: "center",
  },
  coordLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6F6A5A",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  coordValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#26231B",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  coordValueSmall: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26231B",
  },
  syncRow: {
    marginVertical: 10,
  },
  syncTimeText: {
    fontSize: 11.5,
    color: "#6F6A5A",
    fontStyle: "italic",
  },
  trackingBtn: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    elevation: 2,
  },
  trackingBtnStart: {
    backgroundColor: "#FFC20E",
  },
  trackingBtnStop: {
    backgroundColor: "#C51616",
  },
  trackingBtnText: {
    fontSize: 15,
    fontWeight: "800",
  },
  trackingBtnTextStart: {
    color: "#26231B",
  },
  trackingBtnTextStop: {
    color: "#FFFFFF",
  },
  manualPingBtn: {
    marginTop: 10,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#DCD6C4",
    alignItems: "center",
  },
  manualPingBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#26231B",
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E7E2D0",
  },
  tripStatusButtons: {
    flexDirection: "row",
    gap: 10,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F4F2EA",
    borderWidth: 1.5,
    borderColor: "#DCD6C4",
  },
  statusBtnEmptyActive: {
    backgroundColor: "#FFE08A",
    borderColor: "#FFC20E",
  },
  statusBtnTripActive: {
    backgroundColor: "#DDF3E7",
    borderColor: "#1E9E5A",
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6F6A5A",
  },
  statusBtnTextEmptyActive: {
    color: "#26231B",
    fontWeight: "800",
  },
  statusBtnTextTripActive: {
    color: "#12663A",
    fontWeight: "800",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E7E2D0",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F2EA",
  },
  infoLabel: {
    fontSize: 13,
    color: "#6F6A5A",
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#26231B",
  },
});
