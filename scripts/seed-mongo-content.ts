import "dotenv/config";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import { defaultContentBlocks } from "@/db/content-defaults";
import {
  CONTENT_BLOCK_KEYS,
  ContentBlockModel,
  type ContentBlockKey,
} from "@/db/models/content-block";

const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
const dbName = process.env.MONGODB_DB ?? process.env.MONGO_DB;
const args = new Set(process.argv.slice(2));
const noOverwrite = args.has("--no-overwrite");
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const onlyKey = onlyArg?.slice("--only=".length) as ContentBlockKey | undefined;

function isContentBlockKey(value: string): value is ContentBlockKey {
  return (CONTENT_BLOCK_KEYS as readonly string[]).includes(value);
}

async function main() {
  if (!uri) {
    throw new Error("MONGODB_URI is not set.");
  }

  if (onlyKey && !isContentBlockKey(onlyKey)) {
    throw new Error(`Unknown content key: ${onlyKey}`);
  }

  await mongoose.connect(uri, {
    dbName,
    bufferCommands: false,
  });

  await ContentBlockModel.syncIndexes();

  const blocks = onlyKey
    ? defaultContentBlocks.filter((block) => block.key === onlyKey)
    : defaultContentBlocks;

  for (const block of blocks) {
    const exists = await ContentBlockModel.exists({ key: block.key });

    if (exists && noOverwrite) {
      console.log(`skipped ${block.key}`);
      continue;
    }

    await ContentBlockModel.updateOne(
      { key: block.key },
      {
        $set: block,
        $setOnInsert: {
          schemaVersion: 1,
        },
      },
      { upsert: true, runValidators: true },
    );

    console.log(`${exists ? "updated" : "inserted"} ${block.key}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
