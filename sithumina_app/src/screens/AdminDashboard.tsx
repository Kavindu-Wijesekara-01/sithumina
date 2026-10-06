import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
  Platform,
} from "react-native";
import {
  registerNewDriver,
  getAllDrivers,
  DriverRecord,
  getAllLorries,
  LorryRecord,
  addNewLorryToFleet,
  deleteLorryFromFleet,
  updateLorryTripStatus,
  getAllBookings,
  BookingRecord,
  updateBookingDispatch,
  getAllCustomers,
  CustomerRecord,
  getAllRegistrations,
  RegistrationRecord,
  updateRegistrationStatus,
  getAllInquiries,
  InquiryRecord,
  updateInquiryStatus,
  getAllReviews,
  ReviewRecord,
} from "../services/database";

interface AdminDashboardProps {
  onLogout: () => void;
}

type AdminTab =
  | "fleet"
  | "drivers"
  | "bookings"
  | "customers"
  | "registrations"
  | "inquiries"
  | "reviews";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("fleet");
  const [loading, setLoading] = useState(false);

  // Data states
  const [lorries, setLorries] = useState<LorryRecord[]>([]);
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);

  // Driver Registration Form Modal
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("");
  const [newDriverPlate, setNewDriverPlate] = useState("");
  const [newDriverVehicleType, setNewDriverVehicleType] = useState("14ft Closed");
  const [newDriverRoute, setNewDriverRoute] = useState("Colombo – Kandy");
  const [submittingDriver, setSubmittingDriver] = useState(false);

  // Success ID Modal
  const [idModalVisible, setIdModalVisible] = useState(false);
  const [generatedId, setGeneratedId] = useState("");

  // Add Lorry Modal
  const [lorryModalVisible, setLorryModalVisible] = useState(false);
  const [newLorryPlate, setNewLorryPlate] = useState("");
  const [newLorryRoute, setNewLorryRoute] = useState("Colombo – Galle");
  const [newLorryDriverName, setNewLorryDriverName] = useState("");
  const [newLorryType, setNewLorryType] = useState("14ft Isuzu Lorry");

  // Assign Driver Modal
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [lList, dList, bList, cList, rList, iList, revList] = await Promise.all([
        getAllLorries(),
        getAllDrivers(),
        getAllBookings(),
        getAllCustomers(),
        getAllRegistrations(),
        getAllInquiries(),
        getAllReviews(),
      ]);
      setLorries(lList);
      setDrivers(dList);
      setBookings(bList);
      setCustomers(cList);
      setRegistrations(rList);
      setInquiries(iList);
      setReviews(revList);
    } catch (e) {
      console.warn("Could not load admin data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 4000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  // Handle Driver Registration
  const handleRegisterDriver = async () => {
    if (!newDriverName.trim() || !newDriverPhone.trim() || !newDriverPlate.trim()) {
      Alert.alert("Missing Fields", "Please enter driver name, phone, and plate number.");
      return;
    }
    setSubmittingDriver(true);
    try {
      const res = await registerNewDriver({
        name: newDriverName,
        phone: newDriverPhone,
        plate: newDriverPlate,
        vehicleType: newDriverVehicleType,
        route: newDriverRoute,
      });
      setGeneratedId(res.driverId);
      setDriverModalVisible(false);
      setIdModalVisible(true);
      setNewDriverName("");
      setNewDriverPhone("");
      setNewDriverPlate("");
      loadAllData();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to register driver.");
    } finally {
      setSubmittingDriver(false);
    }
  };

  // Handle Add Lorry to Fleet
  const handleAddLorry = async () => {
    if (!newLorryPlate.trim() || !newLorryRoute.trim()) {
      Alert.alert("Missing Fields", "Please enter vehicle plate and route.");
      return;
    }
    await addNewLorryToFleet({
      plate: newLorryPlate.trim().toUpperCase(),
      route: newLorryRoute.trim(),
      driverName: newLorryDriverName.trim() || "Fleet Driver",
      vehicleType: newLorryType,
    });
    setLorryModalVisible(false);
    setNewLorryPlate("");
    setNewLorryDriverName("");
    loadAllData();
  };

  // Assign Driver to Booking
  const handleAssignDriverToBooking = async (driver: DriverRecord) => {
    if (!selectedBooking) return;
    await updateBookingDispatch({
      id: selectedBooking.id,
      status: "assigned",
      assignedLorryId: driver.lorryId,
      assignedDriverName: driver.name,
      assignedDriverPhone: driver.phone,
      assignedPlate: driver.plate,
    });
    setAssignModalVisible(false);
    setSelectedBooking(null);
    loadAllData();
    Alert.alert("Vehicle Assigned", `Driver ${driver.name} (${driver.plate}) assigned to booking ${selectedBooking.id}!`);
  };

  return (
    <View style={styles.container}>
      {/* ADMIN HEADER */}
      <View style={styles.header}>
        <View>
          <View style={styles.adminBadgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ADMIN CONSOLE</Text>
            </View>
            <View style={styles.liveIndicator}>
              <View style={styles.greenDot} />
              <Text style={styles.liveText}>Live Sync</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Sithumina Transport</Text>
          <Text style={styles.headerSubtitle}>Enterprise Fleet & Operations Hub</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={loadAllData} style={styles.refreshBtn}>
            <Text style={styles.refreshBtnText}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* HORIZONTAL CATEGORY TABS */}
      <View style={styles.tabBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "fleet" && styles.tabItemActive]}
            onPress={() => setActiveTab("fleet")}
          >
            <Text style={[styles.tabItemText, activeTab === "fleet" && styles.tabItemTextActive]}>
              🛰️ Fleet & GPS ({lorries.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "drivers" && styles.tabItemActive]}
            onPress={() => setActiveTab("drivers")}
          >
            <Text style={[styles.tabItemText, activeTab === "drivers" && styles.tabItemTextActive]}>
              👨‍✈️ Drivers ({drivers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "bookings" && styles.tabItemActive]}
            onPress={() => setActiveTab("bookings")}
          >
            <Text style={[styles.tabItemText, activeTab === "bookings" && styles.tabItemTextActive]}>
              📦 Bookings ({bookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "customers" && styles.tabItemActive]}
            onPress={() => setActiveTab("customers")}
          >
            <Text style={[styles.tabItemText, activeTab === "customers" && styles.tabItemTextActive]}>
              👥 Customers ({customers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "registrations" && styles.tabItemActive]}
            onPress={() => setActiveTab("registrations")}
          >
            <Text style={[styles.tabItemText, activeTab === "registrations" && styles.tabItemTextActive]}>
              📋 Partner Lorries ({registrations.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "inquiries" && styles.tabItemActive]}
            onPress={() => setActiveTab("inquiries")}
          >
            <Text style={[styles.tabItemText, activeTab === "inquiries" && styles.tabItemTextActive]}>
              💬 Inquiries ({inquiries.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "reviews" && styles.tabItemActive]}
            onPress={() => setActiveTab("reviews")}
          >
            <Text style={[styles.tabItemText, activeTab === "reviews" && styles.tabItemTextActive]}>
              ⭐ Reviews ({reviews.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* TAB CONTENT BODY */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentContainer}>
        {loading && lorries.length === 0 && (
          <ActivityIndicator size="small" color="#26231B" style={{ marginVertical: 20 }} />
        )}

        {/* 1. FLEET & LIVE GPS TAB */}
        {activeTab === "fleet" && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Active Fleet & Live GPS Tracking</Text>
                <Text style={styles.sectionDesc}>Real-time telemetry broadcasted from mobile driver devices</Text>
              </View>
              <TouchableOpacity onPress={() => setLorryModalVisible(true)} style={styles.actionBtnYellow}>
                <Text style={styles.actionBtnYellowText}>+ Add Vehicle</Text>
              </TouchableOpacity>
            </View>

            {lorries.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🛰️</Text>
                <Text style={styles.emptyTitle}>No vehicles in fleet</Text>
                <Text style={styles.emptyDesc}>Tap '+ Add Vehicle' or register a driver to start tracking.</Text>
              </View>
            ) : (
              lorries.map((l) => (
                <View key={l.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View>
                      <Text style={styles.cardPlate}>{l.plate}</Text>
                      <Text style={styles.cardRoute}>{l.route}</Text>
                    </View>
                    <View style={l.status === "on_trip" ? styles.statusBadgeTrip : styles.statusBadgeEmpty}>
                      <Text style={l.status === "on_trip" ? styles.statusTextTrip : styles.statusTextEmpty}>
                        {l.status === "on_trip" ? "ON TRIP" : "EMPTY / AVAILABLE"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.driverInfoRow}>
                    <Text style={styles.driverInfoLabel}>Driver:</Text>
                    <Text style={styles.driverInfoValue}>{l.driverName} ({l.driverId || "Unassigned"})</Text>
                  </View>

                  {/* GPS Telemetry Box */}
                  <View style={styles.telemetryBox}>
                    <Text style={styles.telemetryTitle}>📍 Live GPS Telemetry</Text>
                    <Text style={styles.telemetryCoords}>
                      Coords: {l.lat.toFixed(6)}°, {l.lng.toFixed(6)}°
                    </Text>
                    <Text style={styles.telemetrySpeed}>
                      Speed: {l.speedKmH} km/h • Heading: {l.heading}°
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      onPress={() => updateLorryTripStatus(l.id, l.status === "empty" ? "on_trip" : "empty")}
                      style={styles.btnOutline}
                    >
                      <Text style={styles.btnOutlineText}>
                        {l.status === "empty" ? "Set On Trip" : "Set Empty"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => Linking.openURL(`https://www.google.com/maps?q=${l.lat},${l.lng}`)}
                      style={styles.btnOutline}
                    >
                      <Text style={styles.btnOutlineText}>Google Maps ↗</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert("Remove Vehicle", `Remove ${l.plate} from active tracking?`, [
                          { text: "Cancel" },
                          { text: "Remove", style: "destructive", onPress: () => deleteLorryFromFleet(l.id) },
                        ]);
                      }}
                      style={styles.btnDanger}
                    >
                      <Text style={styles.btnDangerText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* 2. DRIVERS TAB */}
        {activeTab === "drivers" && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Registered Drivers ({drivers.length})</Text>
                <Text style={styles.sectionDesc}>Drivers authorized to log in and broadcast live GPS</Text>
              </View>
              <TouchableOpacity onPress={() => setDriverModalVisible(true)} style={styles.actionBtnYellow}>
                <Text style={styles.actionBtnYellowText}>+ Register Driver</Text>
              </TouchableOpacity>
            </View>

            {drivers.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>👨‍✈️</Text>
                <Text style={styles.emptyTitle}>No registered drivers</Text>
                <Text style={styles.emptyDesc}>Tap '+ Register Driver' to add your first driver.</Text>
              </View>
            ) : (
              drivers.map((d) => (
                <View key={d.driverId} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.driverIdBadge}>
                      <Text style={styles.driverIdBadgeText}>{d.driverId}</Text>
                    </View>
                    <Text style={styles.driverPlate}>{d.plate}</Text>
                  </View>

                  <Text style={styles.driverCardName}>{d.name}</Text>
                  <Text style={styles.driverCardDetail}>🚚 {d.vehicleType} • {d.route}</Text>

                  <View style={styles.driverActionsRow}>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${d.phone}`)}
                      style={styles.callBtn}
                    >
                      <Text style={styles.callBtnText}>📞 Call {d.phone}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* 3. BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Customer Bookings ({bookings.length})</Text>
                <Text style={styles.sectionDesc}>Consignment requests submitted via Sithumina Web</Text>
              </View>
            </View>

            {bookings.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>No bookings yet</Text>
                <Text style={styles.emptyDesc}>When customers book on the web, their requests appear here.</Text>
              </View>
            ) : (
              bookings.map((b) => (
                <View key={b.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.bookingIdBadge}>
                      <Text style={styles.bookingIdText}>{b.id}</Text>
                    </View>
                    <View style={styles.statusBadgeSmall}>
                      <Text style={styles.statusBadgeSmallText}>{b.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.bookingCustomerText}>👤 {b.customerName}</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${b.customerPhone}`)}>
                    <Text style={styles.bookingPhoneText}>📞 {b.customerPhone} (Tap to Call)</Text>
                  </TouchableOpacity>

                  <View style={styles.bookingRouteBox}>
                    <Text style={styles.bookingRouteText}>📍 {b.pickupCity} ➔ 🏁 {b.deliveryCity}</Text>
                    <Text style={styles.bookingSubDetail}>📅 Date: {b.date} • {b.vehicleType}</Text>
                    {b.packageDetails ? <Text style={styles.bookingPackageText}>📦 {b.packageDetails}</Text> : null}
                  </View>

                  {/* Assignment Status */}
                  {b.assignedPlate ? (
                    <View style={styles.assignedBox}>
                      <Text style={styles.assignedTitle}>Assigned Vehicle:</Text>
                      <Text style={styles.assignedValue}>🚚 {b.assignedPlate} ({b.assignedDriverName})</Text>
                    </View>
                  ) : null}

                  {/* Action Buttons */}
                  <View style={styles.bookingActionsRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedBooking(b);
                        setAssignModalVisible(true);
                      }}
                      style={styles.assignBtn}
                    >
                      <Text style={styles.assignBtnText}>
                        {b.assignedPlate ? "Reassign Lorry" : "⚡ Assign Driver & Lorry"}
                      </Text>
                    </TouchableOpacity>

                    {b.status === "assigned" && (
                      <TouchableOpacity
                        onPress={() => updateBookingDispatch({ id: b.id, status: "in_transit" })}
                        style={styles.transitBtn}
                      >
                        <Text style={styles.transitBtnText}>Set In Transit</Text>
                      </TouchableOpacity>
                    )}

                    {b.status === "in_transit" && (
                      <TouchableOpacity
                        onPress={() => updateBookingDispatch({ id: b.id, status: "delivered" })}
                        style={styles.deliverBtn}
                      >
                        <Text style={styles.deliverBtnText}>Mark Delivered ✓</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* 4. CUSTOMERS TAB */}
        {activeTab === "customers" && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Registered Customers ({customers.length})</Text>
                <Text style={styles.sectionDesc}>Customers registered on the web portal</Text>
              </View>
            </View>

            {customers.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={styles.emptyTitle}>No registered customers</Text>
                <Text style={styles.emptyDesc}>Customers sign in on the web to view their live consignments.</Text>
              </View>
            ) : (
              customers.map((c) => (
                <View key={c.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.customerName}>{c.name}</Text>
                    <Text style={styles.customerDate}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${c.phone}`)}>
                    <Text style={styles.customerPhone}>📞 {c.phone} (Tap to call)</Text>
                  </TouchableOpacity>

                  {c.email ? <Text style={styles.customerSub}>✉️ {c.email}</Text> : null}
                  {c.city ? <Text style={styles.customerSub}>📍 {c.city}</Text> : null}
                </View>
              ))
            )}
          </View>
        )}

        {/* 5. PARTNER VEHICLE REGISTRATIONS TAB */}
        {activeTab === "registrations" && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Partner Applications ({registrations.length})</Text>
                <Text style={styles.sectionDesc}>Lorry owners requesting to join the fleet</Text>
              </View>
            </View>

            {registrations.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No partner applications</Text>
              </View>
            ) : (
              registrations.map((r) => (
                <View key={r.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardPlate}>{r.vehicleNumber}</Text>
                    <View style={styles.statusBadgeSmall}>
                      <Text style={styles.statusBadgeSmallText}>{r.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.ownerNameText}>Owner: {r.ownerName}</Text>
                  <Text style={styles.driverCardDetail}>🚚 {r.vehicleType} • Capacity: {r.capacity} • {r.province}</Text>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${r.phone}`)}
                      style={styles.callBtn}
                    >
                      <Text style={styles.callBtnText}>📞 Call {r.phone}</Text>
                    </TouchableOpacity>

                    {r.status === "pending" && (
                      <TouchableOpacity
                        onPress={async () => {
                          await updateRegistrationStatus(r.id, "approved");
                          // Also register into fleet
                          await registerNewDriver({
                            name: r.ownerName,
                            phone: r.phone,
                            plate: r.vehicleNumber,
                            vehicleType: r.vehicleType,
                            route: `${r.province} – Island-wide`,
                          });
                          Alert.alert("Approved", `${r.vehicleNumber} approved and enrolled into Fleet!`);
                          loadAllData();
                        }}
                        style={styles.actionBtnYellow}
                      >
                        <Text style={styles.actionBtnYellowText}>Approve & Enroll</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* 6. INQUIRIES TAB */}
        {activeTab === "inquiries" && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Customer Inquiries ({inquiries.length})</Text>
                <Text style={styles.sectionDesc}>Messages from the website contact page</Text>
              </View>
            </View>

            {inquiries.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No inquiries</Text>
              </View>
            ) : (
              inquiries.map((inq) => (
                <View key={inq.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.inqSubject}>{inq.subject}</Text>
                    <View style={inq.status === "resolved" ? styles.statusBadgeEmpty : styles.statusBadgeTrip}>
                      <Text style={inq.status === "resolved" ? styles.statusTextEmpty : styles.statusTextTrip}>
                        {inq.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.inqFromText}>From: {inq.name} ({inq.phone})</Text>
                  <Text style={styles.inqMessageText}>"{inq.message}"</Text>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${inq.phone}`)} style={styles.callBtn}>
                      <Text style={styles.callBtnText}>📞 Call Customer</Text>
                    </TouchableOpacity>
                    {inq.status === "unread" && (
                      <TouchableOpacity
                        onPress={async () => {
                          await updateInquiryStatus(inq.id, "resolved");
                          loadAllData();
                        }}
                        style={styles.btnOutline}
                      >
                        <Text style={styles.btnOutlineText}>Mark Resolved</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* 7. REVIEWS TAB */}
        {activeTab === "reviews" && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Customer Testimonials ({reviews.length})</Text>
                <Text style={styles.sectionDesc}>Ratings submitted via the web platform</Text>
              </View>
            </View>

            {reviews.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>⭐</Text>
                <Text style={styles.emptyTitle}>No reviews yet</Text>
              </View>
            ) : (
              reviews.map((rev) => (
                <View key={rev.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.revAuthor}>{rev.name}</Text>
                    <Text style={styles.revStars}>{"★".repeat(rev.rating)}</Text>
                  </View>
                  <Text style={styles.revComment}>"{rev.comment}"</Text>
                  <Text style={styles.revService}>Service: {rev.service}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* MODAL 1: REGISTER DRIVER */}
      <Modal visible={driverModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Register New Driver</Text>
            <Text style={styles.modalSubtitle}>Auto-generates an official Driver ID</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Driver Full Name *"
              value={newDriverName}
              onChangeText={setNewDriverName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Mobile Phone Number *"
              keyboardType="phone-pad"
              value={newDriverPhone}
              onChangeText={setNewDriverPhone}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Vehicle Plate (e.g. WP-ND-8942) *"
              autoCapitalize="characters"
              value={newDriverPlate}
              onChangeText={setNewDriverPlate}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Vehicle Type (e.g. 14ft Closed)"
              value={newDriverVehicleType}
              onChangeText={setNewDriverVehicleType}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Route (e.g. Colombo – Kandy)"
              value={newDriverRoute}
              onChangeText={setNewDriverRoute}
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity onPress={() => setDriverModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRegisterDriver}
                disabled={submittingDriver}
                style={styles.modalSubmitBtn}
              >
                {submittingDriver ? (
                  <ActivityIndicator color="#26231B" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Create Driver</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: SUCCESS GENERATED DRIVER ID */}
      <Modal visible={idModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { alignItems: "center" }]}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🎉</Text>
            <Text style={styles.modalTitle}>Driver Enrolled!</Text>
            <Text style={styles.modalSubtitle}>Give this Login ID to the driver:</Text>

            <View style={styles.idDisplayBox}>
              <Text style={styles.idDisplayText}>{generatedId}</Text>
            </View>

            <Text style={styles.idNoticeText}>
              The driver can log in using this ID on their phone to broadcast live GPS telemetry.
            </Text>

            <TouchableOpacity onPress={() => setIdModalVisible(false)} style={styles.modalSubmitBtn}>
              <Text style={styles.modalSubmitBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: ADD VEHICLE TO FLEET */}
      <Modal visible={lorryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Vehicle to Fleet</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Vehicle Plate (e.g. WP-CAA-5566) *"
              autoCapitalize="characters"
              value={newLorryPlate}
              onChangeText={setNewLorryPlate}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Route (e.g. Colombo – Galle) *"
              value={newLorryRoute}
              onChangeText={setNewLorryRoute}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Assigned Driver Name"
              value={newLorryDriverName}
              onChangeText={setNewLorryDriverName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Vehicle Type (e.g. 14ft Isuzu Lorry)"
              value={newLorryType}
              onChangeText={setNewLorryType}
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity onPress={() => setLorryModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddLorry} style={styles.modalSubmitBtn}>
                <Text style={styles.modalSubmitBtnText}>Add to Fleet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: ASSIGN DRIVER TO BOOKING */}
      <Modal visible={assignModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Assign Lorry to Booking</Text>
            <Text style={styles.modalSubtitle}>
              {selectedBooking?.pickupCity} ➔ {selectedBooking?.deliveryCity} ({selectedBooking?.customerName})
            </Text>

            <ScrollView style={{ maxHeight: 250, marginVertical: 10 }}>
              {drivers.length === 0 ? (
                <Text style={{ textAlign: "center", color: "#666", padding: 20 }}>
                  No drivers available. Register a driver first.
                </Text>
              ) : (
                drivers.map((d) => (
                  <TouchableOpacity
                    key={d.driverId}
                    onPress={() => handleAssignDriverToBooking(d)}
                    style={styles.assignDriverItem}
                  >
                    <View>
                      <Text style={styles.assignDriverName}>{d.name}</Text>
                      <Text style={styles.assignDriverSub}>{d.plate} • {d.vehicleType}</Text>
                    </View>
                    <Text style={styles.assignDriverBtnText}>Assign ➔</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity onPress={() => setAssignModalVisible(false)} style={styles.modalCancelBtn}>
              <Text style={styles.modalCancelBtnText}>Close</Text>
            </TouchableOpacity>
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
    backgroundColor: "#FFD000",
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#E2B800",
  },
  adminBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    backgroundColor: "#26231B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: "#FFD000",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#137333",
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#26231B",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#C51616",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#26231B",
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refreshBtn: {
    backgroundColor: "rgba(38,35,27,0.12)",
    padding: 8,
    borderRadius: 8,
  },
  refreshBtnText: {
    fontSize: 14,
  },
  logoutBtn: {
    backgroundColor: "#26231B",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: "#FFD000",
    fontSize: 11,
    fontWeight: "800",
  },
  tabBarContainer: {
    backgroundColor: "#EDE9DF",
    borderBottomWidth: 1,
    borderBottomColor: "#DED9CB",
  },
  tabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DED9CB",
  },
  tabItemActive: {
    backgroundColor: "#26231B",
    borderColor: "#26231B",
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#26231B",
  },
  tabItemTextActive: {
    color: "#FFD000",
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 14,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#26231B",
  },
  sectionDesc: {
    fontSize: 11,
    color: "#666",
    marginTop: 1,
  },
  actionBtnYellow: {
    backgroundColor: "#FFD000",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2B800",
  },
  actionBtnYellowText: {
    color: "#26231B",
    fontSize: 11,
    fontWeight: "900",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E6E2D8",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardPlate: {
    fontSize: 15,
    fontWeight: "900",
    color: "#26231B",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  cardRoute: {
    fontSize: 11,
    color: "#666",
  },
  statusBadgeEmpty: {
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTextEmpty: {
    fontSize: 9,
    fontWeight: "800",
    color: "#137333",
  },
  statusBadgeTrip: {
    backgroundColor: "#E8F0FE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTextTrip: {
    fontSize: 9,
    fontWeight: "800",
    color: "#1A73E8",
  },
  driverInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  driverInfoLabel: {
    fontSize: 11,
    color: "#888",
  },
  driverInfoValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#26231B",
  },
  telemetryBox: {
    backgroundColor: "#FDFBE8",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F4ECB8",
  },
  telemetryTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#5B4300",
    marginBottom: 2,
  },
  telemetryCoords: {
    fontSize: 11,
    color: "#26231B",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  telemetrySpeed: {
    fontSize: 10,
    color: "#5B4300",
    marginTop: 2,
    fontWeight: "600",
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  btnOutline: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D0CCC0",
    backgroundColor: "#F9F8F5",
  },
  btnOutlineText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#26231B",
  },
  btnDanger: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#FEECEB",
  },
  btnDangerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C51616",
  },
  driverIdBadge: {
    backgroundColor: "#FDFBE8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#F4ECB8",
  },
  driverIdBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#5B4300",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  driverPlate: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26231B",
  },
  driverCardName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#26231B",
    marginTop: 4,
  },
  driverCardDetail: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  driverActionsRow: {
    marginTop: 10,
  },
  callBtn: {
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  callBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#137333",
  },
  bookingIdBadge: {
    backgroundColor: "#EDE9DF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bookingIdText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#26231B",
  },
  statusBadgeSmall: {
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeSmallText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#137333",
  },
  bookingCustomerText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26231B",
    marginTop: 4,
  },
  bookingPhoneText: {
    fontSize: 11,
    color: "#137333",
    fontWeight: "700",
    marginTop: 1,
  },
  bookingRouteBox: {
    backgroundColor: "#F9F8F5",
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  bookingRouteText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#26231B",
  },
  bookingSubDetail: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  bookingPackageText: {
    fontSize: 10,
    color: "#5B4300",
    marginTop: 2,
  },
  assignedBox: {
    backgroundColor: "#E8F0FE",
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  assignedTitle: {
    fontSize: 10,
    color: "#1A73E8",
    fontWeight: "700",
  },
  assignedValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1A73E8",
  },
  bookingActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  assignBtn: {
    backgroundColor: "#FFD000",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  assignBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#26231B",
  },
  transitBtn: {
    backgroundColor: "#1A73E8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  transitBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  deliverBtn: {
    backgroundColor: "#137333",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deliverBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  customerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#26231B",
  },
  customerDate: {
    fontSize: 10,
    color: "#888",
  },
  customerPhone: {
    fontSize: 12,
    color: "#137333",
    fontWeight: "700",
    marginTop: 2,
  },
  customerSub: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  ownerNameText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26231B",
    marginTop: 4,
  },
  inqSubject: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26231B",
  },
  inqFromText: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  inqMessageText: {
    fontSize: 12,
    color: "#26231B",
    fontStyle: "italic",
    marginTop: 4,
  },
  revAuthor: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26231B",
  },
  revStars: {
    fontSize: 12,
    color: "#FF9900",
  },
  revComment: {
    fontSize: 12,
    color: "#26231B",
    fontStyle: "italic",
    marginTop: 4,
  },
  revService: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E6E2D8",
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#26231B",
  },
  emptyDesc: {
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#26231B",
  },
  modalSubtitle: {
    fontSize: 11,
    color: "#666",
    marginBottom: 12,
    marginTop: 2,
  },
  modalInput: {
    backgroundColor: "#F4F2EA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#26231B",
    marginBottom: 10,
  },
  modalActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCancelBtnText: {
    color: "#666",
    fontWeight: "700",
    fontSize: 12,
  },
  modalSubmitBtn: {
    backgroundColor: "#FFD000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSubmitBtnText: {
    color: "#26231B",
    fontWeight: "900",
    fontSize: 12,
  },
  idDisplayBox: {
    backgroundColor: "#FDFBE8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F4ECB8",
    marginVertical: 12,
  },
  idDisplayText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#5B4300",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  idNoticeText: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  assignDriverItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F4F2EA",
    borderRadius: 8,
    marginBottom: 8,
  },
  assignDriverName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26231B",
  },
  assignDriverSub: {
    fontSize: 10,
    color: "#666",
  },
  assignDriverBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#137333",
  },
});
