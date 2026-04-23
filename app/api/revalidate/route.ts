import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { isContentBlockKey, revalidateContentKey } from "@/db/content";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret && process.env.NODE_ENV !== "production") {
    return true;
  }

  const header = request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const querySecret = request.nextUrl.searchParams.get("secret");

  return Boolean(secret && (bearer === secret || querySecret === secret));
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    key?: string;
    tag?: string;
    path?: string;
  };

  if (body.key) {
    if (!isContentBlockKey(body.key)) {
      return NextResponse.json(
        { error: `Unknown content key: ${body.key}` },
        { status: 404 },
      );
    }

    revalidateContentKey(body.key);
    return NextResponse.json({ revalidated: true, key: body.key });
  }

  if (body.tag) {
    revalidateTag(body.tag, "max");
  }

  if (body.path) {
    revalidatePath(body.path);
  }

  return NextResponse.json({
    revalidated: Boolean(body.tag || body.path),
    tag: body.tag,
    path: body.path,
  });
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const key = request.nextUrl.searchParams.get("key");
  const tag = request.nextUrl.searchParams.get("tag");
  const path = request.nextUrl.searchParams.get("path");

  if (key) {
    if (!isContentBlockKey(key)) {
      return NextResponse.json(
        { error: `Unknown content key: ${key}` },
        { status: 404 },
      );
    }

    revalidateContentKey(key);
    return NextResponse.json({ revalidated: true, key });
  }

  if (tag) {
    revalidateTag(tag, "max");
  }

  if (path) {
    revalidatePath(path);
  }

  return NextResponse.json({
    revalidated: Boolean(tag || path),
    tag,
    path,
  });
}
