/// <reference lib="webworker" />

// Module worker. Reads an image File, decodes its dimensions off the main
// thread, and re-encodes via OffscreenCanvas before handing the
// resulting blob back. Posts step events at each stage so the UI can show
// per-file progress.

export type ImageWorkerInput = {
  kind: "process";
  id: string;
  file: File;
  convert: boolean;
};

export type ImageWorkerStep = "reading" | "decoding" | "converting";

export type ImageWorkerOutput =
  | { kind: "step"; id: string; step: ImageWorkerStep }
  | {
      kind: "ready";
      id: string;
      blob: Blob;
      width?: number;
      height?: number;
      byteLength: number;
      mimeType: string;
      converted: boolean;
    }
  | { kind: "failed"; id: string; error: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener("message", async (event: MessageEvent<ImageWorkerInput>) => {
  const data = event.data;
  if (!data || data.kind !== "process") return;
  const { id, file, convert } = data;

  const post = (message: ImageWorkerOutput) => ctx.postMessage(message);

  try {
    post({ kind: "step", id, step: "reading" });
    // Force the file to be readable into memory (also surfaces I/O errors here).
    await file.arrayBuffer();

    post({ kind: "step", id, step: "decoding" });

    let width: number | undefined;
    let height: number | undefined;
    let outBlob: Blob = file;
    let mimeType = file.type || "application/octet-stream";
    let convertedFlag = false;

    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      width = bitmap.width;
      height = bitmap.height;

      if (convert) {
        post({ kind: "step", id, step: "converting" });
        if (typeof OffscreenCanvas === "undefined") {
          throw new Error("OffscreenCanvas not supported in this browser.");
        }
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const c2d = canvas.getContext("2d");
        if (!c2d) throw new Error("Unable to get OffscreenCanvas 2D context.");
        c2d.drawImage(bitmap, 0, 0);
        // quality=1 is the closest browsers get to lossless webp via canvas.
        outBlob = await canvas.convertToBlob({ type: "image/webp", quality: 1 });
        mimeType = "image/webp";
        convertedFlag = true;
      }
    } catch (decodeError) {
      // createImageBitmap may fail on SVG/HEIC/AVIF in older browsers.
      // For a no-conversion upload we still ship the original bytes -
      // dimensions just stay undefined.
      if (convert) throw decodeError;
    } finally {
      bitmap?.close();
    }

    post({
      kind: "ready",
      id,
      blob: outBlob,
      width,
      height,
      byteLength: outBlob.size,
      mimeType,
      converted: convertedFlag,
    });
  } catch (error) {
    post({
      kind: "failed",
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
