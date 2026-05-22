import { NextResponse, type NextRequest } from "next/server";
import { findAdminByEmail, findAdminById } from "@/lib/auth/admin";
import { getSessionFromRequest } from "@/lib/auth/api";
import { hashPassword, isStrongEnoughPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

const PASSWORD_CHANGE_WINDOW_MS = 10 * 60 * 1000;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const password = readString(body?.password);
  const confirmPassword = readString(body?.confirmPassword);
  const email = readString(body?.email).toLowerCase();

  const user = session
    ? await findAdminById(session.sub)
    : email
      ? await findAdminByEmail(email)
      : null;

  if (!user) {
    return NextResponse.json(
      { message: "No admin account matches that email." },
      { status: 404 },
    );
  }

  if (!isStrongEnoughPassword(password)) {
    return NextResponse.json(
      { message: "Use at least 8 characters for the new password." },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { message: "Password confirmation does not match." },
      { status: 400 },
    );
  }

  const verifiedAt = user.passwordChangeVerifiedAt?.getTime() ?? 0;

  if (Date.now() - verifiedAt > PASSWORD_CHANGE_WINDOW_MS) {
    return NextResponse.json(
      { message: "Verify an authenticator code before changing the password." },
      { status: 403 },
    );
  }

  const nextPassword = await hashPassword(password);
  user.passwordHash = nextPassword.passwordHash;
  user.passwordSalt = nextPassword.passwordSalt;
  user.passwordChangedAt = new Date();
  user.passwordChangeVerifiedAt = undefined;
  await user.save();

  return NextResponse.json({ changed: true });
}
