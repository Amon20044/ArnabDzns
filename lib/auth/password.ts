import "server-only";

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return {
    passwordHash: hash.toString("base64url"),
    passwordSalt: salt,
  };
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
  passwordSalt: string,
) {
  const hash = (await scrypt(password, passwordSalt, KEY_LENGTH)) as Buffer;
  const stored = Buffer.from(passwordHash, "base64url");

  if (hash.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(hash, stored);
}

export function isStrongEnoughPassword(password: string) {
  return password.length >= 8;
}
