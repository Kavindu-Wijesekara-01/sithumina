import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { LoginScreen } from "./src/screens/LoginScreen";
import { AdminDashboard } from "./src/screens/AdminDashboard";
import { DriverInterface } from "./src/screens/DriverInterface";
import { DriverRecord } from "./src/services/database";

const SESSION_STORAGE_KEY = "sithumina_driver_app_session";

type AppScreen = "login" | "admin" | "driver";

interface AppSession {
  role: "admin" | "driver";
  driver?: DriverRecord;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("login");
  const [session, setSession] = useState<AppSession | null>(null);

  // Restore saved session if available
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as AppSession;
          setSession(parsed);
          setCurrentScreen(parsed.role === "admin" ? "admin" : "driver");
        }
      } catch (e) {
        console.warn("Could not restore session:", e);
      }
    };
    restoreSession();
  }, []);

  const handleLoginSuccess = async (newSession: AppSession) => {
    setSession(newSession);
    try {
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    } catch (e) {
      console.warn("Could not save session:", e);
    }
    setCurrentScreen(newSession.role === "admin" ? "admin" : "driver");
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn("Could not clear session:", e);
    }
    setSession(null);
    setCurrentScreen("login");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        {currentScreen === "login" && (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        )}

        {currentScreen === "admin" && (
          <AdminDashboard onLogout={handleLogout} />
        )}

        {currentScreen === "driver" && session?.driver && (
          <DriverInterface driver={session.driver} onLogout={handleLogout} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDB813",
  },
});
