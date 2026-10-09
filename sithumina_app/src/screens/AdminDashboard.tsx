import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  subscribeAdminLorries,
  LorryRecord,
  registerNewDriver,
  registerCustomRider,
} from "../services/database";
import { SriLankaMapViewer } from "../components/SriLankaMapViewer";

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = "dash" | "riders" | "veh" | "req" | "rev" | "money" | "map" | "settings";

export interface AppBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  target: "all" | "riders" | "customers";
  isActive: boolean;
  createdAt: number;
}

interface LocalRider {
  name: string;
  id: string;
  phone: string;
  vehicle: string;
  status: 0 | 1;
}

interface LocalVehicle {
  plate: string;
  type: string;
  capacity: string;
  rider: string;
  status: "On trip" | "Empty";
}

interface LocalRequest {
  id: string;
  customer: string;
  from: string;
  to: string;
  load: string;
  vehicle: string;
  status: "p" | "a" | "r";
}

interface LocalReview {
  name: string;
  rating: number;
  text: string;
  date: string;
}

export interface LiveMapLorry {
  id: string;
  plate: string;
  route: string;
  driverName: string;
  driverPhone?: string;
  status: "On trip" | "Empty";
  lat: number;
  lng: number;
  speedKmH: number;
  heading: number;
  isOnline: boolean;
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

// Sri Lanka Reference Cities with accurate coordinates
const SRI_LANKA_CITIES = [
  { name: "Jaffna", lat: 9.6615, lng: 80.0255 },
  { name: "Anuradhapura", lat: 8.3114, lng: 80.4037 },
  { name: "Trincomalee", lat: 8.5874, lng: 81.2152 },
  { name: "Dambulla", lat: 7.8742, lng: 80.6511 },
  { name: "Kurunegala", lat: 7.4863, lng: 80.3623 },
  { name: "Kandy", lat: 7.2906, lng: 80.6337 },
  { name: "Colombo", lat: 6.9271, lng: 79.8612 },
  { name: "Badulla", lat: 6.9934, lng: 81.055 },
  { name: "Galle", lat: 6.0535, lng: 80.221 },
  { name: "Matara", lat: 5.9549, lng: 80.555 },
];

/**
 * GPS projection function mapping real Sri Lanka coordinates to percentage positions
 */
function getSriLankaCoord(lat: number, lng: number) {
  const minLat = 5.85;
  const maxLat = 9.85;
  const minLng = 79.6;
  const maxLng = 81.95;

  const validLat = Number.isFinite(lat) && lat >= 5.5 && lat <= 10.5 ? lat : 6.9271;
  const validLng = Number.isFinite(lng) && lng >= 79.0 && lng <= 82.5 ? lng : 79.8612;

  const left = Math.max(5, Math.min(88, ((validLng - minLng) / (maxLng - minLng)) * 100));
  const top = Math.max(5, Math.min(88, ((maxLat - validLat) / (maxLat - minLat)) * 100));

  return { left, top };
}

// Initial Prototype Data: Only Rider R-1001 (Nuwan Perera), all fake test data removed
const INITIAL_RIDERS: LocalRider[] = [
  { name: "Nuwan Perera", id: "R-1001", phone: "077 234 5678", vehicle: "WP LB-4521", status: 1 },
];

const INITIAL_VEHICLES: LocalVehicle[] = [
  { plate: "WP LB-4521", type: "Lorry 10ft", capacity: "3 t", rider: "Nuwan Perera", status: "Empty" },
];

const INITIAL_REQUESTS: LocalRequest[] = [];

const INITIAL_REVIEWS: LocalReview[] = [];

// Lorries appear ONLY when real riders start broadcasting live
const INITIAL_LORRIES: LiveMapLorry[] = [];

const REVENUE_DATA = {
  w: [
    { label: "Mon", val: 0 },
    { label: "Tue", val: 0 },
    { label: "Wed", val: 0 },
    { label: "Thu", val: 0 },
    { label: "Fri", val: 0 },
    { label: "Sat", val: 0, max: true },
    { label: "Sun", val: 0 },
  ],
  m: [
    { label: "W1", val: 0 },
    { label: "W2", val: 0 },
    { label: "W3", val: 0 },
    { label: "W4", val: 0, max: true },
  ],
  y: [
    { label: "J", val: 0 },
    { label: "F", val: 0 },
    { label: "M", val: 0 },
    { label: "A", val: 0 },
    { label: "M", val: 0 },
    { label: "J", val: 0 },
    { label: "J", val: 0 },
    { label: "A", val: 0 },
    { label: "S", val: 0 },
    { label: "O", val: 0, max: true },
    { label: "N", val: 0 },
    { label: "D", val: 0 },
  ],
};

const TOTALS = {
  w: "LKR 0",
  m: "LKR 0",
  y: "LKR 0",
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>("dash");
  const [riders, setRiders] = useState<LocalRider[]>(INITIAL_RIDERS);
  const [vehicles, setVehicles] = useState<LocalVehicle[]>(INITIAL_VEHICLES);
  const [requests, setRequests] = useState<LocalRequest[]>(INITIAL_REQUESTS);
  const [reviews, setReviews] = useState<LocalReview[]>(INITIAL_REVIEWS);
  const [lorries, setLorries] = useState<LiveMapLorry[]>(INITIAL_LORRIES);

  // Filter and secondary states
  const [reqTab, setReqTab] = useState<"p" | "a" | "r">("p");
  const [revFilterStar, setRevFilterStar] = useState<number>(0);
  const [revenuePeriod, setRevenuePeriod] = useState<"w" | "m" | "y">("w");
  const [mapFilter, setMapFilter] = useState<"all" | "Empty" | "On trip">("all");
  const [selectedLorry, setSelectedLorry] = useState<string>("WP LB-4521");

  // Modals
  const [addRiderModal, setAddRiderModal] = useState(false);
  const [addVehicleModal, setAddVehicleModal] = useState(false);
  const [addBannerModal, setAddBannerModal] = useState(false);

  // Banner States & Storage
  const [banners, setBanners] = useState<AppBanner[]>([]);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSub, setBannerSub] = useState("");
  const [bannerTag, setBannerTag] = useState("PROMO");
  const [bannerTarget, setBannerTarget] = useState<"all" | "riders" | "customers">("all");
  const [bannerActive, setBannerActive] = useState(true);

  // Load saved banners on mount
  useEffect(() => {
    AsyncStorage.getItem("@sithumina_app_banners").then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setBanners(parsed);
          }
        } catch {}
      }
    });
  }, []);

  const handleSaveBanner = async () => {
    if (!bannerTitle.trim()) {
      showToast("Please enter banner title");
      return;
    }
    const newBanner: AppBanner = {
      id: `banner-${Date.now()}`,
      title: bannerTitle.trim(),
      subtitle: bannerSub.trim(),
      tag: bannerTag.trim().toUpperCase() || "PROMO",
      target: bannerTarget,
      isActive: bannerActive,
      createdAt: Date.now(),
    };
    const updated = [newBanner, ...banners];
    setBanners(updated);
    await AsyncStorage.setItem("@sithumina_app_banners", JSON.stringify(updated));
    setAddBannerModal(false);
    setBannerTitle("");
    setBannerSub("");
    setBannerTag("PROMO");
    showToast("Banner added successfully!");
  };

  const handleDeleteBanner = async (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    setBanners(updated);
    await AsyncStorage.setItem("@sithumina_app_banners", JSON.stringify(updated));
    showToast("Banner deleted");
  };

  const handleToggleBanner = async (id: string) => {
    const updated = banners.map((b) =>
      b.id === id ? { ...b, isActive: !b.isActive } : b
    );
    setBanners(updated);
    await AsyncStorage.setItem("@sithumina_app_banners", JSON.stringify(updated));
  };

  // Form states
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [riderNic, setRiderNic] = useState("");
  const [riderId, setRiderId] = useState("");

  const [vehPlate, setVehPlate] = useState("");
  const [vehType, setVehType] = useState("Lorry 10ft");
  const [vehCap, setVehCap] = useState("3");
  const [vehRider, setVehRider] = useState("Nuwan Perera");

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2400);
  };

  // Real-time Firestore subscription: Live GPS broadcasted from mobile drivers
  useEffect(() => {
    const unsubscribe = subscribeAdminLorries((firestoreLorries) => {
      if (firestoreLorries && firestoreLorries.length > 0) {
        setLorries((prev) => {
          const updated = [...prev];
          firestoreLorries.forEach((fl) => {
            const idx = updated.findIndex((u) => u.plate === fl.plate || u.id === fl.id);
            const mapped: LiveMapLorry = {
              id: fl.id,
              plate: fl.plate || "WP LK-XXXX",
              route: fl.route || "Live Route",
              driverName: fl.driverName || "Driver",
              driverPhone: fl.driverPhone || "",
              status: fl.status === "on_trip" ? "On trip" : "Empty",
              lat: fl.lat || 6.9271,
              lng: fl.lng || 79.8612,
              speedKmH: fl.speedKmH || 0,
              heading: fl.heading || 0,
              isOnline: true,
              startLocation: fl.startLocation || "",
              endLocation: fl.endLocation || "",
              travelRoute: fl.travelRoute || "",
              emptyTime: fl.emptyTime || "",
              returnRoute: fl.returnRoute || "",
              finalDestination: fl.finalDestination || "",
              availableSpace: fl.availableSpace || "",
              availableCapacityKg: fl.availableCapacityKg || "",
              hasFreezer: !!fl.hasFreezer,
              hasHelper: !!fl.hasHelper,
            };
            if (idx >= 0) {
              updated[idx] = mapped;
            } else {
              updated.push(mapped);
            }
          });
          return updated;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const pendingCount = requests.filter((r) => r.status === "p").length;

  const handleApproveReject = (id: string, newStatus: "a" | "r") => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    showToast(newStatus === "a" ? "Request approved" : "Request rejected");
  };

  const handleSaveRider = async () => {
    if (!riderName.trim() || !riderPhone.trim() || !riderId.trim()) {
      showToast("Please enter Name, Phone and Rider ID");
      return;
    }
    const cleanRiderId = riderId.trim().toUpperCase();
    if (riders.some((r) => r.id.toUpperCase() === cleanRiderId)) {
      showToast("Rider ID already exists");
      return;
    }

    try {
      // Register into database and local cache so rider can log in immediately from main login
      await registerCustomRider({
        driverId: cleanRiderId,
        name: riderName.trim(),
        phone: riderPhone.trim(),
        nic: riderNic.trim(),
      });

      const newR: LocalRider = {
        name: riderName.trim(),
        id: cleanRiderId,
        phone: riderPhone.trim(),
        vehicle: "—",
        status: 1,
      };
      setRiders([newR, ...riders]);
      setAddRiderModal(false);
      setRiderName("");
      setRiderPhone("");
      setRiderNic("");
      setRiderId("");
      showToast(`Rider ${cleanRiderId} added! Can log in now.`);
    } catch {
      showToast("Registration failed. Please try again.");
    }
  };

  const handleSaveVehicle = () => {
    if (!vehPlate.trim()) {
      showToast("Please enter plate number");
      return;
    }
    const newV: LocalVehicle = {
      plate: vehPlate.trim().toUpperCase(),
      type: vehType,
      capacity: `${vehCap} t`,
      rider: vehRider,
      status: "Empty",
    };
    setVehicles([newV, ...vehicles]);
    setAddVehicleModal(false);
    setVehPlate("");
    showToast(`Vehicle ${newV.plate} added`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const selectedLorryObj = lorries.find((l) => l.plate === selectedLorry) || lorries[0];

  return (
    <View style={styles.container}>
      {/* 1. Top Header Bar (#26231B Dark Ink) */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandTitle}>Sithumina Transport</Text>
            <Text style={styles.brandSub}>Admin console</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Horizontal Scrollable Navigation Tab Strip */}
      <View style={styles.navBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navScroll}
        >
          <TouchableOpacity
            style={[styles.navItem, activeTab === "dash" && styles.navItemActive]}
            onPress={() => setActiveTab("dash")}
          >
            <Text style={[styles.navText, activeTab === "dash" && styles.navTextActive]}>
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === "riders" && styles.navItemActive]}
            onPress={() => setActiveTab("riders")}
          >
            <Text style={[styles.navText, activeTab === "riders" && styles.navTextActive]}>
              Riders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === "veh" && styles.navItemActive]}
            onPress={() => setActiveTab("veh")}
          >
            <Text style={[styles.navText, activeTab === "veh" && styles.navTextActive]}>
              Vehicles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === "req" && styles.navItemActive]}
            onPress={() => setActiveTab("req")}
          >
            <Text style={[styles.navText, activeTab === "req" && styles.navTextActive]}>
              Vehicle requests
            </Text>
            {pendingCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === "rev" && styles.navItemActive]}
            onPress={() => setActiveTab("rev")}
          >
            <Text style={[styles.navText, activeTab === "rev" && styles.navTextActive]}>
              Reviews
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === "money" && styles.navItemActive]}
            onPress={() => setActiveTab("money")}
          >
            <Text style={[styles.navText, activeTab === "money" && styles.navTextActive]}>
              Revenue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === "map" && styles.navItemActive]}
            onPress={() => setActiveTab("map")}
          >
            <Text style={[styles.navText, activeTab === "map" && styles.navTextActive]}>
              Live map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === "settings" && styles.navItemActive]}
            onPress={() => setActiveTab("settings")}
          >
            <Text style={[styles.navText, activeTab === "settings" && styles.navTextActive]}>
              Settings ⚙️
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. Main Content Screen Container */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dash" && (
          <View style={styles.tabSection}>
            {/* 4 KPI Cards Grid - Clickable Navigation */}
            <View style={styles.kpiGrid}>
              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.7}
                onPress={() => setActiveTab("map")}
              >
                <View style={styles.kpiHeader}>
                  <View style={styles.kpiIconBox}><Text style={styles.kpiIcon}>🚛</Text></View>
                  <Text style={styles.kpiLabel}>Live lorries</Text>
                </View>
                <Text style={styles.kpiValue}>{lorries.length}</Text>
                <Text style={styles.kpiDelta}>
                  {lorries.length > 0 ? `${lorries.length} online · View map →` : "No lorries online · View map →"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.7}
                onPress={() => setActiveTab("req")}
              >
                <View style={styles.kpiHeader}>
                  <View style={styles.kpiIconBox}><Text style={styles.kpiIcon}>📋</Text></View>
                  <Text style={styles.kpiLabel}>Pending requests</Text>
                </View>
                <Text style={styles.kpiValue}>{pendingCount}</Text>
                <Text style={[styles.kpiDelta, { color: pendingCount > 0 ? "#B3121F" : "#6F6A5A" }]}>
                  {pendingCount > 0 ? "Needs action →" : "All cleared"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.7}
                onPress={() => setActiveTab("riders")}
              >
                <View style={styles.kpiHeader}>
                  <View style={styles.kpiIconBox}><Text style={styles.kpiIcon}>👥</Text></View>
                  <Text style={styles.kpiLabel}>Active riders</Text>
                </View>
                <Text style={styles.kpiValue}>{riders.filter((r) => r.status === 1).length}</Text>
                <Text style={styles.kpiDelta}>View all →</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.7}
                onPress={() => setActiveTab("money")}
              >
                <View style={styles.kpiHeader}>
                  <View style={styles.kpiIconBox}><Text style={styles.kpiIcon}>💰</Text></View>
                  <Text style={styles.kpiLabel}>Revenue today</Text>
                </View>
                <Text style={styles.kpiValue}>LKR 0</Text>
                <Text style={styles.kpiDelta}>View revenue →</Text>
              </TouchableOpacity>
            </View>

            {/* Revenue this week chart card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Revenue this week</Text>
                <TouchableOpacity onPress={() => setActiveTab("money")}>
                  <Text style={styles.viewAllLink}>View all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chartContainer}>
                {REVENUE_DATA.w.map((item, idx) => (
                  <View key={idx} style={styles.chartBarCol}>
                    <Text style={styles.chartBarVal}>{item.val}K</Text>
                    <View
                      style={[
                        styles.chartBar,
                        { height: (item.val / 88) * 110 },
                        item.max && styles.chartBarMax,
                      ]}
                    />
                    <Text style={styles.chartBarLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Mini Live Map Card with Sri Lanka Map */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Sri Lanka Live Map</Text>
                <TouchableOpacity onPress={() => setActiveTab("map")}>
                  <Text style={styles.viewAllLink}>Open full map</Text>
                </TouchableOpacity>
              </View>

              {/* Real OpenStreetMap Sri Lanka Mini Map */}
              <SriLankaMapViewer
                lorries={lorries}
                height={220}
                isMiniMap={true}
                onSelectLorry={(p) => {
                  setSelectedLorry(p);
                  setActiveTab("map");
                }}
              />
            </View>

            {/* Pending Requests List */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Pending requests</Text>
                <TouchableOpacity onPress={() => setActiveTab("req")}>
                  <Text style={styles.viewAllLink}>View all</Text>
                </TouchableOpacity>
              </View>
              {requests.filter((r) => r.status === "p").slice(0, 3).map((rq) => (
                <View key={rq.id} style={styles.requestItem}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{getInitials(rq.customer)}</Text>
                  </View>
                  <View style={styles.requestItemContent}>
                    <Text style={styles.requestCustomer}>{rq.customer}</Text>
                    <Text style={styles.requestRoute}>
                      {rq.from} → {rq.to} · {rq.load} · {rq.vehicle}
                    </Text>
                  </View>
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApproveReject(rq.id, "a")}
                    >
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleApproveReject(rq.id, "r")}
                    >
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Latest Reviews Card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Latest reviews</Text>
                <TouchableOpacity onPress={() => setActiveTab("rev")}>
                  <Text style={styles.viewAllLink}>View all</Text>
                </TouchableOpacity>
              </View>
              {reviews.slice(0, 3).map((rv, i) => (
                <View key={i} style={styles.reviewItem}>
                  <View style={styles.reviewItemHeader}>
                    <Text style={styles.reviewAuthor}>{rv.name}</Text>
                    <Text style={styles.reviewStars}>{"★".repeat(rv.rating)}</Text>
                    <Text style={styles.reviewDate}>{rv.date}</Text>
                  </View>
                  <Text style={styles.reviewText}>{rv.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TAB 2: RIDERS */}
        {activeTab === "riders" && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{riders.length} riders</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  setRiderName("");
                  setRiderPhone("");
                  setRiderNic("");
                  setRiderId(`R-${1001 + riders.length}`);
                  setAddRiderModal(true);
                }}
              >
                <Text style={styles.addBtnText}>+ Add rider</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              {riders.map((r, i) => (
                <View key={i} style={styles.tableRow}>
                  <View style={styles.riderAvatar}>
                    <Text style={styles.riderAvatarText}>{getInitials(r.name)}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.riderName}>{r.name}</Text>
                    <Text style={styles.riderMeta}>
                      📞 {r.phone} {r.vehicle && r.vehicle !== "—" ? `· 🚚 ${r.vehicle}` : ""}
                    </Text>
                    <Text style={styles.riderPlate}>🔑 Login ID: {r.id}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      r.status === 1 ? styles.statusPillOk : styles.statusPillMuted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        r.status === 1 ? styles.statusPillTextOk : styles.statusPillTextMuted,
                      ]}
                    >
                      {r.status === 1 ? "Active" : "Offline"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TAB 3: VEHICLES */}
        {activeTab === "veh" && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{vehicles.length} vehicles</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setAddVehicleModal(true)}
              >
                <Text style={styles.addBtnText}>+ Add vehicle</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              {vehicles.map((v, i) => (
                <View key={i} style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text style={styles.vehPlate}>{v.plate}</Text>
                    <Text style={styles.vehType}>
                      {v.type} · Capacity: {v.capacity}
                    </Text>
                    <Text style={styles.vehRider}>👤 {v.rider}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      v.status === "Empty" ? styles.statusPillOk : styles.statusPillWarning,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        v.status === "Empty" ? styles.statusPillTextOk : styles.statusPillTextWarning,
                      ]}
                    >
                      {v.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TAB 4: VEHICLE REQUESTS */}
        {activeTab === "req" && (
          <View style={styles.tabSection}>
            {/* Filter Tabs */}
            <View style={styles.subTabsRow}>
              <TouchableOpacity
                style={[styles.subTab, reqTab === "p" && styles.subTabActive]}
                onPress={() => setReqTab("p")}
              >
                <Text style={[styles.subTabText, reqTab === "p" && styles.subTabTextActive]}>
                  Pending ({requests.filter((r) => r.status === "p").length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subTab, reqTab === "a" && styles.subTabActive]}
                onPress={() => setReqTab("a")}
              >
                <Text style={[styles.subTabText, reqTab === "a" && styles.subTabTextActive]}>
                  Approved ({requests.filter((r) => r.status === "a").length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subTab, reqTab === "r" && styles.subTabActive]}
                onPress={() => setReqTab("r")}
              >
                <Text style={[styles.subTabText, reqTab === "r" && styles.subTabTextActive]}>
                  Rejected ({requests.filter((r) => r.status === "r").length})
                </Text>
              </TouchableOpacity>
            </View>

            {requests
              .filter((r) => r.status === reqTab)
              .map((rq) => (
                <View key={rq.id} style={styles.card}>
                  <View style={styles.requestCardRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{getInitials(rq.customer)}</Text>
                    </View>
                    <View style={styles.requestCardContent}>
                      <Text style={styles.requestCustomer}>{rq.customer}</Text>
                      <Text style={styles.requestRouteDetail}>
                        {rq.from} → {rq.to}
                      </Text>
                      <Text style={styles.requestMeta}>
                        📦 {rq.load} · 🚚 {rq.vehicle}
                      </Text>
                    </View>
                  </View>

                  {rq.status === "p" ? (
                    <View style={styles.requestActionRow}>
                      <TouchableOpacity
                        style={styles.approveLargeBtn}
                        onPress={() => handleApproveReject(rq.id, "a")}
                      >
                        <Text style={styles.approveLargeBtnText}>Approve Request</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectLargeBtn}
                        onPress={() => handleApproveReject(rq.id, "r")}
                      >
                        <Text style={styles.rejectLargeBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.statusPill,
                        rq.status === "a" ? styles.statusPillOk : styles.statusPillRed,
                        { alignSelf: "flex-start", marginTop: 10 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          rq.status === "a" ? styles.statusPillTextOk : styles.statusPillTextRed,
                        ]}
                      >
                        {rq.status === "a" ? "Approved" : "Rejected"}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
          </View>
        )}

        {/* TAB 5: REVIEWS */}
        {activeTab === "rev" && (
          <View style={styles.tabSection}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Average rating</Text>
              <Text style={styles.kpiValue}>
                4.2 <Text style={{ color: "#E9A800" }}>★</Text>
              </Text>
              <Text style={styles.kpiDelta}>{reviews.length} customer reviews</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rating breakdown</Text>
              {[5, 4, 3, 2, 1].map((s) => {
                const count = reviews.filter((r) => r.rating === s).length;
                const pct = (count / reviews.length) * 100;
                return (
                  <View key={s} style={styles.starBarRow}>
                    <Text style={styles.starBarLabel}>{s} ★</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={styles.starBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {[0, 5, 4, 3, 2, 1].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.filterPill, revFilterStar === s && styles.filterPillActive]}
                  onPress={() => setRevFilterStar(s)}
                >
                  <Text style={[styles.filterPillText, revFilterStar === s && styles.filterPillTextActive]}>
                    {s === 0 ? "All" : `${s} ★`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.card}>
              {reviews
                .filter((r) => !revFilterStar || r.rating === revFilterStar)
                .map((rv, i) => (
                  <View key={i} style={styles.reviewItem}>
                    <View style={styles.reviewItemHeader}>
                      <Text style={styles.reviewAuthor}>{rv.name}</Text>
                      <Text style={styles.reviewStars}>{"★".repeat(rv.rating)}</Text>
                      <Text style={styles.reviewDate}>{rv.date}</Text>
                    </View>
                    <Text style={styles.reviewText}>{rv.text}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* TAB 6: REVENUE */}
        {activeTab === "money" && (
          <View style={styles.tabSection}>
            <View style={styles.subTabsRow}>
              {(["w", "m", "y"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.subTab, revenuePeriod === p && styles.subTabActive]}
                  onPress={() => setRevenuePeriod(p)}
                >
                  <Text style={[styles.subTabText, revenuePeriod === p && styles.subTabTextActive]}>
                    {p === "w" ? "Week" : p === "m" ? "Month" : "Year"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Total revenue</Text>
                <Text style={styles.kpiValue}>{TOTALS[revenuePeriod]}</Text>
                <Text style={styles.kpiDelta}>+8% vs last period</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Completed trips</Text>
                <Text style={styles.kpiValue}>
                  {revenuePeriod === "w" ? "312" : revenuePeriod === "m" ? "1,280" : "14,960"}
                </Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Avg per trip</Text>
                <Text style={styles.kpiValue}>LKR 1,420</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Commission</Text>
                <Text style={styles.kpiValue}>
                  {revenuePeriod === "w" ? "LKR 44K" : revenuePeriod === "m" ? "LKR 103K" : "LKR 1.05M"}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Revenue (LKR thousands)</Text>
              <View style={styles.chartContainer}>
                {REVENUE_DATA[revenuePeriod].map((item, idx) => {
                  const maxVal = Math.max(...REVENUE_DATA[revenuePeriod].map((x) => x.val)) || 1;
                  return (
                    <View key={idx} style={styles.chartBarCol}>
                      <Text style={styles.chartBarVal}>{item.val > 0 ? `${item.val}K` : ""}</Text>
                      <View
                        style={[
                          styles.chartBar,
                          { height: (item.val / maxVal) * 120 },
                          item.max && styles.chartBarMax,
                        ]}
                      />
                      <Text style={styles.chartBarLabel}>{item.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>By vehicle type</Text>
              {[
                { type: "Lorry 20ft", pct: 38 },
                { type: "Lorry 14ft", pct: 27 },
                { type: "Lorry 10ft", pct: 22 },
                { type: "Canter", pct: 13 },
              ].map((v, i) => (
                <View key={i} style={styles.vehBreakdownRow}>
                  <Text style={styles.vehBreakdownLabel}>{v.type}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${v.pct}%` }]} />
                  </View>
                  <Text style={styles.vehBreakdownPct}>{v.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TAB 7: LIVE SRI LANKA GPS MAP */}
        {activeTab === "map" && (
          <View style={styles.tabSection}>
            {/* Filter Tabs & Real-Time Status Pill */}
            <View style={styles.mapHeaderRow}>
              <View style={styles.subTabsRow}>
                {(["all", "Empty", "On trip"] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.subTab, mapFilter === f && styles.subTabActive]}
                    onPress={() => setMapFilter(f)}
                  >
                    <Text style={[styles.subTabText, mapFilter === f && styles.subTabTextActive]}>
                      {f === "all" ? "All" : f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.livePillText}>
                  ● Live · {lorries.filter((l) => mapFilter === "all" || l.status === mapFilter).length} Online
                </Text>
              </View>
            </View>

            {/* REAL INTERACTIVE OPENSTREETMAP LEAFLET MAP OF SRI LANKA */}
            <SriLankaMapViewer
              lorries={lorries}
              selectedPlate={selectedLorry}
              filter={mapFilter}
              onSelectLorry={(p) => setSelectedLorry(p)}
              height={440}
              isMiniMap={false}
            />

            {/* INSPECTOR CARD FOR SELECTED LORRY */}
            {selectedLorryObj && (
              <View style={styles.lorryInspectorCard}>
                <View style={styles.inspectorHeader}>
                  <View style={styles.inspectorTitleCol}>
                    <Text style={styles.inspectorPlate}>{selectedLorryObj.plate}</Text>
                    <Text style={styles.inspectorRoute}>{selectedLorryObj.route}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      selectedLorryObj.status === "Empty" ? styles.statusPillOk : styles.statusPillWarning,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        selectedLorryObj.status === "Empty" ? styles.statusPillTextOk : styles.statusPillTextWarning,
                      ]}
                    >
                      {selectedLorryObj.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.inspectorGrid}>
                  <View style={styles.inspectorCol}>
                    <Text style={styles.inspectorMetaLabel}>Driver</Text>
                    <Text style={styles.inspectorMetaVal}>{selectedLorryObj.driverName}</Text>
                  </View>
                  <View style={styles.inspectorCol}>
                    <Text style={styles.inspectorMetaLabel}>Driver Phone</Text>
                    <Text style={styles.inspectorMetaVal}>{selectedLorryObj.driverPhone || "077 234 5678"}</Text>
                  </View>
                  <View style={styles.inspectorCol}>
                    <Text style={styles.inspectorMetaLabel}>Coordinates</Text>
                    <Text style={styles.inspectorMetaVal}>
                      {selectedLorryObj.lat.toFixed(3)}°N, {selectedLorryObj.lng.toFixed(3)}°E
                    </Text>
                  </View>
                </View>

                {/* Full Rider Submitted Journey Details */}
                <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#E7E2D0" }}>
                  <Text style={{ fontSize: 11, fontWeight: "800", color: "#6F6A5A", textTransform: "uppercase", marginBottom: 6 }}>
                    Rider Trip Information
                  </Text>
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 12.5, color: "#26231B" }}>
                      <Text style={{ fontWeight: "700" }}>Start Location:</Text> {selectedLorryObj.startLocation || "Colombo"}
                    </Text>
                    <Text style={{ fontSize: 12.5, color: "#26231B" }}>
                      <Text style={{ fontWeight: "700" }}>Destination:</Text> {selectedLorryObj.endLocation || selectedLorryObj.route}
                    </Text>
                    {selectedLorryObj.travelRoute ? (
                      <Text style={{ fontSize: 12.5, color: "#26231B" }}>
                        <Text style={{ fontWeight: "700" }}>Travel Route:</Text> {selectedLorryObj.travelRoute}
                      </Text>
                    ) : null}

                    {/* Loaded specific info */}
                    {selectedLorryObj.status === "On trip" ? (
                      <View style={{ marginTop: 4, gap: 4, backgroundColor: "#FFF8E6", padding: 8, borderRadius: 8 }}>
                        {selectedLorryObj.emptyTime ? (
                          <Text style={{ fontSize: 12, color: "#5B4300", fontWeight: "700" }}>
                            Est. Empty Time: {selectedLorryObj.emptyTime}
                          </Text>
                        ) : null}
                        {selectedLorryObj.returnRoute ? (
                          <Text style={{ fontSize: 12, color: "#5B4300" }}>
                            Return Route: {selectedLorryObj.returnRoute}
                          </Text>
                        ) : null}
                        {selectedLorryObj.finalDestination ? (
                          <Text style={{ fontSize: 12, color: "#5B4300" }}>
                            Final Destination: {selectedLorryObj.finalDestination}
                          </Text>
                        ) : null}
                      </View>
                    ) : (
                      /* Empty cargo specific info */
                      <View style={{ marginTop: 4, flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                        <View style={{ backgroundColor: "#EAE7DC", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ fontSize: 11, fontWeight: "800", color: "#26231B" }}>
                            Space: {selectedLorryObj.availableSpace || "Full Space"}
                          </Text>
                        </View>
                        <View style={{ backgroundColor: "#EAE7DC", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ fontSize: 11, fontWeight: "800", color: "#26231B" }}>
                            Capacity: {selectedLorryObj.availableCapacityKg || "3,000 Kg Max"}
                          </Text>
                        </View>
                        {selectedLorryObj.hasFreezer && (
                          <View style={{ backgroundColor: "#DDF3E7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: "800", color: "#12663A" }}>
                              Freezer Available
                            </Text>
                          </View>
                        )}
                        {selectedLorryObj.hasHelper && (
                          <View style={{ backgroundColor: "#DDF3E7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: "800", color: "#12663A" }}>
                              Helper Onboard
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Lorries Interactive List */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Online Fleet Lorries ({lorries.length})</Text>
              {lorries
                .filter((l) => mapFilter === "all" || l.status === mapFilter)
                .map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    style={[
                      styles.lorryListItem,
                      selectedLorry === l.plate && styles.lorryListItemSelected,
                    ]}
                    onPress={() => setSelectedLorry(l.plate)}
                  >
                    <View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={styles.lorryPlateText}>{l.plate}</Text>
                        <Text style={styles.liveTagDot}>🟢</Text>
                      </View>
                      <Text style={styles.lorryRouteText}>{l.route} · {l.driverName}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        l.status === "Empty" ? styles.statusPillOk : styles.statusPillWarning,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          l.status === "Empty" ? styles.statusPillTextOk : styles.statusPillTextWarning,
                        ]}
                      >
                        {l.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}

        {/* TAB 8: SETTINGS & BANNER MANAGEMENT */}
        {activeTab === "settings" && (
          <View style={styles.tabSection}>
            {/* Banner Management Card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.cardTitle}>Promotional & App Banners</Text>
                  <Text style={styles.cardSubText}>
                    Create announcements, offers, or service alerts for riders & customers
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addBannerBtn}
                  onPress={() => setAddBannerModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addBannerBtnText}>+ Add Banner</Text>
                </TouchableOpacity>
              </View>

              {banners.length === 0 ? (
                <View style={styles.emptyBannerState}>
                  <Text style={styles.emptyBannerIcon}>📢</Text>
                  <Text style={styles.emptyBannerTitle}>No Banners Added Yet</Text>
                  <Text style={styles.emptyBannerDesc}>
                    Add promotional banners or urgent notices. They will appear dynamically across mobile & web interfaces.
                  </Text>
                  <TouchableOpacity
                    style={styles.createFirstBannerBtn}
                    onPress={() => setAddBannerModal(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.createFirstBannerBtnText}>+ Add First Banner</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.bannersList}>
                  {banners.map((b) => (
                    <View
                      key={b.id}
                      style={[
                        styles.bannerCardItem,
                        !b.isActive && styles.bannerCardItemInactive,
                      ]}
                    >
                      <View style={styles.bannerCardHeader}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <View style={styles.bannerTagBadge}>
                            <Text style={styles.bannerTagText}>{b.tag}</Text>
                          </View>
                          <View
                            style={[
                              styles.bannerTargetBadge,
                              b.target === "riders"
                                ? styles.targetRiders
                                : b.target === "customers"
                                ? styles.targetCust
                                : styles.targetAll,
                            ]}
                          >
                            <Text style={styles.bannerTargetText}>
                              {b.target === "all"
                                ? "👥 All Users"
                                : b.target === "riders"
                                ? "🚚 Riders Only"
                                : "👤 Customers Only"}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.statusTogglePill,
                            b.isActive ? styles.statusTogglePillActive : styles.statusTogglePillInactive,
                          ]}
                          onPress={() => handleToggleBanner(b.id)}
                        >
                          <Text
                            style={[
                              styles.statusTogglePillText,
                              b.isActive ? styles.statusTogglePillTextActive : styles.statusTogglePillTextInactive,
                            ]}
                          >
                            {b.isActive ? "● Active" : "○ Inactive"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.bannerCardTitle}>{b.title}</Text>
                      {b.subtitle ? (
                        <Text style={styles.bannerCardSub}>{b.subtitle}</Text>
                      ) : null}

                      <View style={styles.bannerCardFooter}>
                        <Text style={styles.bannerDateText}>
                          Created {new Date(b.createdAt).toLocaleDateString()}
                        </Text>
                        <TouchableOpacity
                          style={styles.deleteBannerBtn}
                          onPress={() => handleDeleteBanner(b.id)}
                        >
                          <Text style={styles.deleteBannerBtnText}>🗑 Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* General System Info & Operations Settings Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>System Configuration</Text>
              <View style={styles.settingItemRow}>
                <Text style={styles.settingLabel}>Company Name</Text>
                <Text style={styles.settingValue}>Sithumina Transport (Pvt) Ltd</Text>
              </View>
              <View style={styles.settingItemRow}>
                <Text style={styles.settingLabel}>Customer Care Hotline</Text>
                <Text style={styles.settingValue}>077 123 4567 / 011 234 5678</Text>
              </View>
              <View style={styles.settingItemRow}>
                <Text style={styles.settingLabel}>Central Operations Hub</Text>
                <Text style={styles.settingValue}>Pettah Logistics Center, Colombo 11</Text>
              </View>
              <View style={styles.settingItemRow}>
                <Text style={styles.settingLabel}>GPS Telemetry Sync</Text>
                <Text style={[styles.settingValue, { color: "#1E9E5A", fontWeight: "800" }]}>
                  🟢 Real-Time Streaming Active
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* MODAL: ADD RIDER */}
      <Modal visible={addRiderModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add rider</Text>

            <Text style={styles.inputLabel}>Full name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Ruwan Silva"
              placeholderTextColor="#8C877A"
              value={riderName}
              onChangeText={setRiderName}
            />

            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput
              style={styles.formInput}
              placeholder="077 123 4567"
              placeholderTextColor="#8C877A"
              keyboardType="phone-pad"
              value={riderPhone}
              onChangeText={setRiderPhone}
            />

            <Text style={styles.inputLabel}>NIC number</Text>
            <TextInput
              style={styles.formInput}
              placeholder="199012345678"
              placeholderTextColor="#8C877A"
              value={riderNic}
              onChangeText={setRiderNic}
            />

            <Text style={styles.inputLabel}>Rider ID (Required Login ID) *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. R-1005"
              placeholderTextColor="#8C877A"
              autoCapitalize="characters"
              value={riderId}
              onChangeText={setRiderId}
            />
            <Text style={styles.inputHint}>
              🔑 Rider uses this ID to log into the Rider Dashboard from main login.
            </Text>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveRider}>
              <Text style={styles.saveBtnText}>Save Rider</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setAddRiderModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: ADD VEHICLE */}
      <Modal visible={addVehicleModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add vehicle</Text>

            <Text style={styles.inputLabel}>Plate number</Text>
            <TextInput
              style={styles.formInput}
              placeholder="WP AB-1234"
              placeholderTextColor="#8C877A"
              autoCapitalize="characters"
              value={vehPlate}
              onChangeText={setVehPlate}
            />

            <Text style={styles.inputLabel}>Vehicle type</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Lorry 10ft / 14ft / Canter"
              placeholderTextColor="#8C877A"
              value={vehType}
              onChangeText={setVehType}
            />

            <Text style={styles.inputLabel}>Capacity (tons)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="3"
              placeholderTextColor="#8C877A"
              keyboardType="numeric"
              value={vehCap}
              onChangeText={setVehCap}
            />

            <Text style={styles.inputLabel}>Rider name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Nuwan Perera"
              placeholderTextColor="#8C877A"
              value={vehRider}
              onChangeText={setVehRider}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveVehicle}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setAddVehicleModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: ADD BANNER */}
      <Modal visible={addBannerModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add New Banner</Text>
            <Text style={styles.modalSubtitle}>Create a promotion or announcement banner</Text>

            <Text style={styles.inputLabel}>Banner Title *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Special Discount for Kandy Trips"
              placeholderTextColor="#8C877A"
              value={bannerTitle}
              onChangeText={setBannerTitle}
            />

            <Text style={styles.inputLabel}>Subtitle / Description</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Save 10% on cargo hires this week"
              placeholderTextColor="#8C877A"
              value={bannerSub}
              onChangeText={setBannerSub}
            />

            <Text style={styles.inputLabel}>Tag / Category</Text>
            <TextInput
              style={styles.formInput}
              placeholder="PROMO / NOTICE / NEW / ALERT"
              placeholderTextColor="#8C877A"
              value={bannerTag}
              onChangeText={setBannerTag}
            />

            <Text style={styles.inputLabel}>Target Audience</Text>
            <View style={styles.audienceRow}>
              {(["all", "riders", "customers"] as const).map((aud) => (
                <TouchableOpacity
                  key={aud}
                  style={[
                    styles.audiencePill,
                    bannerTarget === aud && styles.audiencePillActive,
                  ]}
                  onPress={() => setBannerTarget(aud)}
                >
                  <Text
                    style={[
                      styles.audiencePillText,
                      bannerTarget === aud && styles.audiencePillTextActive,
                    ]}
                  >
                    {aud === "all" ? "👥 All" : aud === "riders" ? "🚚 Riders" : "👤 Customers"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Live Preview Card */}
            <Text style={styles.inputLabel}>Live Preview</Text>
            <View style={styles.bannerPreviewCard}>
              <View style={styles.previewTagBadge}>
                <Text style={styles.previewTagText}>{bannerTag || "PROMO"}</Text>
              </View>
              <Text style={styles.previewTitleText}>
                {bannerTitle || "Your Banner Title Here"}
              </Text>
              <Text style={styles.previewSubText}>
                {bannerSub || "Banner subtitle and details will be displayed here"}
              </Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBanner}>
              <Text style={styles.saveBtnText}>Save & Publish Banner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setAddBannerModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {toastMsg && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F2EA",
  },
  /* Top Header */
  topHeader: {
    backgroundColor: "#26231B",
    paddingTop: Platform.OS === "ios" ? 44 : 20,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoImage: {
    width: 38,
    height: 32,
  },
  brandTitle: {
    color: "#FFC20E",
    fontSize: 16.5,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  brandSub: {
    color: "#B2AB92",
    fontSize: 11,
    fontWeight: "700",
  },
  signOutBtn: {
    backgroundColor: "#363227",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  signOutText: {
    color: "#FFC20E",
    fontSize: 12.5,
    fontWeight: "800",
  },

  /* Navigation Bar */
  navBar: {
    backgroundColor: "#26231B",
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#3B3727",
  },
  navScroll: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  navItemActive: {
    backgroundColor: "#FFC20E",
  },
  navText: {
    color: "#D9D3BD",
    fontSize: 13,
    fontWeight: "700",
  },
  navTextActive: {
    color: "#26231B",
    fontWeight: "900",
  },
  badgeCount: {
    backgroundColor: "#B3121F",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeCountText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "800",
  },

  /* Main Scroll */
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  tabSection: {
    gap: 14,
  },

  /* KPI Cards */
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E7E2D0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  kpiIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FFC20E",
    alignItems: "center",
    justifyContent: "center",
  },
  kpiIcon: {
    fontSize: 13,
  },
  kpiLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#6F6A5A",
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#26231B",
    marginBottom: 2,
  },
  kpiDelta: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E9E5A",
  },

  /* Cards */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E7E2D0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#26231B",
  },
  viewAllLink: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#6F6A5A",
  },

  /* Chart */
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 150,
    paddingTop: 16,
    gap: 6,
  },
  chartBarCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  chartBarVal: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#6F6A5A",
    marginBottom: 4,
  },
  chartBar: {
    width: "100%",
    maxWidth: 24,
    backgroundColor: "#FFE08A",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  chartBarMax: {
    backgroundColor: "#FFC20E",
  },
  chartBarLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6F6A5A",
    marginTop: 6,
  },

  /* Mini Map Canvas */
  miniMapCanvas: {
    height: 220,
    backgroundColor: "#EBF3F5", // Oceanic blue tint
    borderRadius: 14,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D5E2E6",
  },
  islandShapeMini: {
    position: "absolute",
    left: "22%",
    top: "14%",
    width: "56%",
    height: "72%",
    backgroundColor: "#FFEAA7", // Teardrop island landmass
    borderTopLeftRadius: 60,
    borderTopRightRadius: 80,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 90,
    borderWidth: 1.5,
    borderColor: "#D4C28A",
    transform: [{ rotate: "12deg" }],
  },
  cityDotWrap: {
    position: "absolute",
    transform: [{ translateX: -4 }, { translateY: -4 }],
    alignItems: "center",
  },
  cityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7D6F53",
  },
  cityMiniText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#6F6042",
    marginTop: 1,
  },
  lorryMiniPin: {
    position: "absolute",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    transform: [{ translateX: -14 }, { translateY: -10 }],
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
  lorryMiniPlate: {
    color: "#FFFFFF",
    fontSize: 7.5,
    fontWeight: "900",
  },

  /* FULL SRI LANKA GEOGRAPHIC GPS RADAR MAP */
  fullMapContainer: {
    height: 380,
    backgroundColor: "#E2EEF2", // Indian Ocean maritime light blue
    borderRadius: 18,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#C5D8DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gridLatLine1: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "25%",
    height: 1,
    backgroundColor: "rgba(180, 205, 215, 0.6)",
  },
  gridLatLine2: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "rgba(180, 205, 215, 0.6)",
  },
  gridLatLine3: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "75%",
    height: 1,
    backgroundColor: "rgba(180, 205, 215, 0.6)",
  },
  gridLngLine1: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "35%",
    width: 1,
    backgroundColor: "rgba(180, 205, 215, 0.6)",
  },
  gridLngLine2: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "65%",
    width: 1,
    backgroundColor: "rgba(180, 205, 215, 0.6)",
  },
  sriLankaMainLandmass: {
    position: "absolute",
    left: "20%",
    top: "12%",
    width: "60%",
    height: "76%",
    backgroundColor: "#FFF0BD", // Golden Sri Lanka Landmass
    borderTopLeftRadius: 80,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 130,
    borderBottomRightRadius: 110,
    borderWidth: 2,
    borderColor: "#D2BE85",
    transform: [{ rotate: "14deg" }],
  },
  jaffnaPeninsula: {
    position: "absolute",
    top: -24,
    left: "12%",
    width: 44,
    height: 38,
    backgroundColor: "#FFF0BD",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#D2BE85",
  },
  mannarIsland: {
    position: "absolute",
    top: 26,
    left: -18,
    width: 32,
    height: 16,
    backgroundColor: "#FFF0BD",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D2BE85",
    transform: [{ rotate: "-25deg" }],
  },
  centralHighlands: {
    position: "absolute",
    top: "40%",
    left: "30%",
    width: "42%",
    height: "36%",
    backgroundColor: "#F7E29C", // High altitude central hills
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#CDB97D",
  },
  expresswayNorthSouth: {
    position: "absolute",
    left: "38%",
    top: "16%",
    width: 2,
    height: "70%",
    backgroundColor: "rgba(200, 150, 40, 0.35)",
    borderStyle: "dashed",
  },
  expresswayEastWest: {
    position: "absolute",
    left: "24%",
    top: "62%",
    width: "48%",
    height: 2,
    backgroundColor: "rgba(200, 150, 40, 0.35)",
  },
  cityMarker: {
    position: "absolute",
    transform: [{ translateX: -6 }, { translateY: -6 }],
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  cityPointDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#7D6740",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  cityPointLabel: {
    fontSize: 9.5,
    fontWeight: "900",
    color: "#54462B",
    textShadowColor: "rgba(255,255,255,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  liveLorryMarker: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    transform: [{ translateX: -20 }, { translateY: -16 }],
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  markerEmpty: {
    backgroundColor: "#1E9E5A",
  },
  markerOnTrip: {
    backgroundColor: "#26231B",
    borderColor: "#FFC20E",
  },
  markerSelected: {
    borderColor: "#FFC20E",
    borderWidth: 3.5,
    transform: [{ scale: 1.15 }, { translateX: -20 }, { translateY: -16 }],
  },
  markerPulse: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    left: -8,
    top: -8,
  },
  markerPulseEmpty: {
    backgroundColor: "rgba(30, 158, 90, 0.25)",
  },
  markerPulseOnTrip: {
    backgroundColor: "rgba(255, 194, 14, 0.3)",
  },
  markerVehicleIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  markerBadge: {
    alignItems: "flex-start",
  },
  markerPlateText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  markerSpeedText: {
    color: "#FFE08A",
    fontSize: 8,
    fontWeight: "800",
  },
  pinPulseRing: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,194,14,0.35)",
  },
  lorryPinEmpty: {
    backgroundColor: "#1E9E5A",
  },
  lorryPinOnTrip: {
    backgroundColor: "#26231B",
  },

  /* Inspector Card */
  lorryInspectorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FFC20E",
    shadowColor: "#FFC20E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  inspectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inspectorTitleCol: {
    flex: 1,
  },
  inspectorPlate: {
    fontSize: 18,
    fontWeight: "900",
    color: "#26231B",
  },
  inspectorRoute: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#6F6A5A",
    marginTop: 2,
  },
  inspectorGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E7E2D0",
    paddingTop: 10,
  },
  inspectorCol: {
    flex: 1,
  },
  inspectorMetaLabel: {
    fontSize: 11,
    color: "#6F6A5A",
    fontWeight: "700",
  },
  inspectorMetaVal: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26231B",
    marginTop: 2,
  },

  /* Requests */
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E7E2D0",
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFC20E",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#26231B",
  },
  requestItemContent: {
    flex: 1,
  },
  requestCustomer: {
    fontSize: 14,
    fontWeight: "800",
    color: "#26231B",
  },
  requestRoute: {
    fontSize: 11.5,
    color: "#6F6A5A",
    marginTop: 2,
  },
  requestRouteDetail: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E9E5A",
    marginTop: 2,
  },
  requestMeta: {
    fontSize: 11.5,
    color: "#6F6A5A",
    marginTop: 2,
  },
  actionBtnRow: {
    flexDirection: "row",
    gap: 6,
  },
  approveBtn: {
    backgroundColor: "#DDF3E7",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  approveBtnText: {
    color: "#12663A",
    fontSize: 11.5,
    fontWeight: "800",
  },
  rejectBtn: {
    backgroundColor: "#FBE0E0",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  rejectBtnText: {
    color: "#B3121F",
    fontSize: 11.5,
    fontWeight: "800",
  },
  requestCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  requestCardContent: {
    flex: 1,
  },
  requestActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  approveLargeBtn: {
    flex: 1,
    backgroundColor: "#DDF3E7",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  approveLargeBtnText: {
    color: "#12663A",
    fontWeight: "800",
    fontSize: 13,
  },
  rejectLargeBtn: {
    backgroundColor: "#FBE0E0",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  rejectLargeBtnText: {
    color: "#B3121F",
    fontWeight: "800",
    fontSize: 13,
  },

  /* Reviews */
  reviewItem: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E7E2D0",
  },
  reviewItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26231B",
  },
  reviewStars: {
    color: "#E9A800",
    fontSize: 12,
    letterSpacing: 1,
  },
  reviewDate: {
    marginLeft: "auto",
    fontSize: 11,
    color: "#6F6A5A",
  },
  reviewText: {
    fontSize: 12.5,
    color: "#6F6A5A",
    lineHeight: 17,
  },

  /* Table Rows (Riders / Vehicles) */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#26231B",
  },
  addBtn: {
    backgroundColor: "#FFC20E",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addBtnText: {
    color: "#26231B",
    fontSize: 13,
    fontWeight: "800",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E7E2D0",
    gap: 12,
  },
  riderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFC20E",
    alignItems: "center",
    justifyContent: "center",
  },
  riderAvatarText: {
    color: "#26231B",
    fontSize: 13,
    fontWeight: "800",
  },
  tableCol: {
    flex: 1,
  },
  riderName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#26231B",
  },
  riderMeta: {
    fontSize: 12,
    color: "#6F6A5A",
    marginTop: 2,
  },
  riderPlate: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#26231B",
    marginTop: 2,
  },
  vehPlate: {
    fontSize: 15,
    fontWeight: "900",
    color: "#26231B",
  },
  vehType: {
    fontSize: 12,
    color: "#6F6A5A",
    marginTop: 2,
  },
  vehRider: {
    fontSize: 12,
    fontWeight: "700",
    color: "#26231B",
    marginTop: 2,
  },

  /* Status Pills */
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusPillOk: {
    backgroundColor: "#DDF3E7",
  },
  statusPillWarning: {
    backgroundColor: "#FFE08A",
  },
  statusPillRed: {
    backgroundColor: "#FBE0E0",
  },
  statusPillMuted: {
    backgroundColor: "#E7E2D0",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  statusPillTextOk: {
    color: "#12663A",
  },
  statusPillTextWarning: {
    color: "#5B4300",
  },
  statusPillTextRed: {
    color: "#B3121F",
  },
  statusPillTextMuted: {
    color: "#6F6A5A",
  },

  /* Sub Tabs */
  subTabsRow: {
    flexDirection: "row",
    backgroundColor: "#E7E2D0",
    borderRadius: 12,
    padding: 3,
    gap: 4,
    alignSelf: "flex-start",
  },
  subTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  subTabActive: {
    backgroundColor: "#FFC20E",
  },
  subTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6F6A5A",
  },
  subTabTextActive: {
    color: "#26231B",
    fontWeight: "800",
  },

  /* Rating Distribution */
  starBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 3,
  },
  starBarLabel: {
    width: 32,
    fontSize: 12,
    fontWeight: "700",
    color: "#6F6A5A",
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E7E2D0",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#FFC20E",
  },
  starBarCount: {
    width: 24,
    fontSize: 12,
    fontWeight: "700",
    color: "#6F6A5A",
    textAlign: "right",
  },
  filterScroll: {
    flexDirection: "row",
    gap: 6,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E2D0",
    marginRight: 6,
  },
  filterPillActive: {
    backgroundColor: "#FFC20E",
    borderColor: "#FFC20E",
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6F6A5A",
  },
  filterPillTextActive: {
    color: "#26231B",
    fontWeight: "800",
  },

  /* Vehicle Breakdown */
  vehBreakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  vehBreakdownLabel: {
    width: 80,
    fontSize: 12,
    fontWeight: "700",
    color: "#26231B",
  },
  vehBreakdownPct: {
    width: 34,
    fontSize: 12,
    fontWeight: "800",
    color: "#26231B",
    textAlign: "right",
  },

  /* Live Map Header */
  mapHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DDF3E7",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1E9E5A",
  },
  livePillText: {
    color: "#12663A",
    fontSize: 11,
    fontWeight: "800",
  },
  lorryListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E7E2D0",
  },
  lorryListItemSelected: {
    backgroundColor: "#FFF6D6",
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  lorryPlateText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#26231B",
  },
  liveTagDot: {
    fontSize: 9,
  },
  lorryRouteText: {
    fontSize: 11.5,
    color: "#6F6A5A",
    marginTop: 2,
  },

  /* Modal Sheet */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#26231B",
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6F6A5A",
  },
  formInput: {
    backgroundColor: "#F4F2EA",
    borderWidth: 1.5,
    borderColor: "#E7E2D0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontWeight: "600",
    color: "#26231B",
  },
  inputHint: {
    color: "#6F6A5A",
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: -4,
    marginBottom: 4,
  },
  saveBtn: {
    backgroundColor: "#FFC20E",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveBtnText: {
    color: "#26231B",
    fontWeight: "800",
    fontSize: 15,
  },
  cancelBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFC20E",
  },
  cancelBtnText: {
    color: "#26231B",
    fontWeight: "800",
    fontSize: 14,
  },

  /* Settings & Banner Management Styles */
  cardSubText: {
    fontSize: 12,
    color: "#6F6A5A",
    marginTop: 2,
  },
  addBannerBtn: {
    backgroundColor: "#FFC20E",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addBannerBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#26231B",
  },
  emptyBannerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyBannerIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyBannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#26231B",
    marginBottom: 4,
  },
  emptyBannerDesc: {
    fontSize: 12.5,
    color: "#6F6A5A",
    textAlign: "center",
    marginBottom: 16,
    maxWidth: 280,
  },
  createFirstBannerBtn: {
    backgroundColor: "#FFC20E",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  createFirstBannerBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26231B",
  },
  bannersList: {
    gap: 12,
    marginTop: 6,
  },
  bannerCardItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#E7E2D0",
  },
  bannerCardItemInactive: {
    opacity: 0.6,
    backgroundColor: "#F9F8F5",
  },
  bannerCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bannerTagBadge: {
    backgroundColor: "#FFC20E",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#26231B",
  },
  bannerTargetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  targetAll: {
    backgroundColor: "#EFECE1",
  },
  targetRiders: {
    backgroundColor: "#FFE08A",
  },
  targetCust: {
    backgroundColor: "#E0F2FE",
  },
  bannerTargetText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#26231B",
  },
  statusTogglePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusTogglePillActive: {
    backgroundColor: "#E8F8F0",
  },
  statusTogglePillInactive: {
    backgroundColor: "#F3F1EC",
  },
  statusTogglePillText: {
    fontSize: 10.5,
    fontWeight: "800",
  },
  statusTogglePillTextActive: {
    color: "#1E9E5A",
  },
  statusTogglePillTextInactive: {
    color: "#6F6A5A",
  },
  bannerCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#26231B",
    marginBottom: 4,
  },
  bannerCardSub: {
    fontSize: 12,
    color: "#6F6A5A",
    marginBottom: 8,
  },
  bannerCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F4F2EA",
    paddingTop: 8,
    marginTop: 4,
  },
  bannerDateText: {
    fontSize: 10.5,
    color: "#8C877A",
  },
  deleteBannerBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteBannerBtnText: {
    fontSize: 11,
    color: "#B3121F",
    fontWeight: "700",
  },
  settingItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E2D0",
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6F6A5A",
  },
  settingValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#26231B",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#6F6A5A",
    marginBottom: 14,
  },
  audienceRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  audiencePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F4F2EA",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  audiencePillActive: {
    borderColor: "#FFC20E",
    backgroundColor: "#FFF6D6",
  },
  audiencePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6F6A5A",
  },
  audiencePillTextActive: {
    color: "#26231B",
  },
  bannerPreviewCard: {
    backgroundColor: "#26231B",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFC20E",
  },
  previewTagBadge: {
    backgroundColor: "#FFC20E",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  previewTagText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#26231B",
  },
  previewTitleText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFC20E",
    marginBottom: 2,
  },
  previewSubText: {
    fontSize: 11,
    color: "#E7E2D0",
  },

  /* Toast */
  toast: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: "#26231B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  toastText: {
    color: "#FFC20E",
    fontWeight: "800",
    fontSize: 13,
  },
});
