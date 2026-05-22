import { NextResponse, type NextRequest } from "next/server";
import { findAdminByEmail, findAdminById, isAllowedAdminEmail } from "@/lib/auth/admin";
import { getSessionFromRequest } from "@/lib/auth/api";
import { createOtpAuthUri, createOtpQrDataUrl, generateTotpSecret } from "@/lib/auth/totp";

export const runtime = "nodejs";

function readEmail(value: string | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const email = readEmail(request.nextUrl.searchParams.get("email"));

  if (!session && !email) {
    return NextResponse.json(
      { message: "Enter your admin email to continue.", needsEmail: true },
      { status: 400 },
    );
  }

  // Only the single allowed admin account may use this flow.
  if (!session && !isAllowedAdminEmail(email)) {
    return NextResponse.json(
      { message: "No admin account matches that email." },
      { status: 404 },
    );
  }

  // Identify the account by an active session first, otherwise by the email
  // provided in the public "reset via authenticator" flow.
  const user = session
    ? await findAdminById(session.sub)
    : await findAdminByEmail(email);

  if (!user || !isAllowedAdminEmail(user.email)) {
    return NextResponse.json(
      { message: "No admin account matches that email." },
      { status: 404 },
    );
  }

  const wasUnpaired = !user.totpSecret;

  if (wasUnpaired) {
    user.totpSecret = generateTotpSecret();
    await user.save();
  }

  // Only reveal the secret/QR for first-time pairing, or to an already
  // authenticated admin re-pairing. Never expose an existing secret to an
  // anonymous visitor who merely typed the email.
  const reveal = wasUnpaired || Boolean(session);

  return NextResponse.json({
    email: user.email,
    paired: !wasUnpaired,
    ...(reveal
      ? {
          secret: user.totpSecret,
          otpauthUrl: createOtpAuthUri(user.email, user.totpSecret),
          qrDataUrl: await createOtpQrDataUrl(user.email, user.totpSecret),
        }
      : {}),
  });
}
