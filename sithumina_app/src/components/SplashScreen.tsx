import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    if (onFinish) {
      const timer = setTimeout(() => {
        onFinish();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoBadge}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.sinhalaTitle}>සිතුමිණ ට්‍රාන්ස්පෝට්</Text>
        <Text style={styles.englishTitle}>SITHUMINA TRANSPORT</Text>
        <Text style={styles.subtitle}>Driver & Fleet Operations Hub</Text>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#26231B" />
          <Text style={styles.loadingText}>Initializing live fleet...</Text>
        </View>
      </Animated.View>

      <Text style={styles.footerText}>24 Hours / 365 Days Island-wide Freight</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC20E", // Sithumina brand yellow
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoBadge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
  },
  sinhalaTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#26231B",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  englishTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#26231B",
    textAlign: "center",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A4537",
    textAlign: "center",
  },
  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 36,
    backgroundColor: "rgba(38, 35, 27, 0.08)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#26231B",
  },
  footerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4A4537",
    letterSpacing: 0.4,
  },
});
