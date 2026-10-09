export const AUTH_COOKIE_NAME = "sithumina_admin_session";

export interface AdminSession {
  userId: string;
  name: string;
  role: "admin";
  createdAt: number;
}

/**
 * PRODUCTION NOTE:
 * Replace this mock cookie parser/setter with your real authentication provider
 * (e.g. Firebase Auth, NextAuth / Auth.js, Supabase Auth, or custom JWT verify).
 */

export function getClientSession(): AdminSession | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (!match) return null;
  try {
    const raw = decodeURIComponent(match.split("=")[1]);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setClientSession(userId: string): void {
  if (typeof document === "undefined") return;
  const session: AdminSession = {
    userId,
    name: "Admin",
    role: "admin",
    createdAt: Date.now(),
  };
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(session)
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearClientSession(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
