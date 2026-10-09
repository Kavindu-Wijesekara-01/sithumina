import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import { WebView } from "react-native-webview";

export interface MapLorryItem {
  id: string;
  plate: string;
  route: string;
  driverName: string;
  driverPhone?: string;
  status: "On trip" | "Empty";
  lat: number;
  lng: number;
  speedKmH: number;
  heading?: number;
  isOnline?: boolean;
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

interface SriLankaMapViewerProps {
  lorries: MapLorryItem[];
  selectedPlate?: string | null;
  filter?: "all" | "Empty" | "On trip";
  onSelectLorry?: (plate: string) => void;
  height?: number;
  isMiniMap?: boolean;
}

export const SriLankaMapViewer: React.FC<SriLankaMapViewerProps> = ({
  lorries,
  selectedPlate,
  filter = "all",
  onSelectLorry,
  height = 420,
  isMiniMap = false,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Only show lorries that have started live or are online
  const filteredLorries = useMemo(() => {
    return lorries.filter(
      (l) => l.isOnline && (filter === "all" || l.status === filter)
    );
  }, [lorries, filter]);

  const generateMapHtml = (fullscreenMode = false) => {
    const lorriesJson = JSON.stringify(filteredLorries);
    const selectedJson = JSON.stringify(selectedPlate || "");

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map {
      height: 100%;
      width: 100%;
      background: #EFECE1;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      touch-action: pan-x pan-y pinch-zoom;
      -webkit-overflow-scrolling: touch;
    }
    
    /* Custom Pin Container */
    .lorry-pin-wrapper {
      position: relative;
      cursor: pointer;
    }

    /* Pulse Radar Ring for On Trip */
    .pin-pulse-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 194, 14, 0.45);
      border: 1.5px solid rgba(255, 194, 14, 0.85);
      animation: pulseAnim 2s infinite ease-out;
      pointer-events: none;
      z-index: 1;
    }
    @keyframes pulseAnim {
      0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.9; }
      100% { transform: translate(-50%, -50%) scale(2.3); opacity: 0; }
    }

    /* Lorry Pin Badge */
    .lorry-badge {
      position: relative;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      transition: transform 0.2s ease;
    }
    .lorry-badge:hover, .lorry-badge.selected {
      transform: scale(1.08);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.55);
    }
    .badge-ontrip {
      background: #26231B;
      color: #FFC20E;
      border: 2px solid #FFC20E;
    }
    .badge-empty {
      background: #1E9E5A;
      color: #FFFFFF;
      border: 2px solid #FFFFFF;
    }
    .badge-icon {
      font-size: 12px;
      line-height: 1;
    }
    .badge-selected-ring {
      position: absolute;
      inset: -4px;
      border: 2px solid #26231B;
      border-radius: 24px;
      pointer-events: none;
    }

    /* Rich Popup Styling: Shows ALL Rider Submitted Information */
    .leaflet-popup-content-wrapper {
      background: #26231B !important;
      color: #F6F1DF !important;
      border-radius: 14px !important;
      padding: 6px 8px !important;
      border: 1.5px solid #FFC20E !important;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.5) !important;
      min-width: 230px !important;
      max-width: 300px !important;
    }
    .leaflet-popup-content {
      margin: 6px 8px !important;
      line-height: 1.4 !important;
    }
    .leaflet-popup-tip {
      background: #26231B !important;
    }
    .pop-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .pop-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 194, 14, 0.35);
      padding-bottom: 5px;
      margin-bottom: 5px;
    }
    .pop-plate-title {
      font-size: 14px;
      font-weight: 900;
      color: #FFC20E;
      letter-spacing: 0.5px;
    }
    .pop-status {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 800;
    }
    .pop-status-ontrip {
      background: #363227;
      color: #FFC20E;
      border: 1px solid #FFC20E;
    }
    .pop-status-empty {
      background: #173B28;
      color: #2FE084;
      border: 1px solid #1E9E5A;
    }
    .pop-driver-row {
      font-size: 11px;
      color: #E7E2D0;
      margin-bottom: 5px;
    }
    .pop-section {
      background: rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 6px 8px;
      margin-top: 4px;
    }
    .pop-row {
      font-size: 11px;
      margin-bottom: 3px;
      display: flex;
      justify-content: space-between;
      gap: 6px;
    }
    .pop-k {
      color: #B2AB92;
      font-weight: 600;
      flex-shrink: 0;
    }
    .pop-v {
      color: #F6F1DF;
      font-weight: 700;
      text-align: right;
    }
    .pop-v-gold {
      color: #FFC20E;
      font-weight: 800;
      text-align: right;
    }
    .pop-badges-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 5px;
    }
    .pop-badge {
      background: #363227;
      color: #FFE08A;
      font-size: 9.5px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 6px;
      border: 1px solid rgba(255, 194, 14, 0.35);
    }
    .pop-badge-green {
      background: #173B28;
      color: #4ADE80;
      border: 1px solid #1E9E5A;
    }
    
    /* Control buttons bar */
    .map-controls-row {
      position: absolute;
      bottom: 14px;
      right: 12px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ctrl-btn {
      background: #26231B;
      color: #FFC20E;
      border: 1.5px solid #FFC20E;
      padding: 6px 10px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .ctrl-btn:active {
      background: #FFC20E;
      color: #26231B;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  ${
    !isMiniMap
      ? `<div class="map-controls-row">
          <button class="ctrl-btn" onclick="zoomIn()">➕</button>
          <button class="ctrl-btn" onclick="zoomOut()">➖</button>
          <button class="ctrl-btn" onclick="recenterMap()">🇱🇰 Sri Lanka</button>
          <button class="ctrl-btn" onclick="triggerFullScreen()">⛶ Full Screen</button>
        </div>`
      : ""
  }

  <script>
    // Smooth zoom & inertia physics enabled
    var map = L.map('map', {
      center: [7.8731, 80.7718],
      zoom: ${fullscreenMode ? 8 : isMiniMap ? 6.9 : 7.6},
      minZoom: 6.0,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      wheelDebounceTime: 40,
      wheelPxPerZoomLevel: 60,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      boxZoom: true,
      dragging: true,
      inertia: true,
      inertiaDeceleration: 3000
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    function recenterMap() {
      map.flyTo([7.8731, 80.7718], ${fullscreenMode ? 8 : isMiniMap ? 6.9 : 7.6}, { duration: 1.2 });
    }

    function zoomIn() {
      map.zoomIn(1);
    }

    function zoomOut() {
      map.zoomOut(1);
    }

    function triggerFullScreen() {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TOGGLE_FULLSCREEN' }));
      }
    }

    var markers = {};
    var lorriesData = ${lorriesJson};
    var selectedPlate = ${selectedJson};

    function notifySelect(plate) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_LORRY', plate: plate }));
      } else if (window.parent) {
        window.parent.postMessage(JSON.stringify({ type: 'SELECT_LORRY', plate: plate }), '*');
      }
    }

    function createLorryIcon(l, isSelected) {
      var isTrip = l.status === 'On trip';
      var pulseHtml = isTrip ? '<div class="pin-pulse-ring"></div>' : '';
      var ringHtml = isSelected ? '<div class="badge-selected-ring"></div>' : '';
      
      var html = '<div class="lorry-pin-wrapper">' +
        pulseHtml +
        '<div class="lorry-badge ' + (isTrip ? 'badge-ontrip' : 'badge-empty') + (isSelected ? ' selected' : '') + '">' +
          ringHtml +
          '<span class="badge-icon">🚚</span>' +
          '<span>' + l.plate + '</span>' +
        '</div>' +
      '</div>';

      return L.divIcon({
        className: 'custom-div-icon',
        html: html,
        iconSize: [94, 30],
        iconAnchor: [47, 15],
        popupAnchor: [0, -16]
      });
    }

    function buildPopupHtml(l) {
      var tripDetailsHtml = '';
      if (l.status === 'On trip') {
        tripDetailsHtml = '<div class="pop-section">' +
          '<div class="pop-row"><span class="pop-k">Start:</span> <span class="pop-v">' + (l.startLocation || 'Colombo') + '</span></div>' +
          '<div class="pop-row"><span class="pop-k">Destination:</span> <span class="pop-v">' + (l.endLocation || l.route || 'Destination') + '</span></div>' +
          (l.travelRoute ? '<div class="pop-row"><span class="pop-k">Route:</span> <span class="pop-v">' + l.travelRoute + '</span></div>' : '') +
          (l.emptyTime ? '<div class="pop-row"><span class="pop-k">Est. Empty:</span> <span class="pop-v-gold">' + l.emptyTime + '</span></div>' : '') +
          (l.returnRoute ? '<div class="pop-row"><span class="pop-k">Return Route:</span> <span class="pop-v">' + l.returnRoute + '</span></div>' : '') +
          (l.finalDestination ? '<div class="pop-row"><span class="pop-k">Final Stop:</span> <span class="pop-v">' + l.finalDestination + '</span></div>' : '') +
        '</div>';
      } else {
        tripDetailsHtml = '<div class="pop-section">' +
          '<div class="pop-row"><span class="pop-k">Location:</span> <span class="pop-v">' + (l.startLocation || l.route || 'Standby') + '</span></div>' +
          (l.endLocation ? '<div class="pop-row"><span class="pop-k">Bound For:</span> <span class="pop-v">' + l.endLocation + '</span></div>' : '') +
          (l.travelRoute ? '<div class="pop-row"><span class="pop-k">Route:</span> <span class="pop-v">' + l.travelRoute + '</span></div>' : '') +
          '<div class="pop-badges-grid">' +
            '<span class="pop-badge">Space: ' + (l.availableSpace || 'Full Space') + '</span>' +
            '<span class="pop-badge">Capacity: ' + (l.availableCapacityKg || '3,000 Kg') + '</span>' +
            (l.hasFreezer ? '<span class="pop-badge pop-badge-green">Freezer</span>' : '') +
            (l.hasHelper ? '<span class="pop-badge pop-badge-green">Helper</span>' : '') +
          '</div>' +
        '</div>';
      }

      return '<div class="pop-container">' +
        '<div class="pop-header">' +
          '<div class="pop-plate-title">' + l.plate + '</div>' +
          '<span class="pop-status ' + (l.status === 'On trip' ? 'pop-status-ontrip' : 'pop-status-empty') + '">' + (l.status === 'On trip' ? 'Loaded' : 'Empty') + '</span>' +
        '</div>' +
        '<div class="pop-driver-row"><b>' + (l.driverName || 'Driver') + '</b>' + (l.driverPhone ? ' · ' + l.driverPhone : '') + '</div>' +
        tripDetailsHtml +
        (l.speedKmH && l.speedKmH > 0 ? '<div style="font-size:10px;color:#2FE084;font-weight:700;margin-top:4px;">● Moving at ' + l.speedKmH + ' km/h</div>' : '') +
      '</div>';
    }

    function renderLorries(data, sel) {
      if (!Array.isArray(data)) return;
      var activePlates = {};

      data.forEach(function(l) {
        if (!l.lat || !l.lng) return;
        activePlates[l.plate] = true;
        var isSelected = (l.plate === sel);
        var icon = createLorryIcon(l, isSelected);
        var popupContent = buildPopupHtml(l);

        if (markers[l.plate]) {
          markers[l.plate].setLatLng([l.lat, l.lng]);
          markers[l.plate].setIcon(icon);
          markers[l.plate].setPopupContent(popupContent);
        } else {
          var marker = L.marker([l.lat, l.lng], { icon: icon }).addTo(map);
          marker.bindPopup(popupContent);
          marker.on('click', function() {
            notifySelect(l.plate);
          });
          markers[l.plate] = marker;
        }
      });

      Object.keys(markers).forEach(function(p) {
        if (!activePlates[p]) {
          map.removeLayer(markers[p]);
          delete markers[p];
        }
      });

      if (sel && markers[sel] && !${isMiniMap}) {
        markers[sel].openPopup();
      }
    }

    window.updateLorries = function(data, sel) {
      renderLorries(data, sel);
    };

    window.addEventListener('message', function(ev) {
      try {
        var d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        if (d && d.type === 'UPDATE_LORRIES') {
          renderLorries(d.lorries, d.selectedPlate);
        }
      } catch(e) {}
    });

    renderLorries(lorriesData, selectedPlate);
  </script>
</body>
</html>`;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "SELECT_LORRY" && onSelectLorry) {
        onSelectLorry(data.plate);
      } else if (data.type === "TOGGLE_FULLSCREEN") {
        setIsFullScreen(true);
      }
    } catch (e) {
      // Ignored
    }
  };

  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);
  const fullScreenWebViewRef = useRef<any>(null);
  const fullScreenIframeRef = useRef<any>(null);

  // Smooth real-time update injection without reloading Leaflet WebView
  useEffect(() => {
    const payload = JSON.stringify(filteredLorries);
    const sel = JSON.stringify(selectedPlate || "");
    const script = `if (window.updateLorries) { window.updateLorries(${payload}, ${sel}); } true;`;

    if (Platform.OS === "web") {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "UPDATE_LORRIES", lorries: filteredLorries, selectedPlate: selectedPlate || "" },
        "*"
      );
      fullScreenIframeRef.current?.contentWindow?.postMessage(
        { type: "UPDATE_LORRIES", lorries: filteredLorries, selectedPlate: selectedPlate || "" },
        "*"
      );
    } else {
      webViewRef.current?.injectJavaScript(script);
      fullScreenWebViewRef.current?.injectJavaScript(script);
    }
  }, [filteredLorries, selectedPlate]);

  const mapHtml = useMemo(() => generateMapHtml(false), [isMiniMap]);
  const fullScreenHtml = useMemo(() => generateMapHtml(true), []);

  return (
    <>
      <View style={[styles.container, { height }]}>
        {Platform.OS === "web" ? (
          /* @ts-ignore */
          <iframe
            ref={iframeRef}
            srcDoc={mapHtml}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: 14,
            }}
          />
        ) : (
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: mapHtml }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            onLoadEnd={() => {
              const payload = JSON.stringify(filteredLorries);
              const sel = JSON.stringify(selectedPlate || "");
              webViewRef.current?.injectJavaScript(
                `if (window.updateLorries) { window.updateLorries(${payload}, ${sel}); } true;`
              );
            }}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFC20E" />
                <Text style={styles.loadingText}>Loading Sri Lanka Live Map...</Text>
              </View>
            )}
            style={styles.webView}
          />
        )}

        {!isMiniMap && (
          <TouchableOpacity
            style={styles.floatingFullScreenBtn}
            onPress={() => setIsFullScreen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.floatingFullScreenText}>⛶ Fullscreen</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* FULL SCREEN MODAL VIEW */}
      <Modal visible={isFullScreen} animationType="slide">
        <SafeAreaView style={styles.fullScreenModalWrapper}>
          <View style={styles.fullScreenHeader}>
            <View style={styles.fullScreenTitleRow}>
              <Text style={styles.fullScreenFlag}>🇱🇰</Text>
              <Text style={styles.fullScreenTitle}>Sri Lanka Live Map</Text>
              <View style={styles.liveBadgeMini}>
                <View style={styles.liveDotMini} />
                <Text style={styles.liveBadgeMiniText}>{filteredLorries.length} Live</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.exitFullScreenBtn}
              onPress={() => setIsFullScreen(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.exitFullScreenText}>✕ Exit Fullscreen</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fullScreenWebViewContainer}>
            {Platform.OS === "web" ? (
              /* @ts-ignore */
              <iframe
                ref={fullScreenIframeRef}
                srcDoc={fullScreenHtml}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            ) : (
              <WebView
                ref={fullScreenWebViewRef}
                originWhitelist={["*"]}
                source={{ html: fullScreenHtml }}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onLoadEnd={() => {
                  const payload = JSON.stringify(filteredLorries);
                  const sel = JSON.stringify(selectedPlate || "");
                  fullScreenWebViewRef.current?.injectJavaScript(
                    `if (window.updateLorries) { window.updateLorries(${payload}, ${sel}); } true;`
                  );
                }}
                style={styles.webView}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F4F2EA",
    borderWidth: 1,
    borderColor: "#E7E2D0",
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#F4F2EA",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    color: "#6F6A5A",
    fontSize: 12,
    fontWeight: "700",
  },
  floatingFullScreenBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#26231B",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFC20E",
    elevation: 3,
  },
  floatingFullScreenText: {
    color: "#FFC20E",
    fontSize: 11,
    fontWeight: "800",
  },

  /* Full Screen Modal */
  fullScreenModalWrapper: {
    flex: 1,
    backgroundColor: "#26231B",
  },
  fullScreenHeader: {
    height: 54,
    backgroundColor: "#26231B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3B3727",
  },
  fullScreenTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fullScreenFlag: {
    fontSize: 18,
  },
  fullScreenTitle: {
    color: "#FFC20E",
    fontSize: 16,
    fontWeight: "900",
  },
  liveBadgeMini: {
    backgroundColor: "#173B28",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#1E9E5A",
  },
  liveDotMini: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#2FE084",
  },
  liveBadgeMiniText: {
    color: "#2FE084",
    fontSize: 10,
    fontWeight: "800",
  },
  exitFullScreenBtn: {
    backgroundColor: "#B3121F",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  exitFullScreenText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  fullScreenWebViewContainer: {
    flex: 1,
  },
});
