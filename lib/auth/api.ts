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

export async function isAdminRequestAuthorized(
  request: NextRequest,
  options?: {
    allowSecret?: boolean;
  },
) {
  const session = await getSessionFromRequest(request);

  if (session) {
    return true;
  }

  if (options?.allowSecret === false) {
    return false;
  }

  const secret = process.env.REVALIDATE_SECRET;

  if (!secret && process.env.NODE_ENV !== "production") {
    return true;
  }

  const header = request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const querySecret = request.nextUrl.searchParams.get("secret");

  return Boolean(secret && (bearer === secret || querySecret === secret));
}
