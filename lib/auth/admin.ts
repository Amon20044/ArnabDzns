import "server-only";

import { connectMongo, hasMongoConfig } from "@/db/client";
import { AdminUserModel } from "@/db/models/admin-user";
import { hashPassword } from "./password";
import { generateTotpSecret } from "./totp";

export const SEEDED_ADMIN_EMAIL =
  process.env.AUTH_SEED_EMAIL?.toLowerCase() ?? "arnabdzns@gmail.com";
export const SEEDED_ADMIN_PASSWORD = process.env.AUTH_SEED_PASSWORD ?? "Arnab@2026";
const FALLBACK_ADMIN_ID = "seed-admin";

type FallbackAdminUser = {
  _id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: "admin";
  totpSecret: string;
  passwordChangeVerifiedAt?: Date;
  passwordChangedAt?: Date;
  lastLoginAt?: Date;
  save: () => Promise<void>;
};

const globalForAuth = globalThis as typeof globalThis & {
  __arnab_fallback_admin__?: FallbackAdminUser;
};

function logAuthFallback(error: unknown) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.warn("[auth] Falling back to seeded admin:", error);
}

async function getFallbackAdminUser() {
  if (globalForAuth.__arnab_fallback_admin__) {
    return globalForAuth.__arnab_fallback_admin__;
  }

  const password = await hashPassword(SEEDED_ADMIN_PASSWORD);
  const fallbackUser: FallbackAdminUser = {
    _id: FALLBACK_ADMIN_ID,
    email: SEEDED_ADMIN_EMAIL,
    ...password,
    role: "admin",
    totpSecret: generateTotpSecret(),
    async save() {},
  };

  globalForAuth.__arnab_fallback_admin__ = fallbackUser;
  return fallbackUser;
}

export async function ensureSeedAdminUser() {
  if (!hasMongoConfig()) {
    return getFallbackAdminUser();
  }

  try {
    await connectMongo();
    await AdminUserModel.syncIndexes();

    const existing = await AdminUserModel.findOne({ email: SEEDED_ADMIN_EMAIL }).exec();

    if (existing) {
      if (!existing.totpSecret) {
        existing.totpSecret = generateTotpSecret();
        await existing.save();
      }

      return existing;
    }

    const password = await hashPassword(SEEDED_ADMIN_PASSWORD);

    return AdminUserModel.create({
      email: SEEDED_ADMIN_EMAIL,
      ...password,
      role: "admin",
      totpSecret: generateTotpSecret(),
      schemaVersion: 1,
    });
  } catch (error) {
    logAuthFallback(error);
    return getFallbackAdminUser();
  }
}

export async function findAdminByEmail(email: string) {
  if (!hasMongoConfig()) {
    const fallbackUser = await getFallbackAdminUser();
    return email.toLowerCase().trim() === fallbackUser.email ? fallbackUser : null;
  }

  try {
    await connectMongo();
    return AdminUserModel.findOne({ email: email.toLowerCase().trim() }).exec();
  } catch (error) {
    logAuthFallback(error);
    const fallbackUser = await getFallbackAdminUser();
    return email.toLowerCase().trim() === fallbackUser.email ? fallbackUser : null;
  }
}

export async function findAdminById(id: string) {
  if (id === FALLBACK_ADMIN_ID) {
    return getFallbackAdminUser();
  }

  if (!hasMongoConfig()) {
    return null;
  }

  try {
    await connectMongo();
    return AdminUserModel.findById(id).exec();
  } catch (error) {
    logAuthFallback(error);
    return null;
  }
}
