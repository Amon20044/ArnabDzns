const encoder = new TextEncoder();

export const AUTH_COOKIE_NAME = "arnab_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 2;

export interface AdminSessionPayload {
  sub: string;
  email: string;
  role: "admin";
  iat: number;
  exp: number;
}

function getSecret() {
  const secret = process.env.AUTH_JWT_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_JWT_SECRET is required in production.");
  }

  return "arnab-local-dev-secret-change-me";
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeJson(value: unknown) {
  return bytesToBase64Url(encoder.encode(JSON.stringify(value)));
}

function decodeJson<T>(value: string) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value))) as T;
}

async function signData(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));

  return bytesToBase64Url(new Uint8Array(signature));
}

export async function signSession(payload: Omit<AdminSessionPayload, "iat" | "exp">) {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const body = encodeJson({
    ...payload,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  } satisfies AdminSessionPayload);
  const signature = await signData(`${header}.${body}`);

  return `${header}.${body}.${signature}`;
}

export async function verifySessionToken(token?: string) {
  if (!token) {
    return null;
  }

  const [header, body, signature] = token.split(".");

  if (!header || !body || !signature) {
    return null;
  }

  const expectedSignature = await signData(`${header}.${body}`);

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = decodeJson<AdminSessionPayload>(body);
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now || payload.role !== "admin") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
