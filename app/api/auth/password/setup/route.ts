import { NextResponse, type NextRequest } from "next/server";
import { findAdminById } from "@/lib/auth/admin";
import { requireAdminRequest } from "@/lib/auth/api";
import { createOtpAuthUri, createOtpQrDataUrl, generateTotpSecret } from "@/lib/auth/totp";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await requireAdminRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const user = await findAdminById(session.sub);

  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  if (!user.totpSecret) {
    user.totpSecret = generateTotpSecret();
    await user.save();
  }

  const qrDataUrl = await createOtpQrDataUrl(user.email, user.totpSecret);

  return NextResponse.json({
    email: user.email,
    secret: user.totpSecret,
    otpauthUrl: createOtpAuthUri(user.email, user.totpSecret),
    qrDataUrl,
  });
}
