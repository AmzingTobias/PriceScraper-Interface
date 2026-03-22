/**
 * Proxy auth requests to the backend and re-set cookies from the Vercel domain.
 *
 * Vercel's rewrite proxy strips Set-Cookie headers from upstream responses.
 * These Route Handlers call the backend directly, parse the Set-Cookie
 * headers from the response, and re-set the cookies using NextResponse
 * so they're properly scoped to the frontend domain.
 *
 * The refresh token path is rewritten from the backend's /api/users/refresh
 * to the frontend's /api/auth/refresh.
 */

import { NextRequest, NextResponse } from "next/server";

function getBackendUrl(): string {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000"
  );
}

/** Parse a Set-Cookie header string into name, value, and attributes */
function parseSetCookie(header: string): {
  name: string;
  value: string;
  attributes: Record<string, string | true>;
} | null {
  const parts = header.split(";").map((s) => s.trim());
  if (parts.length === 0) return null;

  const [first, ...rest] = parts;
  const eqIndex = first.indexOf("=");
  if (eqIndex === -1) return null;

  const name = first.substring(0, eqIndex).trim();
  const value = first.substring(eqIndex + 1).trim();

  const attributes: Record<string, string | true> = {};
  for (const part of rest) {
    const attrEq = part.indexOf("=");
    if (attrEq === -1) {
      attributes[part.toLowerCase()] = true;
    } else {
      attributes[part.substring(0, attrEq).trim().toLowerCase()] = part
        .substring(attrEq + 1)
        .trim();
    }
  }

  return { name, value, attributes };
}

export async function proxyAuthRequest(
  req: NextRequest,
  backendPath: string
): Promise<NextResponse> {
  const backendUrl = `${getBackendUrl()}${backendPath}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Forward existing cookies (needed for refresh/logout which read cookies)
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    headers["Cookie"] = cookieHeader;
  }

  let body: string | undefined;
  try {
    body = await req.text();
  } catch {
    // No body
  }

  const backendRes = await fetch(backendUrl, {
    method: req.method,
    headers,
    body: body || undefined,
  });

  const responseBody = await backendRes.text();

  const res = new NextResponse(responseBody, {
    status: backendRes.status,
    headers: {
      "Content-Type":
        backendRes.headers.get("Content-Type") || "application/json",
    },
  });

  // Parse and re-set cookies from the backend
  const setCookies = backendRes.headers.getSetCookie();
  for (const rawCookie of setCookies) {
    const parsed = parseSetCookie(rawCookie);
    if (!parsed) continue;

    const { name, value, attributes } = parsed;

    // Rewrite the refresh token path from backend to frontend
    let path = typeof attributes["path"] === "string" ? attributes["path"] : "/";
    if (path === "/api/users/refresh") {
      path = "/api/auth/refresh";
    }

    const cookieOptions: string[] = [`${name}=${value}`];
    cookieOptions.push(`Path=${path}`);

    if (attributes["max-age"]) {
      cookieOptions.push(`Max-Age=${attributes["max-age"]}`);
    }
    if (attributes["httponly"]) {
      cookieOptions.push("HttpOnly");
    }
    if (attributes["secure"]) {
      cookieOptions.push("Secure");
    }
    if (attributes["samesite"]) {
      cookieOptions.push(
        `SameSite=${typeof attributes["samesite"] === "string" ? attributes["samesite"] : "Lax"}`
      );
    }

    // Explicitly do NOT forward Domain — let the browser scope it to the current origin
    res.headers.append("Set-Cookie", cookieOptions.join("; "));
  }

  return res;
}
