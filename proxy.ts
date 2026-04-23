import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const protectedRoutes = ["/dashboard", "/change-password"];

function isProtectedPath(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const nextPath = getSafeRedirectPath(request.nextUrl.searchParams.get("next"));
  const session = await verifySessionToken(
    request.cookies.get(AUTH_COOKIE_NAME)?.value,
  );

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  if (isProtectedPath(pathname) && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/change-password/:path*"],
};
