import { NextResponse, type NextRequest } from "next/server";
import { requireAdminRequest } from "@/lib/auth/api";
import {
  uploadImageToImgBB,
  type ImgBBImageInput,
  type ImgBBUploadOptions,
  type ImgBBUploadResult,
} from "@/lib/imgbb";

export const runtime = "nodejs";
// Allow large originals — the source is uploaded as-is without re-encoding.
export const maxDuration = 60;

function toAssetLabel(filename: string) {
  return filename
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAssetLabel(label: string) {
  if (!label) {
    return "";
  }

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function readBoolean(value: FormDataEntryValue | null): boolean {
  if (value === null) return false;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

async function uploadWithRetry(
  input: ImgBBImageInput,
  options: ImgBBUploadOptions,
  attempts = 3,
): Promise<ImgBBUploadResult> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await uploadImageToImgBB(input, options);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const backoff = 350 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("ImgBB upload failed.");
}

export async function POST(request: NextRequest) {
  const session = await requireAdminRequest(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData
      .getAll("file")
      .concat(formData.getAll("files"))
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (!files.length) {
      return NextResponse.json(
        { error: "Attach at least one image file." },
        { status: 400 },
      );
    }

    // Convert to lossless WebP only when the client explicitly asks.
    // Default: preserve the original bytes so fidelity is never touched.
    const convert =
      readBoolean(formData.get("convert")) ||
      readBoolean(formData.get("webp")) ||
      readBoolean(formData.get("lossless"));

    const uploads = await Promise.all(
      files.map(async (file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error(`"${file.name}" is not a supported image file.`);
        }

        // expiration is intentionally NOT passed -> ImgBB stores the image
        // permanently (never expires).
        const upload = await uploadWithRetry(file, {
          name: file.name,
          convert,
        });
        const title = normalizeAssetLabel(toAssetLabel(file.name));
        const width = Number(upload.data.width) || upload.source.width;
        const height = Number(upload.data.height) || upload.source.height;

        return {
          id: upload.data.id,
          src: upload.url,
          displaySrc: upload.displayUrl,
          width,
          height,
          aspectRatio:
            width && height && height > 0 ? width / height : undefined,
          alt: title,
          title,
          desc: "",
          mimeType: upload.source.mimeType,
          byteLength: upload.source.byteLength,
          converted: upload.source.converted,
        };
      }),
    );

    return NextResponse.json({
      assets: uploads,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "ImgBB upload failed.",
      },
      { status: 500 },
    );
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
    },
  });
}
