"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
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

/** Strip the "JWT " prefix if present, returning the raw token for decoding */
function stripJwtPrefix(raw: string): string {
  if (raw.startsWith(JWT_PREFIX)) return raw.slice(JWT_PREFIX.length);
  return raw;
}

function validateToken(token: string): boolean {
  try {
    const decoded: { exp?: number } = jwtDecode(stripJwtPrefix(token));
    if (decoded.exp && decoded.exp < Date.now() / 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always start with empty string for SSR — read cookie in useEffect only
  const [token, setTokenState] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showNotifiedOnly, setShowNotifiedOnlyState] = useState(false);

  // Read cookie + sessionStorage on mount (client only)
  useEffect(() => {
    const cookie = Cookies.get(AUTH_COOKIE);
    if (cookie && validateToken(cookie)) {
      setTokenState(cookie);
    }

    // Restore filter state from sessionStorage
    try {
      const saved = sessionStorage.getItem(FILTER_SESSION_KEY);
      if (saved === "true") setShowNotifiedOnlyState(true);
    } catch {
      // sessionStorage may not be available
    }

    setMounted(true);
  }, []);

  const setShowNotifiedOnly = useCallback((val: boolean) => {
    setShowNotifiedOnlyState(val);
    try {
      sessionStorage.setItem(FILTER_SESSION_KEY, val ? "true" : "false");
    } catch {
      // sessionStorage may not be available
    }
  }, []);

  const setToken = useCallback((newToken: string) => {
    if (newToken && !validateToken(newToken)) {
      newToken = "";
    }
    setTokenState(newToken);
    if (newToken) {
      // Prepend "JWT " for legacy backend cookie compatibility
      const cookieValue = newToken.startsWith(JWT_PREFIX) ? newToken : `${JWT_PREFIX}${newToken}`;
      Cookies.set(AUTH_COOKIE, cookieValue, {
        sameSite: "lax",
        secure: true,
        expires: 7,
        path: "/",
      });
    } else {
      Cookies.remove(AUTH_COOKIE, { path: "/" });
    }
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setIsAdmin(false);
    setShowNotifiedOnly(false);
  }, [setToken, setShowNotifiedOnly]);

  useEffect(() => {
    if (token) {
      checkIsAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && !validateToken(token)) {
      logout();
    }
  }, [token, logout]);

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
