import "server-only";

import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "./session";

export async function getSessionFromRequest(request: NextRequest) {
  return verifySessionToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}

export async function requireAdminRequest(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return null;
  }

  return session;
}
