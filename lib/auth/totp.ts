import "server-only";

import { createHmac, randomBytes } from "crypto";
import QRCode from "qrcode";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const DEFAULT_ISSUER = "Arnab Portfolio";
const PERIOD_SECONDS = 30;
const DIGITS = 6;

function base32Encode(bytes: Buffer) {
  let bits = "";
  let output = "";

  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, "0");
  }

  for (let index = 0; index < bits.length; index += 5) {
    const chunk = bits.slice(index, index + 5).padEnd(5, "0");
    output += BASE32_ALPHABET[parseInt(chunk, 2)];
  }

  return output;
}

function base32Decode(secret: string) {
  const cleanSecret = secret.replaceAll("=", "").replace(/\s+/g, "").toUpperCase();
  let bits = "";

  for (const char of cleanSecret) {
    const value = BASE32_ALPHABET.indexOf(char);

    if (value === -1) {
      throw new Error("Invalid authenticator secret.");
    }

    bits += value.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];

  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(parseInt(bits.slice(index, index + 8), 2));
  }

  return Buffer.from(bytes);
}

function generateHotp(secret: string, counter: number) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", base32Decode(secret)).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

export function generateTotpSecret() {
  return base32Encode(randomBytes(20));
}

export function getTotpCode(secret: string, timestamp = Date.now()) {
  return generateHotp(secret, Math.floor(timestamp / 1000 / PERIOD_SECONDS));
}

export function verifyTotpCode(secret: string, code: string, window = 1) {
  const cleanCode = code.replace(/\s+/g, "");

  if (!/^\d{6}$/.test(cleanCode)) {
    return false;
  }

  const currentCounter = Math.floor(Date.now() / 1000 / PERIOD_SECONDS);

  for (let offset = -window; offset <= window; offset += 1) {
    if (generateHotp(secret, currentCounter + offset) === cleanCode) {
      return true;
    }
  }

  return false;
}

export function createOtpAuthUri(email: string, secret: string) {
  const issuer = process.env.AUTH_TOTP_ISSUER ?? DEFAULT_ISSUER;
  const label = `${issuer}:${email}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  });

  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

export async function createOtpQrDataUrl(email: string, secret: string) {
  return QRCode.toDataURL(createOtpAuthUri(email, secret), {
    margin: 2,
    scale: 7,
    color: {
      dark: "#18181b",
      light: "#ffffff",
    },
  });
}
