"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "driver" | "customer" | "admin";

export interface UserProfile {
  uid: string;
  phone: string;
  role: UserRole;
  name: string;
  plateNumber?: string;
  assignedLorryId?: string;
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole;
  loginWithPhone: (
    phone: string,
    pin: string,
    role: UserRole,
    extra?: { name?: string; plateNumber?: string }
  ) => Promise<boolean>;
  loginAsAdmin: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateDriverLorry: (lorryId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_PROFILE_KEY = "sithumina_user_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
            localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(data));
          }
        } catch (e) {
          console.warn("Could not fetch user document:", e);
        }
      } else {
        // If logged out from Firebase
        if (!localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY)) {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithPhone = async (
    phone: string,
    _pin: string,
    selectedRole: UserRole,
    extra?: { name?: string; plateNumber?: string }
  ): Promise<boolean> => {
    try {
      // 1. Sync to Central Customers API store
      const customerName = extra?.name?.trim() || "Valued Customer";
      try {
        await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: customerName,
            phone: phone.trim(),
          }),
        });
      } catch (e) {
        console.warn("API customer sync warning:", e);
      }

      // 2. Perform anonymous sign in on Firebase to establish session if available
      let uid = `cust-${phone.trim().replace(/\s+/g, "")}`;
      try {
        let fbUser = auth.currentUser;
        if (!fbUser) {
          const cred = await signInAnonymously(auth);
          fbUser = cred.user;
        }
        if (fbUser) uid = fbUser.uid;
      } catch {
        // Fallback to local session
      }

      const newProfile: UserProfile = {
        uid,
        phone: phone.trim(),
        role: "customer", // Web platform is exclusively for customers
        name: customerName,
        plateNumber: extra?.plateNumber,
        createdAt: Date.now(),
      };

      try {
        await setDoc(doc(db, "users", uid), newProfile, { merge: true });
      } catch {
        // Non-blocking
      }

      setProfile(newProfile);
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const loginAsAdmin = async (): Promise<boolean> => {
    try {
      let fbUser = auth.currentUser;
      if (!fbUser) {
        const cred = await signInAnonymously(auth);
        fbUser = cred.user;
      }
      const adminProfile: UserProfile = {
        uid: fbUser.uid,
        phone: "0112345678",
        role: "admin",
        name: "Sithumina Dispatch Chief",
        createdAt: Date.now(),
      };
      try {
        await setDoc(doc(db, "users", fbUser.uid), adminProfile, { merge: true });
      } catch (e) {
        console.warn(e);
      }
      setProfile(adminProfile);
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(adminProfile));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
  };

  const updateDriverLorry = async (lorryId: string) => {
    if (!profile) return;
    const updated = { ...profile, assignedLorryId: lorryId };
    setProfile(updated);
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updated));
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { assignedLorryId: lorryId }, { merge: true });
      } catch {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role: profile?.role || "customer",
        loginWithPhone,
        loginAsAdmin,
        logout,
        updateDriverLorry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
