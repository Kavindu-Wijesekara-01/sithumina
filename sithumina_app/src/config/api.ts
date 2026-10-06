import { Platform } from "react-native";
import Constants from "expo-constants";

// Active Local Wi-Fi IPv4 fallback
const DEFAULT_LAN_IP = "10.95.232.72";

export function getBaseApiUrl(): string {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.location?.hostname) {
      const host = window.location.hostname;
      return `http://${host}:3000`;
    }
    return "http://localhost:3000";
  }

  // Automatically detect development machine IP from Expo host URI (works on physical devices & emulators)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const detectedIp = hostUri.split(":")[0];
    if (detectedIp && detectedIp !== "localhost" && detectedIp !== "127.0.0.1") {
      return `http://${detectedIp}:3000`;
    }
  }

  return `http://${DEFAULT_LAN_IP}:3000`;
}

/**
 * Perform a resilient fetch to the backend server with an automatic 2-second timeout
 * so the UI NEVER hangs or buffers indefinitely.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 2500
): Promise<{ success: boolean; data?: T; error?: string }> {
  const baseUrl = getBaseApiUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errJson.error || `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: err?.name === "AbortError" ? "Request timed out" : err?.message || "Network error",
    };
  }
}
