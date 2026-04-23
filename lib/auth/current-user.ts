import "server-only";

import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken } from "./session";

export async function getCurrentAdminSession() {
  const cookieStore = await cookies();

  return verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}
