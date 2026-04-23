import { NextResponse, type NextRequest } from "next/server";
import { ensureSeedAdminUser, findAdminByEmail } from "@/lib/auth/admin";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSession,
} from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const email = readString(body?.email).toLowerCase();
  const password = readString(body?.password);

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  await ensureSeedAdminUser();

  const user = await findAdminByEmail(email);
  const validPassword = user
    ? await verifyPassword(password, user.passwordHash, user.passwordSalt)
    : false;

  if (!user || !validPassword) {
    return NextResponse.json(
      { message: "The email or password is incorrect." },
      { status: 401 },
    );
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = await signSession({
    sub: String(user._id),
    email: user.email,
    role: "admin",
  });
  const response = NextResponse.json({
    ok: true,
    redirectTo: "/dashboard",
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  return response;
}
