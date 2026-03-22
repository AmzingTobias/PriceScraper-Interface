import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { tUserAccount } from "./user";
import { getUserWithId, isUserAdmin } from "../models/user.models";

// ── Token lifetimes ──

const ACCESS_TOKEN_EXPIRY = "15m";
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes

const REFRESH_TOKEN_EXPIRY = "7d";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Secrets ──

function getApiSecret(): string {
  const secret = process.env.API_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("API_SECRET must be set and at least 16 characters long");
  }
  return secret;
}

/** Refresh tokens use a separate secret derived from the main one */
function getRefreshSecret(): string {
  return getApiSecret() + "_refresh";
}

// ── Password hashing ──

export const hashPassword = async (raw_password: string): Promise<string> => {
  const saltRounds = Number(process.env.PASSWORD_SALT_ROUNDS) || 12;
  return bcrypt.hash(raw_password, saltRounds);
};

export const compare_hashed_password = async (
  raw_password: string,
  hashed_password: string
): Promise<boolean> => {
  return bcrypt.compare(raw_password, hashed_password);
};

// ── Token signing ──

/** Sign a short-lived access token (15 minutes) */
export function signAccessToken(userId: number): string {
  return jwt.sign({ Id: userId, type: "access" }, getApiSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/** Sign a long-lived refresh token (7 days) */
export function signRefreshToken(userId: number): string {
  return jwt.sign({ Id: userId, type: "refresh" }, getRefreshSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

// ── Cookie management ──

const isProduction = () => process.env.NODE_ENV === "production";

/** Set both auth cookies: short-lived access + long-lived refresh */
export function setAuthCookies(res: Response, userId: number): void {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  res.cookie("auth-token", `JWT ${accessToken}`, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    maxAge: ACCESS_COOKIE_MAX_AGE,
    path: "/",
  });

  res.cookie("refresh-token", `JWT ${refreshToken}`, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: "/api/users/refresh", // Only sent to the refresh endpoint
  });
}

/** Clear both auth cookies */
export function clearAuthCookies(res: Response): void {
  res.clearCookie("auth-token", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
  });
  res.clearCookie("refresh-token", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/api/users/refresh",
  });
}

// ── Middleware ──

/**
 * Verify the access token from the auth-token cookie.
 * Sets req.user on success, returns 401 on failure.
 */
export const verify_token = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookie = req.cookies["auth-token"] as string | undefined;

  if (!cookie || !cookie.startsWith("JWT ")) {
    req.user = undefined;
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const token = cookie.split(" ")[1];

  jwt.verify(token, getApiSecret(), async function (err, decode) {
    if (err) {
      req.user = undefined;
      // Distinguish expired from invalid so the frontend knows to try refreshing
      if (err.name === "TokenExpiredError") {
        res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
      } else {
        res.status(401).json({ error: "Invalid token" });
      }
      return;
    }
    try {
      const payload = decode as { Id: number; type?: string };
      // Reject refresh tokens used as access tokens
      if (payload.type === "refresh") {
        req.user = undefined;
        res.status(401).json({ error: "Invalid token type" });
        return;
      }
      const user = await getUserWithId(payload.Id);
      req.user = user;
      next();
    } catch {
      req.user = undefined;
      res.status(401).json({ error: "Invalid token" });
    }
  });
};

/**
 * Verify the refresh token from the refresh-token cookie.
 * Returns the user ID if valid, null otherwise.
 */
export function verifyRefreshToken(refreshCookie: string): Promise<number | null> {
  return new Promise((resolve) => {
    if (!refreshCookie || !refreshCookie.startsWith("JWT ")) {
      resolve(null);
      return;
    }

    const token = refreshCookie.split(" ")[1];

    jwt.verify(token, getRefreshSecret(), (err, decode) => {
      if (err) {
        resolve(null);
        return;
      }
      const payload = decode as { Id: number; type?: string };
      // Must be a refresh token, not an access token
      if (payload.type !== "refresh") {
        resolve(null);
        return;
      }
      resolve(payload.Id);
    });
  });
}

/**
 * Middleware: verify the authenticated user is an admin.
 * Must be used after verify_token.
 */
export const verify_token_is_admin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user !== undefined) {
    const admin = await isUserAdmin(req.user.Id);
    if (admin) {
      next();
      return;
    }
  }
  res.status(401).json({ error: "Unauthorized" });
};
