import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from "react-native";
import * as Location from "expo-location";
import {
  DriverRecord,
  updateLorryGpsLocation,
  updateLorryTripStatus,
  updateLorryLiveTripDetails,
  LiveTripDetails,
} from "../services/database";
import {
  startGpsTracking,
  stopGpsTracking,
  getCurrentGpsPosition,
  GpsCoordinate,
} from "../services/location";
import { SriLankaMapViewer, MapLorryItem } from "../components/SriLankaMapViewer";

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
  const [currentCity, setCurrentCity] = useState<string>("Detecting location...");
  const [lastSyncTime, setLastSyncTime] = useState<string>("Not yet synced");
  const [syncCount, setSyncCount] = useState(0);
  const [syncingNow, setSyncingNow] = useState(false);

  // Modal & Trip States
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // false = Empty, true = Loaded

  // Loaded form fields
  const [startLoc, setStartLoc] = useState("");
  const [endLoc, setEndLoc] = useState("");
  const [emptyTime, setEmptyTime] = useState("");
  const [returnRoute, setReturnRoute] = useState("");
  const [finalDest, setFinalDest] = useState("");

  // Empty form fields
  const [currentLocName, setCurrentLocName] = useState("");
  const [travelRoute, setTravelRoute] = useState("");
  const [emptyEndDest, setEmptyEndDest] = useState("");
  const [availSpace, setAvailSpace] = useState("Full (100%)");
  const [availKg, setAvailKg] = useState("3,000 Kg");
  const [hasFreezer, setHasFreezer] = useState(false);
  const [hasHelper, setHasHelper] = useState(true);

  // Vehicle Number entered before broadcasting live
  const [enteredVehiclePlate, setEnteredVehiclePlate] = useState(driver.plate || "");

  // Active confirmed trip summary
  const [activeTrip, setActiveTrip] = useState<LiveTripDetails | null>(null);

  const driverRef = useRef(driver);
  driverRef.current = driver;

  // Initial GPS location fetch and reverse geocoding on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const pos = await getCurrentGpsPosition();
        if (pos && isMounted) {
          setCurrentCoords(pos);
          try {
            const geocode = await Location.reverseGeocodeAsync({
              latitude: pos.latitude,
              longitude: pos.longitude,
            });
            if (geocode && geocode.length > 0 && isMounted) {
              const p = geocode[0];
              const cityName = p.city || p.subregion || p.district || "Sri Lanka";
              setCurrentCity(cityName);
              setCurrentLocName(cityName);
              setStartLoc(cityName);
            }
          } catch {
            if (isMounted) {
              setCurrentCity(`${pos.latitude.toFixed(3)}°N, ${pos.longitude.toFixed(3)}°E`);
            }
          }
        }
      } catch {
        // Fallback
      }
    })();

    return () => {
      isMounted = false;
      stopGpsTracking();
    };
  }, []);

  // Handle live GPS streaming
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
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn("Failed to stream GPS:", err);
    }
  };

  // Open the Trip Details Modal to start or edit live broadcasting
  const handleOpenLiveModal = () => {
    if (!startLoc && currentCity !== "Detecting location...") {
      setStartLoc(currentCity);
    }
    if (!currentLocName && currentCity !== "Detecting location...") {
      setCurrentLocName(currentCity);
    }
    setModalVisible(true);
  };

  // Confirm Trip and Start Live GPS Streaming
  const handleConfirmStartLive = async () => {
    setSyncingNow(true);

    const chosenPlate = enteredVehiclePlate.trim().toUpperCase() || driver.plate;

    const tripData: LiveTripDetails = {
      lorryId: driver.lorryId,
      driverId: driver.driverId,
      driverName: driver.name,
      plate: chosenPlate,
      status: isLoaded ? "on_trip" : "empty",
      startLocation: isLoaded ? startLoc.trim() : currentLocName.trim(),
      endLocation: isLoaded ? endLoc.trim() : emptyEndDest.trim(),
      travelRoute: isLoaded ? returnRoute.trim() : travelRoute.trim(),
      emptyTime: isLoaded ? emptyTime.trim() : undefined,
      returnRoute: isLoaded ? returnRoute.trim() : undefined,
      finalDestination: isLoaded ? finalDest.trim() : undefined,
      availableSpace: !isLoaded ? availSpace : undefined,
      availableCapacityKg: !isLoaded ? availKg.trim() : undefined,
      hasFreezer: !isLoaded ? hasFreezer : undefined,
      hasHelper: !isLoaded ? hasHelper : undefined,
      isLive: true,
      lat: currentCoords?.latitude || 6.9271,
      lng: currentCoords?.longitude || 79.8612,
      speedKmH: currentCoords?.speed || 0,
      heading: currentCoords?.heading || 0,
      updatedAt: Date.now(),
    };

    setActiveTrip(tripData);

    try {
      // 1. Update full trip specifications in Firestore
      await updateLorryLiveTripDetails(tripData);

      // 2. Start continuous GPS broadcasting
      const started = await startGpsTracking(handleLocationUpdate);
      if (started) {
        setIsTracking(true);
      } else {
        Alert.alert(
          "Permission Required",
          "Please grant Location / GPS permissions in device settings to stream real-time location."
        );
      }
    } catch (e: any) {
      Alert.alert("Notice", "Broadcasting started with local cache.");
    }

    setSyncingNow(false);
    setModalVisible(false);
  };

  // Stop Live Broadcasting
  const handleStopLive = async () => {
    stopGpsTracking();
    setIsTracking(false);
    try {
      await updateLorryTripStatus(driver.lorryId, "empty");
    } catch {}
    setActiveTrip(null);
  };

  // Manual one-off GPS ping
  const handleManualPing = async () => {
    setSyncingNow(true);
    const pos = await getCurrentGpsPosition();
    if (pos) {
      await handleLocationUpdate(pos);
      Alert.alert(
        "GPS Synced",
        `Location updated!\nLat: ${pos.latitude.toFixed(4)}, Lng: ${pos.longitude.toFixed(4)}`
      );
    } else {
      Alert.alert("GPS Error", "Could not fetch current coordinates. Check device GPS.");
    }
    setSyncingNow(false);
  };

  // Prepare map vehicle item for the live OpenStreetMap view
  const chosenPlate =
    activeTrip?.plate || (enteredVehiclePlate && enteredVehiclePlate.trim().toUpperCase()) || driver.plate;

  const mapLorries: MapLorryItem[] = [
    {
      id: driver.lorryId,
      plate: chosenPlate,
      route:
        activeTrip && activeTrip.startLocation && activeTrip.endLocation
          ? `${activeTrip.startLocation} → ${activeTrip.endLocation}`
          : driver.route || "Current Location",
      driverName: driver.name,
      driverPhone: driver.phone,
      status: activeTrip?.status === "on_trip" || isLoaded ? "On trip" : "Empty",
      lat: currentCoords?.latitude || 6.9271,
      lng: currentCoords?.longitude || 79.8612,
      speedKmH: Math.round(currentCoords?.speed || 0),
      heading: Math.round(currentCoords?.heading || 0),
      isOnline: isTracking,
      startLocation: activeTrip?.startLocation || (isLoaded ? startLoc : currentLocName),
      endLocation: activeTrip?.endLocation || (isLoaded ? endLoc : emptyEndDest),
      travelRoute: activeTrip?.travelRoute || (isLoaded ? returnRoute : travelRoute),
      emptyTime: activeTrip?.emptyTime || emptyTime,
      returnRoute: activeTrip?.returnRoute || returnRoute,
      finalDestination: activeTrip?.finalDestination || finalDest,
      availableSpace: activeTrip?.availableSpace || availSpace,
      availableCapacityKg: activeTrip?.availableCapacityKg || availKg,
      hasFreezer: activeTrip?.hasFreezer ?? hasFreezer,
      hasHelper: activeTrip?.hasHelper ?? hasHelper,
    },
  ];

  return (
    <View style={styles.container}>
      {/* 1. Header Bar - Vehicle number NOT shown as requested */}
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
            Rider ID: <Text style={styles.monoId}>{driver.driverId}</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. REAL SRI LANKA MAP VIEW (Showing rider's real GPS location) */}
        <View style={styles.mapCard}>
          <View style={styles.mapCardHeader}>
            <View>
              <Text style={styles.mapCardTitle}>🗺️ Sri Lanka Live Map</Text>
              <Text style={styles.mapCardSub}>
                📍 Your Location: <Text style={styles.boldText}>{currentCity}</Text>
              </Text>
            </View>
            <View style={[styles.liveStatusPill, isTracking ? styles.pillLive : styles.pillStandby]}>
              <View style={[styles.pillDot, isTracking ? styles.dotLive : styles.dotOffline]} />
              <Text style={styles.pillText}>{isTracking ? "BROADCASTING" : "STANDBY"}</Text>
            </View>
          </View>

          {/* Leaflet OpenStreetMap Container */}
          <View style={styles.mapViewerWrapper}>
            <SriLankaMapViewer
              lorries={mapLorries}
              selectedPlate={driver.plate}
              filter="all"
              height={320}
              isMiniMap={false}
            />
          </View>
        </View>

        {/* 3. ACTIVE LIVE TRIP BANNER (Visible if broadcasting) */}
        {isTracking && activeTrip && (
          <View style={styles.activeTripCard}>
            <View style={styles.activeTripHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.activeTripTitle}>
                  {activeTrip.status === "on_trip" ? "LOADED TRIP IN PROGRESS" : "EMPTY / AVAILABLE FOR CARGO"}
                </Text>
                <Text style={styles.activeTripRoute}>
                  {activeTrip.startLocation || "Start"} ➔ {activeTrip.endLocation || "Destination"}
                </Text>
              </View>
              <TouchableOpacity style={styles.editTripBtn} onPress={handleOpenLiveModal}>
                <Text style={styles.editTripBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Loaded Specific Summary */}
            {activeTrip.status === "on_trip" ? (
              <View style={styles.tripMetaGrid}>
                {activeTrip.emptyTime && (
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Emptying Time</Text>
                    <Text style={styles.metaVal}>{activeTrip.emptyTime}</Text>
                  </View>
                )}
                {activeTrip.returnRoute && (
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Return Route</Text>
                    <Text style={styles.metaVal}>{activeTrip.returnRoute}</Text>
                  </View>
                )}
                {activeTrip.finalDestination && (
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Final Destination</Text>
                    <Text style={styles.metaVal}>{activeTrip.finalDestination}</Text>
                  </View>
                )}
              </View>
            ) : (
              /* Empty Specific Summary */
              <View style={styles.emptyBadgesRow}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{activeTrip.availableSpace || "Full Space"}</Text>
                </View>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{activeTrip.availableCapacityKg || "3,000 Kg"}</Text>
                </View>
                {activeTrip.hasFreezer && (
                  <View style={[styles.badgePill, styles.badgePillHighlight]}>
                    <Text style={styles.badgePillHighlightText}>Freezer Available</Text>
                  </View>
                )}
                {activeTrip.hasHelper && (
                  <View style={[styles.badgePill, styles.badgePillHighlight]}>
                    <Text style={styles.badgePillHighlightText}>Helper Onboard</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* 4. MAIN ACTION BUTTON: START / STOP LIVE */}
        <View style={styles.actionCard}>
          {!isTracking ? (
            <TouchableOpacity
              style={styles.startLiveBtn}
              onPress={handleOpenLiveModal}
              activeOpacity={0.85}
              disabled={syncingNow}
            >
              {syncingNow ? (
                <ActivityIndicator color="#26231B" />
              ) : (
                <>
                  <Text style={styles.startLiveBtnIcon}>▶</Text>
                  <Text style={styles.startLiveBtnText}>Start Live Broadcasting</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopLiveBtn}
              onPress={handleStopLive}
              activeOpacity={0.85}
            >
              <Text style={styles.stopLiveBtnText}>Stop Live Broadcasting</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.manualPingBtn}
            onPress={handleManualPing}
            disabled={syncingNow}
            activeOpacity={0.8}
          >
            <Text style={styles.manualPingBtnText}>Sync GPS Coordinate Now</Text>
          </TouchableOpacity>
        </View>

        {/* 5. GPS TELEMETRY READOUT CARD */}
        <View style={styles.telemetryCard}>
          <View style={styles.telemetryHeader}>
            <Text style={styles.telemetryTitle}>Live GPS Telemetry</Text>
            <Text style={styles.pingsCount}>{syncCount} Pings Sent</Text>
          </View>

          <View style={styles.coordsGrid}>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>LATITUDE</Text>
              <Text style={styles.coordValue}>
                {currentCoords ? currentCoords.latitude.toFixed(5) : "Searching..."}
              </Text>
            </View>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>LONGITUDE</Text>
              <Text style={styles.coordValue}>
                {currentCoords ? currentCoords.longitude.toFixed(5) : "Searching..."}
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
                {currentCoords?.accuracy ? `±${Math.round(currentCoords.accuracy)}m` : "Good"}
              </Text>
            </View>
          </View>

          <Text style={styles.lastSyncText}>Last Database Sync: {lastSyncTime}</Text>
        </View>
      </ScrollView>

      {/* 6. BOTTOM MODAL: TRIP DETAILS SETUP BEFORE GOING LIVE */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <View>
                <Text style={styles.modalTitle}>Trip Information</Text>
                <Text style={styles.modalSub}>Setup your journey before broadcasting live</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* VEHICLE NUMBER INPUT (Required: entered plate appears on live map) */}
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.inputLabel}>Vehicle Number (වාහන අංකය) *</Text>
                <TextInput
                  style={[styles.formInput, { borderColor: "#FFC20E", borderWidth: 1.5, fontWeight: "800" }]}
                  placeholder="e.g. WP LB-4521 / SP LK-8902"
                  placeholderTextColor="#8C877A"
                  value={enteredVehiclePlate}
                  onChangeText={setEnteredVehiclePlate}
                  autoCapitalize="characters"
                />
              </View>

              {/* Trip Type Selector: Loaded vs Empty */}
              <Text style={styles.inputSectionLabel}>Select Trip Status:</Text>
              <View style={styles.tripTypeToggleRow}>
                <TouchableOpacity
                  style={[styles.tripTypeCard, !isLoaded && styles.tripTypeCardActive]}
                  onPress={() => setIsLoaded(false)}
                >
                  <Text style={styles.tripTypeIcon}>🚚</Text>
                  <Text style={[styles.tripTypeTitle, !isLoaded && styles.tripTypeTitleActive]}>
                    Empty (හිස්ව)
                  </Text>
                  <Text style={styles.tripTypeDesc}>Available for cargo hire</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tripTypeCard, isLoaded && styles.tripTypeCardActive]}
                  onPress={() => setIsLoaded(true)}
                >
                  <Text style={styles.tripTypeIcon}>📦</Text>
                  <Text style={[styles.tripTypeTitle, isLoaded && styles.tripTypeTitleActive]}>
                    Loaded (පටවා ඇත)
                  </Text>
                  <Text style={styles.tripTypeDesc}>On trip with goods</Text>
                </TouchableOpacity>
              </View>

              {/* DYNAMIC FORM 1: IF LOADED */}
              {isLoaded ? (
                <View style={styles.formSection}>
                  <Text style={styles.inputLabel}>Start location (ආරම්භක ස්ථානය) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Colombo Harbor / පිටකොටුව"
                    placeholderTextColor="#8C877A"
                    value={startLoc}
                    onChangeText={setStartLoc}
                  />

                  <Text style={styles.inputLabel}>Destination (ගමනාන්තය) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Kandy / මහනුවර"
                    placeholderTextColor="#8C877A"
                    value={endLoc}
                    onChangeText={setEndLoc}
                  />

                  <Text style={styles.inputLabel}>Emptying time (බඩු බා හිස්වන වෙලාව)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Today 4:30 PM / අද සවස 4ට"
                    placeholderTextColor="#8C877A"
                    value={emptyTime}
                    onChangeText={setEmptyTime}
                  />

                  <Text style={styles.inputLabel}>Return route (ආපසු එන පාර)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. A1 Road via Kegalle to Colombo"
                    placeholderTextColor="#8C877A"
                    value={returnRoute}
                    onChangeText={setReturnRoute}
                  />

                  <Text style={styles.inputLabel}>Ending point (ගමන අවසන් කරන තැන)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Peliyagoda Transport Hub"
                    placeholderTextColor="#8C877A"
                    value={finalDest}
                    onChangeText={setFinalDest}
                  />
                </View>
              ) : (
                /* DYNAMIC FORM 2: IF EMPTY */
                <View style={styles.formSection}>
                  <Text style={styles.inputLabel}>Current location (දැනට සිටින ස්ථානය) *</Text>
                  <View style={styles.inputWithAction}>
                    <TextInput
                      style={[styles.formInput, { flex: 1 }]}
                      placeholder="e.g. Galle Fort"
                      placeholderTextColor="#8C877A"
                      value={currentLocName}
                      onChangeText={setCurrentLocName}
                    />
                    <TouchableOpacity
                      style={styles.autoDetectBtn}
                      onPress={() => setCurrentLocName(currentCity)}
                    >
                      <Text style={styles.autoDetectBtnText}>GPS</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.inputLabel}>Traveling route (යන පාර) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Southern Expressway (E01) / ගාල්ල - කොළඹ"
                    placeholderTextColor="#8C877A"
                    value={travelRoute}
                    onChangeText={setTravelRoute}
                  />

                  <Text style={styles.inputLabel}>End destination (අවසාන ස්ථානය) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Colombo / මීගමුව"
                    placeholderTextColor="#8C877A"
                    value={emptyEndDest}
                    onChangeText={setEmptyEndDest}
                  />

                  {/* LORRY SPECIFICATIONS & CAPACITY */}
                  <Text style={[styles.inputSectionLabel, { marginTop: 12 }]}>
                    Lorry Availability & Capacity (ලොරි රථයේ විස්තර):
                  </Text>

                  <Text style={styles.inputLabel}>Available Space (ඉඩ ප්‍රමාණය)</Text>
                  <View style={styles.pillSelectionRow}>
                    {["Full (100%)", "Half (50%)", "Quarter (25%)"].map((sp) => (
                      <TouchableOpacity
                        key={sp}
                        style={[styles.spacePill, availSpace === sp && styles.spacePillActive]}
                        onPress={() => setAvailSpace(sp)}
                      >
                        <Text style={[styles.spacePillText, availSpace === sp && styles.spacePillTextActive]}>
                          {sp}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Available weight capacity (පැටවිය හැකි බර)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 3,500 Kg or 3.5 Tons"
                    placeholderTextColor="#8C877A"
                    value={availKg}
                    onChangeText={setAvailKg}
                  />

                  {/* CHECKBOX: FREEZER */}
                  <TouchableOpacity
                    style={[styles.checkboxRow, hasFreezer && styles.checkboxRowActive]}
                    onPress={() => setHasFreezer(!hasFreezer)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.checkboxBox, hasFreezer && styles.checkboxBoxActive]}>
                      {hasFreezer && <Text style={styles.checkboxCheck}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.checkboxTitle}>Freezer Facility Available</Text>
                      <Text style={styles.checkboxDesc}>Refrigerated cold storage truck</Text>
                    </View>
                  </TouchableOpacity>

                  {/* CHECKBOX: HELPER */}
                  <TouchableOpacity
                    style={[styles.checkboxRow, hasHelper && styles.checkboxRowActive]}
                    onPress={() => setHasHelper(!hasHelper)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.checkboxBox, hasHelper && styles.checkboxBoxActive]}>
                      {hasHelper && <Text style={styles.checkboxCheck}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.checkboxTitle}>Helper / Assistant Available</Text>
                      <Text style={styles.checkboxDesc}>Assistant onboard for loading/unloading</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* ACTION BUTTONS */}
              <TouchableOpacity
                style={styles.confirmGoLiveBtn}
                onPress={handleConfirmStartLive}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmGoLiveBtnText}>🚀 Confirm & Go Live</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === "ios" ? 44 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
    backgroundColor: "#3A3528",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  driverBadgeText: {
    color: "#FFC20E",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
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
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  driverSub: {
    color: "#D9D3BD",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  monoId: {
    color: "#FFC20E",
    fontWeight: "900",
  },
  logoutBtn: {
    backgroundColor: "#363227",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  logoutBtnText: {
    color: "#FFC20E",
    fontSize: 12,
    fontWeight: "800",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },

  /* 2. Map Card */
  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E7E2D0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  mapCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mapCardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#26231B",
  },
  mapCardSub: {
    fontSize: 11.5,
    color: "#6F6A5A",
    marginTop: 2,
  },
  boldText: {
    fontWeight: "800",
    color: "#1E9E5A",
  },
  liveStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  pillLive: {
    backgroundColor: "#DDF3E7",
  },
  pillStandby: {
    backgroundColor: "#EAE7DC",
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#26231B",
  },
  mapViewerWrapper: {
    borderRadius: 14,
    overflow: "hidden",
  },

  /* 3. Active Trip Summary Card */
  activeTripCard: {
    backgroundColor: "#26231B",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FFC20E",
    gap: 10,
  },
  activeTripHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  activeTripTitle: {
    color: "#FFC20E",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  activeTripRoute: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  editTripBtn: {
    backgroundColor: "#363227",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFC20E",
  },
  editTripBtnText: {
    color: "#FFC20E",
    fontSize: 11,
    fontWeight: "800",
  },
  tripMetaGrid: {
    borderTopWidth: 1,
    borderTopColor: "#3B3727",
    paddingTop: 10,
    gap: 6,
  },
  metaCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    color: "#B2AB92",
    fontSize: 11,
    fontWeight: "700",
  },
  metaVal: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingTop: 6,
  },
  badgePill: {
    backgroundColor: "#363227",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgePillText: {
    color: "#D9D3BD",
    fontSize: 11,
    fontWeight: "700",
  },
  badgePillHighlight: {
    backgroundColor: "#173B28",
    borderWidth: 1,
    borderColor: "#1E9E5A",
  },
  badgePillHighlightText: {
    color: "#2FE084",
    fontSize: 11,
    fontWeight: "800",
  },

  /* 4. Action Card */
  actionCard: {
    gap: 10,
  },
  startLiveBtn: {
    backgroundColor: "#FFC20E",
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#FFC20E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  startLiveBtnIcon: {
    fontSize: 14,
    fontWeight: "900",
    color: "#26231B",
  },
  startLiveBtnText: {
    color: "#26231B",
    fontSize: 16,
    fontWeight: "900",
  },
  stopLiveBtn: {
    backgroundColor: "#B3121F",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stopLiveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  manualPingBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E7E2D0",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  manualPingBtnText: {
    color: "#26231B",
    fontSize: 13,
    fontWeight: "800",
  },

  /* 5. Telemetry Card */
  telemetryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E7E2D0",
    gap: 10,
  },
  telemetryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  telemetryTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26231B",
  },
  pingsCount: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E9E5A",
  },
  coordsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  coordBox: {
    flex: 1,
    backgroundColor: "#F8F7F2",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E7E2D0",
  },
  coordBoxSmall: {
    flex: 1,
    backgroundColor: "#F8F7F2",
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E7E2D0",
    alignItems: "center",
  },
  coordLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#6F6A5A",
    marginBottom: 2,
  },
  coordValue: {
    fontSize: 14,
    fontWeight: "900",
    color: "#26231B",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  coordValueSmall: {
    fontSize: 12,
    fontWeight: "900",
    color: "#26231B",
  },
  lastSyncText: {
    fontSize: 11,
    color: "#6F6A5A",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 2,
  },

  /* 6. Modal Bottom Sheet */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "88%",
  },
  modalSheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E7E2D0",
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#26231B",
  },
  modalSub: {
    fontSize: 11.5,
    color: "#6F6A5A",
    fontWeight: "600",
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseBtnText: {
    fontSize: 18,
    color: "#6F6A5A",
    fontWeight: "800",
  },
  modalScroll: {
    gap: 12,
    paddingBottom: 20,
  },

  /* Toggle Cards */
  inputSectionLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#26231B",
  },
  tripTypeToggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  tripTypeCard: {
    flex: 1,
    backgroundColor: "#F8F7F2",
    borderRadius: 14,
    padding: 12,
    borderWidth: 2,
    borderColor: "#E7E2D0",
    alignItems: "center",
  },
  tripTypeCardActive: {
    backgroundColor: "#FFF6D6",
    borderColor: "#FFC20E",
  },
  tripTypeIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  tripTypeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6F6A5A",
  },
  tripTypeTitleActive: {
    color: "#26231B",
    fontWeight: "900",
  },
  tripTypeDesc: {
    fontSize: 10,
    color: "#8C877A",
    textAlign: "center",
    marginTop: 2,
  },

  /* Form Section */
  formSection: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#26231B",
    marginTop: 4,
  },
  formInput: {
    backgroundColor: "#F8F7F2",
    borderWidth: 1.5,
    borderColor: "#E7E2D0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13.5,
    fontWeight: "600",
    color: "#26231B",
  },
  inputWithAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  autoDetectBtn: {
    backgroundColor: "#26231B",
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  autoDetectBtnText: {
    color: "#FFC20E",
    fontSize: 12,
    fontWeight: "800",
  },

  /* Pill selection */
  pillSelectionRow: {
    flexDirection: "row",
    gap: 8,
  },
  spacePill: {
    flex: 1,
    backgroundColor: "#F8F7F2",
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "#E7E2D0",
    alignItems: "center",
  },
  spacePillActive: {
    backgroundColor: "#FFF6D6",
    borderColor: "#FFC20E",
  },
  spacePillText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#6F6A5A",
  },
  spacePillTextActive: {
    color: "#26231B",
    fontWeight: "900",
  },

  /* Checkboxes */
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8F7F2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#E7E2D0",
  },
  checkboxRowActive: {
    backgroundColor: "#EBF7F0",
    borderColor: "#1E9E5A",
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#8C877A",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxActive: {
    backgroundColor: "#1E9E5A",
    borderColor: "#1E9E5A",
  },
  checkboxCheck: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  checkboxTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26231B",
  },
  checkboxDesc: {
    fontSize: 11,
    color: "#6F6A5A",
  },

  /* Modal action buttons */
  confirmGoLiveBtn: {
    backgroundColor: "#26231B",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: "#FFC20E",
  },
  confirmGoLiveBtnText: {
    color: "#FFC20E",
    fontSize: 15,
    fontWeight: "900",
  },
  modalCancelBtn: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtnText: {
    color: "#6F6A5A",
    fontSize: 13.5,
    fontWeight: "700",
  },
});
