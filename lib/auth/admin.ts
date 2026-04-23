import "server-only";

import { connectMongo, hasMongoConfig } from "@/db/client";
import { AdminUserModel } from "@/db/models/admin-user";
import { hashPassword } from "./password";
import { generateTotpSecret } from "./totp";

export const SEEDED_ADMIN_EMAIL =
  process.env.AUTH_SEED_EMAIL?.toLowerCase() ?? "arnabdzns@gmail.com";
export const SEEDED_ADMIN_PASSWORD = process.env.AUTH_SEED_PASSWORD ?? "Arnab@2026";

function requireMongoAuthStore() {
  if (!hasMongoConfig()) {
    throw new Error(
      "MongoDB is required for admin auth. Set MONGODB_URI and MONGODB_DB.",
    );
  }
}

export async function ensureSeedAdminUser() {
  requireMongoAuthStore();
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
}

export async function findAdminByEmail(email: string) {
  requireMongoAuthStore();
  await connectMongo();
  return AdminUserModel.findOne({ email: email.toLowerCase().trim() }).exec();
}

export async function findAdminById(id: string) {
  requireMongoAuthStore();
  await connectMongo();
  return AdminUserModel.findById(id).exec();
}
