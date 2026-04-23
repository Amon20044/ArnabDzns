import { NextResponse, type NextRequest } from "next/server";
import { requireAdminRequest } from "@/lib/auth/api";
import { uploadImageToImgBB } from "@/lib/imgbb";

export const runtime = "nodejs";

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

    const uploads = await Promise.all(
      files.map(async (file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error(`"${file.name}" is not a supported image file.`);
        }

        const upload = await uploadImageToImgBB(file, {
          name: file.name,
        });
        const title = normalizeAssetLabel(toAssetLabel(file.name));
        const width = Number(upload.data.width) || upload.converted.width;
        const height = Number(upload.data.height) || upload.converted.height;

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
