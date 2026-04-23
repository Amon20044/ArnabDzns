import "dotenv/config";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import { randomBytes, scrypt as scryptCallback } from "crypto";
import { promisify } from "util";
import mongoose from "mongoose";
import { AdminUserModel } from "@/db/models/admin-user";

const scrypt = promisify(scryptCallback);
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const KEY_LENGTH = 64;
const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
const dbName = process.env.MONGODB_DB ?? process.env.MONGO_DB;
const email = process.env.AUTH_SEED_EMAIL?.toLowerCase() ?? "arnabdzns@gmail.com";
const password = process.env.AUTH_SEED_PASSWORD ?? "Arnab@2026";

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

async function hashPassword(value: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = (await scrypt(value, salt, KEY_LENGTH)) as Buffer;

  return {
    passwordHash: hash.toString("base64url"),
    passwordSalt: salt,
  };
}

async function main() {
  if (!uri) {
    throw new Error("MONGODB_URI or MONGO_URI is not set.");
  }

  await mongoose.connect(uri, {
    dbName,
    bufferCommands: false,
  });
  await AdminUserModel.syncIndexes();

  const existing = await AdminUserModel.findOne({ email }).exec();

  if (existing) {
    if (!existing.totpSecret) {
      existing.totpSecret = base32Encode(randomBytes(20));
      await existing.save();
    }

    console.log(`admin exists: ${email}`);
    console.log(`default password remains: ${password}`);
    return;
  }

  await AdminUserModel.create({
    email,
    ...(await hashPassword(password)),
    role: "admin",
    totpSecret: base32Encode(randomBytes(20)),
    schemaVersion: 1,
  });

  console.log(`seeded admin: ${email}`);
  console.log(`default password: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
