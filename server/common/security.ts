import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { tUserAccount } from "./user";
import { getUserWithId, isUserAdmin } from "../models/user.models";

// ── Token lifetime ──

const TOKEN_EXPIRY = "7d";

// ── Secrets ──

function getApiSecret(): string {
  const secret = process.env.API_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("API_SECRET must be set and at least 16 characters long");
  }
  return secret;
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

/** Sign a JWT token for a user (7 days) */
export function signToken(userId: number): string {
  return jwt.sign({ Id: userId }, getApiSecret(), {
    expiresIn: TOKEN_EXPIRY,
  });
}

// ── Middleware ──

/**
 * Verify JWT from the Authorization header (Bearer token) or auth-token cookie.
 * Sets req.user on success, returns 401 on failure.
 */
export const verify_token = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  // Check Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  // Fall back to cookie (legacy support)
  if (!token) {
    const cookie = req.cookies["auth-token"] as string | undefined;
    if (cookie && cookie.startsWith("JWT ")) {
      token = cookie.split(" ")[1];
    }
  }

  if (!token) {
    req.user = undefined;
    res.status(401).json({ error: "No token provided" });
    return;
  }

  jwt.verify(token, getApiSecret(), async function (err, decode) {
    if (err) {
      req.user = undefined;
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    try {
      const payload = decode as { Id: number };
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
