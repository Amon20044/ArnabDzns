import { NextResponse, type NextRequest } from "next/server";
import { findAdminByEmail, findAdminById } from "@/lib/auth/admin";
import { getSessionFromRequest } from "@/lib/auth/api";
import { verifyTotpCode } from "@/lib/auth/totp";

export const runtime = "nodejs";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

  if (!verifyTotpCode(user.totpSecret, otp)) {
    return NextResponse.json(
      { message: "That authenticator code did not verify." },
      { status: 400 },
    );
  }

  user.passwordChangeVerifiedAt = new Date();
  await user.save();

  return NextResponse.json({ verified: true });
}
