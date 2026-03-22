"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isUserAdmin as checkIsAdmin } from "./api";

const TOKEN_KEY = "ps-auth-token";
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

/**
 * Decode the JWT payload without any external library.
 * Returns null if the token is malformed.
 */
function decodePayload(token: string): { exp?: number; Id?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

/** Check if a JWT token is still valid (not expired) */
function isTokenValid(token: string): boolean {
  if (!token) return false;
  const payload = decodePayload(token);
  if (!payload || !payload.exp) return false;
  // Add 10 second buffer to avoid edge-case race conditions
  return payload.exp > Date.now() / 1000 + 10;
}

/** Read token from localStorage, clear it if expired */
function readStoredToken(): string {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return "";
    if (isTokenValid(token)) return token;
    // Token expired — clean up
    localStorage.removeItem(TOKEN_KEY);
    return "";
  } catch {
    return "";
  }
}

/** Store token in localStorage */
function storeToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // localStorage may not be available
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showNotifiedOnly, setShowNotifiedOnlyState] = useState(false);

  // On mount: read token from localStorage and restore filter state
  useEffect(() => {
    const stored = readStoredToken();
    if (stored) setTokenState(stored);

    try {
      const saved = sessionStorage.getItem(FILTER_SESSION_KEY);
      if (saved === "true") setShowNotifiedOnlyState(true);
    } catch {}

    setMounted(true);
  }, []);

  // Check admin status whenever token changes
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
        storeToken("");
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
    storeToken(newToken);
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
