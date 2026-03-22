"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isUserAdmin as checkIsAdmin } from "./api";

const AUTH_COOKIE = "auth-token";
const JWT_PREFIX = "JWT ";
const FILTER_SESSION_KEY = "ps-show-notified-only";

interface AuthContextType {
  token: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  mounted: boolean;
  showNotifiedOnly: boolean;
  setShowNotifiedOnly: (val: boolean) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: "",
  isAdmin: false,
  isLoggedIn: false,
  mounted: false,
  showNotifiedOnly: false,
  setShowNotifiedOnly: () => {},
  setToken: () => {},
  logout: () => {},
});

/** Decode JWT payload using built-in atob (no external deps) */
function decodePayload(token: string): { exp?: number } | null {
  try {
    const raw = token.startsWith(JWT_PREFIX) ? token.slice(JWT_PREFIX.length) : token;
    const parts = raw.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

/** Check if a JWT token is still valid (not expired) */
function isTokenValid(token: string): boolean {
  if (!token) return false;
  const payload = decodePayload(token);
  if (!payload || !payload.exp) return false;
  return payload.exp > Date.now() / 1000;
}

/** Read the raw JWT (without JWT prefix) from the auth cookie */
function readCookieToken(): string {
  try {
    const cookies = document.cookie.split(";");
    for (const c of cookies) {
      const [name, ...rest] = c.split("=");
      if (name.trim() === AUTH_COOKIE) {
        const value = rest.join("=").trim();
        // Strip "JWT " prefix if present, return raw token
        return value.startsWith(JWT_PREFIX) ? value.slice(JWT_PREFIX.length) : value;
      }
    }
    return "";
  } catch {
    return "";
  }
}

/** Set the auth cookie with the JWT token */
function setCookieToken(token: string): void {
  try {
    if (token) {
      const value = `${JWT_PREFIX}${token}`;
      const secure = location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${AUTH_COOKIE}=${value}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${secure}`;
    } else {
      document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0`;
    }
  } catch {
    // document.cookie may not be available
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showNotifiedOnly, setShowNotifiedOnlyState] = useState(false);

  // On mount: read token from cookie
  useEffect(() => {
    const stored = readCookieToken();
    if (stored && isTokenValid(stored)) {
      setTokenState(stored);
    } else if (stored) {
      // Expired — clear it
      setCookieToken("");
    }

    try {
      const saved = sessionStorage.getItem(FILTER_SESSION_KEY);
      if (saved === "true") setShowNotifiedOnlyState(true);
    } catch {}

    setMounted(true);
  }, []);

  // Check admin status when token changes
  useEffect(() => {
    if (token) {
      checkIsAdmin()
        .then(setIsAdmin)
        .catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [token]);

  // Periodically check token expiry (every 60 seconds)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (!isTokenValid(token)) {
        setTokenState("");
        setCookieToken("");
        setIsAdmin(false);
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  const setShowNotifiedOnly = useCallback((val: boolean) => {
    setShowNotifiedOnlyState(val);
    try {
      sessionStorage.setItem(FILTER_SESSION_KEY, val ? "true" : "false");
    } catch {}
  }, []);

  const setToken = useCallback((newToken: string) => {
    if (newToken && !isTokenValid(newToken)) {
      newToken = "";
    }
    setTokenState(newToken);
    setCookieToken(newToken);
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setIsAdmin(false);
    setShowNotifiedOnly(false);
  }, [setToken, setShowNotifiedOnly]);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAdmin,
        isLoggedIn: token !== "",
        mounted,
        showNotifiedOnly,
        setShowNotifiedOnly,
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
