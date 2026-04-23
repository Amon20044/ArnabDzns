import "server-only";

import dns from "node:dns";
dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";

const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
const dbName = process.env.MONGODB_DB ?? process.env.MONGO_DB;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  __arnab_mongoose__?: MongooseCache;
};

const cache = globalForMongoose.__arnab_mongoose__ ?? {
  conn: null,
  promise: null,
};

if (!globalForMongoose.__arnab_mongoose__) {
  globalForMongoose.__arnab_mongoose__ = cache;
}

export function hasMongoConfig() {
  return Boolean(uri);
}

export async function connectMongo() {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local or your Vercel environment.",
    );
  }

  if (cache.conn) {
    return cache.conn;
  }

  cache.promise ??= mongoose.connect(uri, {
    dbName,
    bufferCommands: false,
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE ?? 10),
    serverSelectionTimeoutMS: Number(
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS ?? 8000,
    ),
  });

  cache.conn = await cache.promise;
  return cache.conn;
}

export async function disconnectMongo() {
  if (!cache.conn) {
    return;
  }

  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
}
