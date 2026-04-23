import { NextResponse, type NextRequest } from "next/server";
import { listContentBlocks } from "@/db/content";
import { isAdminRequestAuthorized } from "@/lib/auth/api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authorized = await isAdminRequestAuthorized(request);

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const blocks = await listContentBlocks();

  return NextResponse.json({
    blocks,
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, OPTIONS",
    },
  });
}
