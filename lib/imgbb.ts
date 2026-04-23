import "server-only";

import { readFile } from "node:fs/promises";
import { basename, parse } from "node:path";
import sharp from "sharp";

const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";
const IMGBB_MAX_UPLOAD_BYTES = 32 * 1024 * 1024;
const WEBP_MIME_TYPE = "image/webp";

export type ImgBBImageInput =
  | string
  | URL
  | Buffer
  | ArrayBuffer
  | Uint8Array
  | Blob
  | File;

export type ConvertImageToWebPOptions = {
  name?: string;
  preserveMetadata?: boolean;
};

export type LosslessWebPImage = {
  buffer: Buffer;
  filename: string;
  mimeType: typeof WEBP_MIME_TYPE;
  byteLength: number;
  width?: number;
  height?: number;
};

export type ImgBBUploadOptions = ConvertImageToWebPOptions & {
  expiration?: number;
  maxUploadBytes?: number;
};

export type ImgBBImageVariant = {
  filename: string;
  name: string;
  mime: string;
  extension: string;
  url: string;
};

export type ImgBBUploadData = {
  id: string;
  title: string;
  url_viewer: string;
  url: string;
  display_url: string;
  width: string;
  height: string;
  size: string;
  time: string;
  expiration: string;
  image: ImgBBImageVariant;
  thumb: ImgBBImageVariant;
  medium?: ImgBBImageVariant;
  delete_url: string;
};

export type ImgBBUploadResult = {
  success: true;
  status: number;
  data: ImgBBUploadData;
  converted: LosslessWebPImage;
  url: string;
  displayUrl: string;
  viewerUrl: string;
  deleteUrl: string;
};

type ImgBBApiResponse = {
  data?: ImgBBUploadData;
  success?: boolean;
  status?: number;
  error?: string | { code?: number; message?: string };
};

type ReadImageInputResult = {
  buffer: Buffer;
  filename: string;
};

export async function convertImageToLosslessWebP(
  input: ImgBBImageInput,
  options: ConvertImageToWebPOptions = {},
): Promise<LosslessWebPImage> {
  const source = await readImageInput(input, options.name);

  if (source.buffer.byteLength === 0) {
    throw new Error("Cannot convert an empty image.");
  }

  let pipeline = sharp(source.buffer, {
    animated: true,
    failOn: "none",
  }).rotate();

  if (options.preserveMetadata) {
    pipeline = pipeline.withMetadata();
  }

  const { data, info } = await pipeline
    .webp({
      lossless: true,
      nearLossless: false,
      quality: 100,
      effort: 6,
    })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    filename: toWebPFilename(options.name ?? source.filename),
    mimeType: WEBP_MIME_TYPE,
    byteLength: data.byteLength,
    width: info.width,
    height: info.height,
  };
}

export async function uploadImageToImgBB(
  input: ImgBBImageInput,
  options: ImgBBUploadOptions = {},
): Promise<ImgBBUploadResult> {
  const converted = await convertImageToLosslessWebP(input, options);
  assertUploadSize(converted.byteLength, options.maxUploadBytes);

  const endpoint = new URL(IMGBB_UPLOAD_URL);
  endpoint.searchParams.set("key", readImgBBKey());

  if (options.expiration !== undefined) {
    endpoint.searchParams.set(
      "expiration",
      String(validateExpiration(options.expiration)),
    );
  }

  const formData = new FormData();
  formData.set(
    "image",
    new Blob([toArrayBuffer(converted.buffer)], { type: converted.mimeType }),
    converted.filename,
  );

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });
  const payload = await readImgBBResponse(response);

  if (!response.ok || payload.success !== true || !payload.data) {
    throw new Error(
      `ImgBB upload failed (${response.status}): ${readImgBBError(payload)}`,
    );
  }

  return {
    success: true,
    status: payload.status ?? response.status,
    data: payload.data,
    converted,
    url: payload.data.image?.url ?? payload.data.url,
    displayUrl: payload.data.display_url,
    viewerUrl: payload.data.url_viewer,
    deleteUrl: payload.data.delete_url,
  };
}

async function readImageInput(
  input: ImgBBImageInput,
  preferredName?: string,
): Promise<ReadImageInputResult> {
  if (typeof input === "string") {
    const dataUrlImage = readImageDataUrl(input, preferredName);

    if (dataUrlImage) {
      return dataUrlImage;
    }

    const remoteUrl = readRemoteUrl(input);

    if (remoteUrl) {
      return fetchImageUrl(remoteUrl, preferredName);
    }

    return {
      buffer: await readFile(input),
      filename: preferredName ?? basename(input),
    };
  }

  if (input instanceof URL) {
    if (isRemoteImageUrl(input)) {
      return fetchImageUrl(input, preferredName);
    }

    if (input.protocol === "file:") {
      return {
        buffer: await readFile(input),
        filename: preferredName ?? basename(input.pathname),
      };
    }

    throw new Error(`Unsupported image URL protocol: ${input.protocol}`);
  }

  if (Buffer.isBuffer(input)) {
    return {
      buffer: input,
      filename: preferredName ?? "image",
    };
  }

  if (input instanceof ArrayBuffer) {
    return {
      buffer: Buffer.from(input),
      filename: preferredName ?? "image",
    };
  }

  if (input instanceof Uint8Array) {
    return {
      buffer: Buffer.from(input),
      filename: preferredName ?? "image",
    };
  }

  if (isBlob(input)) {
    return {
      buffer: Buffer.from(await input.arrayBuffer()),
      filename: preferredName ?? readBlobName(input) ?? "image",
    };
  }

  throw new Error("Unsupported image input.");
}

function readImageDataUrl(
  value: string,
  preferredName?: string,
): ReadImageInputResult | null {
  const match = /^data:(image\/[a-z0-9.+-]+)?(;base64)?,(.*)$/i.exec(value);

  if (!match) {
    return null;
  }

  const mimeType = match[1] ?? "image";
  const isBase64 = Boolean(match[2]);
  const data = match[3] ?? "";

  return {
    buffer: isBase64
      ? Buffer.from(data, "base64")
      : Buffer.from(decodeURIComponent(data), "utf8"),
    filename: preferredName ?? `image.${extensionFromMimeType(mimeType)}`,
  };
}

function readRemoteUrl(value: string) {
  try {
    const url = new URL(value);
    return isRemoteImageUrl(url) ? url : null;
  } catch {
    return null;
  }
}

function isRemoteImageUrl(url: URL) {
  return url.protocol === "http:" || url.protocol === "https:";
}

async function fetchImageUrl(
  url: URL,
  preferredName?: string,
): Promise<ReadImageInputResult> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Image fetch failed (${response.status}) for ${url.href}`);
  }

  const contentType = response.headers.get("content-type");

  if (contentType && !contentType.toLowerCase().startsWith("image/")) {
    throw new Error(`URL did not return an image: ${contentType}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    filename:
      preferredName ??
      safeDecodeURIComponent(basename(url.pathname)) ??
      "image",
  };
}

function readBlobName(blob: Blob) {
  return typeof File !== "undefined" && blob instanceof File ? blob.name : null;
}

function isBlob(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

function extensionFromMimeType(mimeType: string) {
  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  if (mimeType === "image/svg+xml") {
    return "svg";
  }

  return mimeType.split("/").at(1)?.replace("+xml", "") || "image";
}

function toWebPFilename(filename: string) {
  const parsed = parse(filename.trim() || "image");
  const stem = (parsed.name || parsed.base || "image")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${stem || "image"}.webp`;
}

function readImgBBKey() {
  const key = process.env.IMGBB_KEY?.trim();

  if (!key) {
    throw new Error("IMGBB_KEY must be set before uploading images to ImgBB.");
  }

  return key;
}

function validateExpiration(expiration: number) {
  if (
    !Number.isInteger(expiration) ||
    expiration < 60 ||
    expiration > 15552000
  ) {
    throw new Error("ImgBB expiration must be an integer from 60 to 15552000.");
  }

  return expiration;
}

function assertUploadSize(byteLength: number, maxUploadBytes = IMGBB_MAX_UPLOAD_BYTES) {
  if (byteLength > maxUploadBytes) {
    throw new Error(
      `Converted WebP is ${byteLength} bytes, which is above ImgBB's ${maxUploadBytes} byte upload limit.`,
    );
  }
}

function toArrayBuffer(buffer: Buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);
  return arrayBuffer;
}

async function readImgBBResponse(response: Response): Promise<ImgBBApiResponse> {
  try {
    return (await response.json()) as ImgBBApiResponse;
  } catch {
    return {
      success: false,
      status: response.status,
      error: "ImgBB returned a non-JSON response.",
    };
  }
}

function readImgBBError(payload: ImgBBApiResponse) {
  if (typeof payload.error === "string") {
    return payload.error;
  }

  return payload.error?.message ?? "Unknown ImgBB error.";
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
