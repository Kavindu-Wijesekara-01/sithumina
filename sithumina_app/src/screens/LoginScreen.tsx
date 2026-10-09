import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  isAdminId,
  verifyDriverLogin,
  DriverRecord,
} from "../services/database";

interface LoginScreenProps {
  onLoginSuccess: (session: {
    role: "admin" | "driver";
    driver?: DriverRecord;
  }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [loginId, setLoginId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmed = loginId.trim();
    if (!trimmed) {
      setErrorMessage("Please enter your ID");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Admin login verification
      if (isAdminId(trimmed)) {
        setLoading(false);
        onLoginSuccess({ role: "admin" });
        return;
      }

      // 2. Driver login verification
      const driver = await verifyDriverLogin(trimmed);
      if (driver) {
        setLoading(false);
        onLoginSuccess({ role: "driver", driver });
        return;
      }

      // Neither matched
      setLoading(false);
      setErrorMessage("Invalid ID. Please check and try again.");
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(
        err?.message || "Connection failed. Please check internet."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      {/* Background Decorative Organic Shapes */}
      <View style={styles.bgBlobTopRight} pointerEvents="none" />
      <View style={styles.bgBlobMidRight} pointerEvents="none" />
      <View style={styles.bgRoadCurve} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerContainer}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* App Title */}
          <Text style={styles.title}>Sithumina Transport</Text>

          {/* Riders & Admin Pill Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Riders & Admin</Text>
          </View>

          {/* Form Area */}
          <View style={styles.formContainer}>
            {/* Input Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🪪</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your ID"
                placeholderTextColor="#7D5E06"
                value={loginId}
                onChangeText={(text) => {
                  setLoginId(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Error Message */}
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FDB813" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Login ➔</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FDB813", // Sithumina brand golden yellow
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  centerContainer: {
    alignItems: "center",
    width: "100%",
  },

  /* Background Organic Shapes */
  bgBlobTopRight: {
    position: "absolute",
    top: -50,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(235, 160, 0, 0.35)",
  },
  bgBlobMidRight: {
    position: "absolute",
    top: 190,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(235, 160, 0, 0.22)",
  },
  bgRoadCurve: {
    position: "absolute",
    bottom: -60,
    left: -40,
    right: -40,
    height: 200,
    borderTopWidth: 3,
    borderStyle: "dashed",
    borderColor: "rgba(185, 125, 0, 0.55)",
    borderRadius: 220,
    backgroundColor: "rgba(240, 165, 0, 0.22)",
  },

  /* Logo */
  logoContainer: {
    width: 175,
    height: 135,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logo: {
    width: "100%",
    height: "100%",
  },

  /* Title & Subtitle */
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#B31317", // Bold crimson red matching the design
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  badge: {
    backgroundColor: "rgba(230, 155, 0, 0.55)",
    paddingVertical: 6,
    paddingHorizontal: 22,
    borderRadius: 20,
    marginBottom: 38,
  },
  badgeText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#1F1E1B",
  },

  /* Form */
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FED857", // Light creamy yellow container
    borderWidth: 1.5,
    borderColor: "#E5AA0E",
    borderRadius: 24,
    height: 62,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#1F1E1B",
    height: "100%",
  },

  /* Error */
  errorContainer: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(31, 30, 27, 0.85)",
    borderRadius: 14,
    alignSelf: "center",
  },
  errorText: {
    color: "#FED857",
    fontSize: 12.5,
    fontWeight: "700",
    textAlign: "center",
  },

  /* Login Button */
  loginButton: {
    backgroundColor: "#1F1E1B", // Dark charcoal black
    borderRadius: 24,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FDB813", // Sithumina yellow
    letterSpacing: 0.3,
  },
});
