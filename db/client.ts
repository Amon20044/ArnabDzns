import "server-only";

import dns from "node:dns";
dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";

const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
const dbName = process.env.MONGODB_DB ?? process.env.MONGO_DB;
const dnsServers = process.env.MONGODB_DNS_SERVERS;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  configured: boolean;
};

const globalForMongoose = globalThis as typeof globalThis & {
  __arnab_mongoose__?: MongooseCache;
};

const cache = globalForMongoose.__arnab_mongoose__ ?? {
  conn: null,
  promise: null,
  configured: false,
};

if (!globalForMongoose.__arnab_mongoose__) {
  globalForMongoose.__arnab_mongoose__ = cache;
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function configureMongoRuntime() {
  if (cache.configured) {
    return;
  }

  cache.configured = true;
  mongoose.set("bufferCommands", false);
  mongoose.set("sanitizeFilter", true);
  mongoose.set("strictQuery", true);

  if (!dnsServers) {
    return;
  }

  const servers = dnsServers
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (!servers.length) {
    return;
  }

  const dns = await import("node:dns");
  dns.setServers(servers);
  console.log("[mongo] dns servers set to", dns.getServers());
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

  await configureMongoRuntime();

  cache.promise ??= mongoose.connect(uri, {
    dbName,
    family: 4,
    maxPoolSize: parsePositiveInt(process.env.MONGODB_MAX_POOL_SIZE, 10),
    minPoolSize: parsePositiveInt(process.env.MONGODB_MIN_POOL_SIZE, 0),
    serverSelectionTimeoutMS: parsePositiveInt(
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
      5000,
    ),
    socketTimeoutMS: parsePositiveInt(process.env.MONGODB_SOCKET_TIMEOUT_MS, 45000),
  });

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    cache.conn = null;
    throw error;
  }

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
