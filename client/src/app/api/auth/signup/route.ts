import { NextRequest } from "next/server";
import { proxyAuthRequest } from "../proxy";

export async function POST(req: NextRequest) {
  return proxyAuthRequest(req, "/api/users/signup");
}
