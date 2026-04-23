import { NextResponse, type NextRequest } from "next/server";
import { findAdminById } from "@/lib/auth/admin";
import { requireAdminRequest } from "@/lib/auth/api";
import { verifyTotpCode } from "@/lib/auth/totp";

export const runtime = "nodejs";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const session = await requireAdminRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const otp = readString(body?.otp);
  const user = await findAdminById(session.sub);

  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
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
