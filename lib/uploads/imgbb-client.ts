const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";
const WEBP_MIME_TYPE = "image/webp";

export type UploadedImgBBAsset = {
  id: string;
  src: string;
  displaySrc?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  alt?: string;
  title?: string;
  desc?: string;
  mimeType?: string;
  byteLength?: number;
  converted?: boolean;
};

type ImgBBImageVariant = {
  filename?: string;
  name?: string;
  mime?: string;
  extension?: string;
  url?: string;
};

type ImgBBUploadData = {
  id?: string;
  title?: string;
  url?: string;
  display_url?: string;
  width?: string | number;
  height?: string | number;
  size?: string | number;
  image?: ImgBBImageVariant;
};

export type ImgBBClientUploadResponse = {
  data?: ImgBBUploadData;
  success?: boolean;
  status?: number;
  error?: string | { code?: number; message?: string };
};

export function getImgBBClientUploadUrl() {
  const key = process.env.NEXT_PUBLIC_IMGBB_KEY?.trim();

  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_IMGBB_KEY must be set for direct browser uploads to ImgBB.",
    );
  }

  const endpoint = new URL(IMGBB_UPLOAD_URL);
  endpoint.searchParams.set("key", key);
  return endpoint.toString();
}

export function createImgBBUploadFormData(
  blob: Blob,
  filename: string,
  mimeType?: string,
) {
  const formData = new FormData();
  formData.set(
    "image",
    new File([blob], filename, { type: mimeType || blob.type }),
    filename,
  );
  return formData;
}

export function readImgBBClientError(
  payload: ImgBBClientUploadResponse | undefined,
  status?: number,
) {
  if (typeof payload?.error === "string") {
    return payload.error;
  }

  return (
    payload?.error?.message ??
    (status ? `ImgBB upload failed (${status}).` : "ImgBB upload failed.")
  );
}

export function imgBBResponseToUploadedAsset(
  payload: ImgBBClientUploadResponse,
  fallback: {
    filename: string;
    mimeType?: string;
    byteLength?: number;
    converted?: boolean;
  },
): UploadedImgBBAsset {
  const data = payload.data;
  const src = data?.image?.url ?? data?.url;

  if (payload.success !== true || !data || !src) {
    throw new Error(readImgBBClientError(payload, payload.status));
  }

  const width = readPositiveNumber(data.width);
  const height = readPositiveNumber(data.height);
  const byteLength = readPositiveNumber(data.size) ?? fallback.byteLength;
  const title = normalizeAssetLabel(
    data.title ?? data.image?.name ?? toAssetLabel(fallback.filename),
  );

  return {
    id: data.id ?? src,
    src,
    displaySrc: data.display_url,
    width,
    height,
    aspectRatio: width && height ? width / height : undefined,
    alt: title,
    title,
    desc: "",
    mimeType: data.image?.mime ?? fallback.mimeType,
    byteLength,
    converted: fallback.converted ?? false,
  };
}

export async function uploadImageToImgBBFromClient(file: File) {
  const webp = await convertImageFileToWebP(file);
  const response = await fetch(getImgBBClientUploadUrl(), {
    method: "POST",
    body: createImgBBUploadFormData(webp.blob, webp.filename, webp.mimeType),
  });
  const payload = (await response.json().catch(() => ({}))) as
    | ImgBBClientUploadResponse
    | undefined;

  if (!response.ok) {
    throw new Error(readImgBBClientError(payload, response.status));
  }

  return imgBBResponseToUploadedAsset(payload ?? {}, {
    filename: webp.filename,
    mimeType: webp.mimeType,
    byteLength: webp.blob.size,
    converted: true,
  });
}

export async function convertImageFileToWebP(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  try {
    const blob =
      typeof OffscreenCanvas !== "undefined"
        ? await convertWithOffscreenCanvas(bitmap)
        : await convertWithHtmlCanvas(bitmap);

    return {
      blob,
      filename: toWebPFilename(file.name),
      mimeType: WEBP_MIME_TYPE,
      width: bitmap.width,
      height: bitmap.height,
    };
  } finally {
    bitmap.close();
  }
}

export function toWebPFilename(filename: string) {
  const trimmed = filename.trim() || "image";
  const withoutExtension = trimmed.replace(/\.[a-z0-9]+$/i, "");
  const stem = withoutExtension
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${stem || "image"}.webp`;
}

async function convertWithOffscreenCanvas(bitmap: ImageBitmap) {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create a browser image conversion context.");
  }

  context.drawImage(bitmap, 0, 0);
  return canvas.convertToBlob({ type: WEBP_MIME_TYPE, quality: 1 });
}

async function convertWithHtmlCanvas(bitmap: ImageBitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create a browser image conversion context.");
  }

  context.drawImage(bitmap, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Browser could not convert this image to WebP."));
        }
      },
      WEBP_MIME_TYPE,
      1,
    );
  });
}

function readPositiveNumber(value: string | number | undefined) {
  const parsed =
    typeof value === "number" ? value : value ? Number.parseFloat(value) : NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

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
