import { NextResponse, type NextRequest } from "next/server";
import { findAdminByEmail, findAdminById } from "@/lib/auth/admin";
import { getSessionFromRequest } from "@/lib/auth/api";
import { verifyTotpCode } from "@/lib/auth/totp";

export const runtime = "nodejs";

const MAX_OTP_ATTEMPTS = 5;
const OTP_WINDOW_MS = 5 * 60 * 1000;
const OTP_LOCK_MS = 5 * 60 * 1000;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function minutesUntil(target: number) {
  return Math.max(1, Math.ceil((target - Date.now()) / 60_000));
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const otp = readString(body?.otp);
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

  const now = Date.now();
  const lockedUntil = user.otpLockedUntil?.getTime() ?? 0;

  // Still inside an active lockout window.
  if (lockedUntil > now) {
    const minutes = minutesUntil(lockedUntil);
    return NextResponse.json(
      {
        message: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
        lockedUntil: new Date(lockedUntil).toISOString(),
      },
      { status: 429 },
    );
  }

  if (verifyTotpCode(user.totpSecret, otp)) {
    user.passwordChangeVerifiedAt = new Date();
    user.otpFailedAttempts = 0;
    user.otpAttemptWindowAt = undefined;
    user.otpLockedUntil = undefined;
    await user.save();

    return NextResponse.json({ verified: true });
  }

  // Failed attempt — count it inside a rolling 5-minute window.
  const windowStartedAt = user.otpAttemptWindowAt?.getTime() ?? 0;
  const windowActive = windowStartedAt > 0 && now - windowStartedAt <= OTP_WINDOW_MS;
  const attempts = (windowActive ? user.otpFailedAttempts ?? 0 : 0) + 1;

  if (attempts >= MAX_OTP_ATTEMPTS) {
    user.otpFailedAttempts = 0;
    user.otpAttemptWindowAt = undefined;
    user.otpLockedUntil = new Date(now + OTP_LOCK_MS);
    await user.save();

    return NextResponse.json(
      {
        message: "Too many attempts. Locked for 5 minutes.",
        lockedUntil: user.otpLockedUntil.toISOString(),
      },
      { status: 429 },
    );
  }

  user.otpFailedAttempts = attempts;
  user.otpAttemptWindowAt = windowActive ? user.otpAttemptWindowAt : new Date(now);
  await user.save();

  const remaining = MAX_OTP_ATTEMPTS - attempts;
  return NextResponse.json(
    {
      message: `That authenticator code did not verify. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`,
    },
    { status: 400 },
  );
}
