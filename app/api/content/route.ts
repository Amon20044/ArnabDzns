import { NextResponse } from "next/server";
import { listContentBlocks } from "@/db/content";

export const runtime = "nodejs";

export async function GET() {
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
