import { NextResponse, type NextRequest } from "next/server";
import {
  deleteContentBlock,
  getContentBlock,
  isContentBlockKey,
  revalidateContentKey,
  sanitizeContentImages,
  upsertContentBlock,
  type ContentBlockUpdate,
} from "@/db/content";
import { isAdminRequestAuthorized } from "@/lib/auth/api";

export const runtime = "nodejs";

type ContentRouteContext = {
  params: Promise<{
    key: string;
  }>;
};

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function toUpdatePayload(input: unknown): ContentBlockUpdate {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Request body must be a JSON object.");
  }

  const body = input as Record<string, unknown>;
  const update: ContentBlockUpdate = {};

  if ("title" in body) {
    const title = body.title;

    if (typeof title !== "string" && !Array.isArray(title)) {
      throw new Error("title must be a string or an array of strings.");
    }

    update.title = title as string | string[];
  }

  if ("desc" in body) {
    update.desc = String(body.desc ?? "");
  }

  if ("description" in body) {
    update.description = String(body.description ?? "");
  }

  if ("text" in body) {
    update.text = String(body.text ?? "");
  }

  if ("color" in body) {
    update.color = String(body.color ?? "");
  }

  if ("order" in body) {
    const order = Number(body.order);

    if (!Number.isFinite(order)) {
      throw new Error("order must be a number.");
    }

    update.order = order;
  }

  if ("images" in body) {
    update.images = sanitizeContentImages(body.images);
  }

  if ("items" in body) {
    if (!Array.isArray(body.items)) {
      throw new Error("items must be an array.");
    }

    update.items = body.items;
  }

  if ("data" in body) {
    update.data = body.data;
  }

  if ("active" in body) {
    update.active = Boolean(body.active);
  }

  return update;
}

export async function GET(_request: NextRequest, context: ContentRouteContext) {
  if (!(await isAdminRequestAuthorized(_request))) {
    return badRequest("Unauthorized.", 401);
  }

  const { key } = await context.params;

  if (!isContentBlockKey(key)) {
    return badRequest(`Unknown content key: ${key}`, 404);
  }

  const block = await getContentBlock(key);
  return NextResponse.json({ block });
}

export async function PATCH(request: NextRequest, context: ContentRouteContext) {
  if (!(await isAdminRequestAuthorized(request))) {
    return badRequest("Unauthorized.", 401);
  }

  const { key } = await context.params;

  if (!isContentBlockKey(key)) {
    return badRequest(`Unknown content key: ${key}`, 404);
  }

  let update: ContentBlockUpdate;

  try {
    update = toUpdatePayload(await request.json());
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Invalid JSON.");
  }

  const block = await upsertContentBlock(key, update);
  revalidateContentKey(key);

  return NextResponse.json({
    block,
    revalidated: true,
  });
}

export async function PUT(request: NextRequest, context: ContentRouteContext) {
  return PATCH(request, context);
}

export async function DELETE(request: NextRequest, context: ContentRouteContext) {
  if (!(await isAdminRequestAuthorized(request))) {
    return badRequest("Unauthorized.", 401);
  }

  const { key } = await context.params;

  if (!isContentBlockKey(key)) {
    return badRequest(`Unknown content key: ${key}`, 404);
  }

  await deleteContentBlock(key);
  revalidateContentKey(key);

  return NextResponse.json({
    deleted: true,
    revalidated: true,
  });
}
