import { createHash } from "node:crypto";
import https from "node:https";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import sharp from "sharp";

// Materialize CMS images at deploy time, never on a visitor's first request.
// Original URLs stay in MongoDB so content editing and backups remain intact.
const root = fileURLToPath(new URL("../", import.meta.url));
dotenv.config({ path: path.join(root, ".env.local"), quiet: true });
const widths = [64, 128, 256, 384, 640, 960, 1280, 1920];
const sources = new Set();
const manifest = {};
const stats = [];
const failures = [];
const previousManifest = JSON.parse(await readFile(path.join(root, "lib/image-assets.json"), "utf8"));
const output = path.join(root, "public/media");
const sourceCache = path.join(root, ".cache/image-sources");
await mkdir(output, { recursive: true });
await mkdir(sourceCache, { recursive: true });

function collect(value) {
  if (typeof value === "string" && /^https:\/\/i\.ibb\.co\/[^\s]+$/i.test(value)) {
    sources.add(value);
  } else if (value && typeof value === "object") {
    Object.values(value).forEach(collect);
  }
}

async function collectLocal(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, item.name);
    if (filename === output) continue;
    if (item.isDirectory()) await collectLocal(filename);
    else if (/\.(png|jpe?g|webp|avif)$/i.test(item.name)) {
      sources.add("/" + path.relative(path.join(root, "public"), filename).split(path.sep).join("/"));
    }
  }
}

function downloadImage(src) {
  return new Promise((resolve, reject) => {
    // Some ImgBB IPv6 routes stall; use its working IPv4 endpoint during sync.
    const request = https.get(src, { family: 4 }, (response) => {
      if (response.statusCode !== 200 || !response.headers["content-type"]?.startsWith("image/")) {
        response.resume();
        reject(new Error(`Image response: ${response.statusCode}`));
        return;
      }
      const chunks = [];
      let size = 0;
      response.on("data", (chunk) => {
        size += chunk.length;
        if (size > 32 * 1024 * 1024) request.destroy(new Error("Image exceeds 32 MB"));
        else chunks.push(chunk);
      });
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    });
    const timeout = setTimeout(() => request.destroy(new Error("Image download timed out")), 20000);
    request.on("close", () => clearTimeout(timeout));
    request.on("error", reject);
  });
}

const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
const dbName = process.env.MONGODB_DB ?? process.env.MONGO_DB;
if (!uri || uri === "[SENSITIVE]" || !dbName || dbName === "[SENSITIVE]") {
  throw new Error("Set MONGODB_URI and MONGODB_DB before syncing CMS images.");
}
const connection = await mongoose.createConnection(uri, {
  dbName, serverSelectionTimeoutMS: 10000, maxPoolSize: 1,
}).asPromise();
try {
  const blocks = await connection.db.collection("content_blocks").find({}).toArray();
  collect(blocks);
} finally {
  await connection.close();
}
await collectLocal(path.join(root, "public"));

async function optimize(src) {
  let original;
  if (src.startsWith("https://")) {
    const cachedPath = path.join(sourceCache, createHash("sha256").update(src).digest("hex"));
    original = await readFile(cachedPath).catch(() => null);
    // Reuse the existing largest CDN copy when the upstream original is unavailable.
    // This keeps thumbnail optimization independent of ImgBB availability.
    const existing = previousManifest[src];
    if (!original && existing) {
      const largest = existing.full ?? existing;
      original = await readFile(path.join(root, "public", `${largest.base}-${largest.widths.at(-1)}.webp`)).catch(() => null);
    }
    for (let attempt = 0; !original && attempt < 3; attempt++) {
      try {
        original = await downloadImage(src);
        await writeFile(cachedPath, original);
      } catch {
        console.warn(`Download attempt ${attempt + 1} failed: ${src}`);
      }
    }
    if (!original) throw new Error(`Image could not be downloaded: ${src}`);
  } else {
    original = await readFile(path.join(root, "public", src));
  }
  const metadata = await sharp(original).metadata();
  if ((metadata.pages ?? 1) > 1) throw new Error(`Animated image needs a separate asset: ${src}`);
  const maxWidth = Math.min(metadata.autoOrient.width, 960);
  const sizes = [...new Set([...widths.filter(width => width < maxWidth), maxWidth])];
  const hash = createHash("sha256").update(original).update("responsive-v2-webp66-82-avif45-60").digest("hex").slice(0, 20);
  const base = `/media/${hash}`;
  let largestBytes = 0;
  let tileBytes = 0;
  let webpTotal = 0;
  let avifTotal = 0;
  const encodedSizes = [];
  for (const width of sizes) {
    const pipeline = sharp(original).rotate().resize({ width, withoutEnlargement: true });
    const webpPath = path.join(root, "public", `${base}-${width}.webp`);
    const avifPath = path.join(root, "public", `${base}-${width}.avif`);
    const optimized = await readFile(webpPath).catch(() => pipeline.clone()
      .webp({ quality: width <= 960 ? 66 : 82, effort: 6 }).toBuffer());
    const avif = await readFile(avifPath).catch(() => pipeline.clone()
      .avif({ quality: width <= 960 ? 45 : 60, effort: 1 }).toBuffer());
    await writeFile(webpPath, optimized);
    await writeFile(avifPath, avif);
    webpTotal += optimized.length;
    avifTotal += avif.length;
    encodedSizes.push({ width, webp: optimized.length, avif: avif.length });
    largestBytes = optimized.length;
    if (width <= 960) tileBytes = optimized.length;
  }
  const preferAvif = avifTotal < webpTotal * 0.95;
  const previous = previousManifest[src];
  const full = previous?.full ?? (previous ? { base: previous.base, widths: previous.widths } : undefined);
  manifest[src] = { base, widths: sizes, avif: preferAvif, ...(full ? { full } : {}) };
  const selectedSizes = encodedSizes.map(item => ({ width: item.width, bytes: preferAvif ? item.avif : item.webp }));
  largestBytes = selectedSizes.at(-1).bytes;
  tileBytes = selectedSizes.filter(item => item.width <= 960).at(-1)?.bytes ?? largestBytes;
  const previousTileWidth = previous?.widths.find(width => width >= 960) ?? previous?.widths.at(-1);
  const previousTileBytes = previous
    ? (await readFile(path.join(root, "public", `${previous.base}-${previousTileWidth}.webp`))).length
    : null;
  stats.push({ src, originalBytes: original.length, largestBytes, tileBytes, previousTileBytes, preferAvif });
  console.log(`Optimized ${stats.length}/${sources.size}: ${src.split("/").at(-1)} (${Math.round(original.length / 1024)} → ${Math.round(largestBytes / 1024)} KB)`);
}

const queue = [...sources];
// Bound downloads and encoding so a large gallery doesn't exhaust memory.
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) {
    const src = queue.shift();
    if (src) {
      try { await optimize(src); }
      catch (error) { console.warn(`${src}: ${error.message}`); failures.push(src); }
    }
  }
}));
if (failures.length) {
  console.error(JSON.stringify({ failures }));
  process.exit(1);
}
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(path.join(root, "lib/image-assets.json"), JSON.stringify(sorted, null, 2) + "\n");
await writeFile(path.join(root, ".next/image-sync-report.json"), JSON.stringify(stats, null, 2)).catch(() => {});
console.log(JSON.stringify({ images: stats.length,
  originalBytes: stats.reduce((sum, item) => sum + item.originalBytes, 0),
  largestBytes: stats.reduce((sum, item) => sum + item.largestBytes, 0),
  tileBytes: stats.reduce((sum, item) => sum + item.tileBytes, 0),
  previousTileBytes: stats.reduce((sum, item) => sum + (item.previousTileBytes ?? 0), 0),
  avifImages: stats.filter(item => item.preferAvif).length,
  failures,
}));
if (failures.length) process.exitCode = 1;
