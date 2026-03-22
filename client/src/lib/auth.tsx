"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isUserAdmin as checkIsAdmin, logout as apiLogout } from "./api";

const FILTER_SESSION_KEY = "ps-show-notified-only";
const AUTH_SESSION_KEY = "ps-is-logged-in";

interface AuthContextType {
  isAdmin: boolean;
  isLoggedIn: boolean;
  mounted: boolean;
  showNotifiedOnly: boolean;
  setShowNotifiedOnly: (val: boolean) => void;
  /** Call after a successful login/signup API response */
  onLoginSuccess: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  isLoggedIn: false,
  mounted: false,
  showNotifiedOnly: false,
  setShowNotifiedOnly: () => {},
  onLoginSuccess: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showNotifiedOnly, setShowNotifiedOnlyState] = useState(false);

  // On mount: check if user has an active session by calling the API.
  // The browser sends the httpOnly cookie automatically.
  // We also use sessionStorage as a fast hint to avoid a flash.
  useEffect(() => {
    // Restore filter state
    try {
      const saved = sessionStorage.getItem(FILTER_SESSION_KEY);
      if (saved === "true") setShowNotifiedOnlyState(true);
    } catch {}

    // Check if we had a session (fast hint)
    let hadSession = false;
    try {
      hadSession = sessionStorage.getItem(AUTH_SESSION_KEY) === "true";
    } catch {}

    if (hadSession) {
      // Optimistically mark as logged in, then verify
      setIsLoggedIn(true);
    }

    // Verify auth status by hitting an authenticated endpoint
    checkIsAdmin()
      .then((admin) => {
        // If we got a response (not a 401), the cookie is valid
        setIsLoggedIn(true);
        setIsAdmin(admin);
        try { sessionStorage.setItem(AUTH_SESSION_KEY, "true"); } catch {}
      })
      .catch(() => {
        // 401 or network error — not logged in
        setIsLoggedIn(false);
        setIsAdmin(false);
        try { sessionStorage.removeItem(AUTH_SESSION_KEY); } catch {}
      })
      .finally(() => setMounted(true));
  }, []);

  const setShowNotifiedOnly = useCallback((val: boolean) => {
    setShowNotifiedOnlyState(val);
    try {
      sessionStorage.setItem(FILTER_SESSION_KEY, val ? "true" : "false");
    } catch {}
  }, []);

  /**
   * Called after a successful login or signup API response.
   * The backend has already set the httpOnly cookie via Set-Cookie header.
   * We just need to update local state.
   */
  const onLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
    try { sessionStorage.setItem(AUTH_SESSION_KEY, "true"); } catch {}
    // Check admin status
    checkIsAdmin()
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false));
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Even if the API call fails, clear local state
    }
    setIsLoggedIn(false);
    setIsAdmin(false);
    setShowNotifiedOnly(false);
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch {}
  }, [setShowNotifiedOnly]);

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        isLoggedIn,
        mounted,
        showNotifiedOnly,
        setShowNotifiedOnly,
        onLoginSuccess,
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
