/**
 * Proxy an auth request to the backend and forward Set-Cookie headers back.
 *
 * Vercel's rewrite proxy strips Set-Cookie headers from upstream responses,
 * so auth endpoints that set httpOnly cookies must go through these Route
 * Handlers instead of the rewrite. The Route Handler runs server-side on
 * Vercel, calls the backend directly, and copies the Set-Cookie headers
 * into the response it sends to the browser.
 */

import { NextRequest, NextResponse } from "next/server";

function getBackendUrl(): string {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000"
  );
}

export async function proxyAuthRequest(
  req: NextRequest,
  backendPath: string
): Promise<NextResponse> {
  const backendUrl = `${getBackendUrl()}${backendPath}`;

  // Forward the request body and cookies to the backend
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
    // No body (e.g. logout)
  }

  const backendRes = await fetch(backendUrl, {
    method: req.method,
    headers,
    body: body || undefined,
  });

  // Read the backend response body
  const responseBody = await backendRes.text();

  // Build the Next.js response
  const res = new NextResponse(responseBody, {
    status: backendRes.status,
    headers: {
      "Content-Type": backendRes.headers.get("Content-Type") || "application/json",
    },
  });

  // Forward ALL Set-Cookie headers from the backend to the browser
  const setCookies = backendRes.headers.getSetCookie();
  for (const cookie of setCookies) {
    res.headers.append("Set-Cookie", cookie);
  }

  return res;
}
