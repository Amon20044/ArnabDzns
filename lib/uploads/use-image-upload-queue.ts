"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { WorkerPool } from "./worker-pool";
import type {
  ImageWorkerInput,
  ImageWorkerOutput,
} from "./image-upload-worker";

export type UploadedAsset = {
  id: string;
  src: string;
  displaySrc?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  alt?: string;
  title?: string;
  desc?: string;
  mimeType?: string;
  byteLength?: number;
  converted?: boolean;
};

export type UploadResponse = {
  assets?: UploadedAsset[];
  error?: string;
};

export type UploadStep =
  | "queued"
  | "reading"
  | "decoding"
  | "converting"
  | "uploading"
  | "done"
  | "failed";

export type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: UploadStep;
  progress: number;
  width?: number;
  height?: number;
  byteLength?: number;
  asset?: UploadedAsset;
  error?: string;
  /** Append-only log of every step transition with timestamps. */
  steps: Array<{ step: UploadStep; at: number }>;
  startedAt: number;
  finishedAt?: number;
};

export type UseImageUploadQueueOptions = {
  endpoint?: string;
  /** When true, the worker re-encodes to webp via OffscreenCanvas before
   *  upload. Default false — original bytes/mime ship as-is. */
  convert?: boolean;
  /** Max concurrent network uploads. Defaults to 3. */
  maxConcurrentUploads?: number;
  /** Files larger than this are uploaded one at a time to avoid memory spikes. */
  serialUploadByteThreshold?: number;
  onAssetUploaded?: (asset: UploadedAsset, item: UploadItem) => void;
  onError?: (item: UploadItem) => void;
  onUnauthorized?: () => void;
};

export type UseImageUploadQueueReturn = {
  items: UploadItem[];
  /** Returns the ids assigned to the newly-queued files. */
  addFiles: (files: FileList | File[] | null) => string[];
  retry: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  clearCompleted: () => void;
  summary: {
    total: number;
    completed: number;
    failed: number;
    inFlight: number;
    overallProgress: number;
  };
};

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `upl-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function isTerminalStep(step: UploadStep) {
  return step === "done" || step === "failed";
}

export function useImageUploadQueue(
  options: UseImageUploadQueueOptions = {},
): UseImageUploadQueueReturn {
  const {
    endpoint = "/api/uploads/imgbb",
    convert = false,
    maxConcurrentUploads = 3,
    onAssetUploaded,
    onError,
    onUnauthorized,
  } = options;

  const [items, setItems] = useState<UploadItem[]>([]);
  const itemsRef = useRef<UploadItem[]>([]);
  const poolRef = useRef<WorkerPool | null>(null);
  const preparedQueueRef = useRef<{ id: string; blob: Blob; filename: string; mimeType: string }[]>([]);
  const uploadInFlightRef = useRef(0);
  const xhrByIdRef = useRef<Map<string, XMLHttpRequest>>(new Map());
  const objectUrlsRef = useRef<Set<string>>(new Set());

  itemsRef.current = items;

  const ensurePool = useCallback(() => {
    if (poolRef.current) return poolRef.current;
    if (typeof window === "undefined") {
      throw new Error("Worker pool is only available in the browser.");
    }
    poolRef.current = new WorkerPool({
      factory: () =>
        new Worker(new URL("./image-upload-worker.ts", import.meta.url), {
          type: "module",
          name: "image-upload-worker",
        }),
      isTerminal: (message) => {
        const kind = message.kind as string | undefined;
        return kind === "ready" || kind === "failed";
      },
    });
    return poolRef.current;
  }, []);

  const patchItem = useCallback(
    (id: string, patch: Partial<UploadItem> | ((prev: UploadItem) => Partial<UploadItem>)) => {
      setItems((current) => {
        const next: UploadItem[] = current.slice();
        const index = next.findIndex((item) => item.id === id);
        if (index < 0) return current;
        const partial = typeof patch === "function" ? patch(next[index]) : patch;
        next[index] = { ...next[index], ...partial };
        return next;
      });
    },
    [],
  );

  const transitionStatus = useCallback(
    (id: string, status: UploadStep, extra?: Partial<UploadItem>) => {
      const at = Date.now();
      patchItem(id, (prev) => ({
        status,
        steps: prev.status === status ? prev.steps : [...prev.steps, { step: status, at }],
        finishedAt: isTerminalStep(status) ? at : prev.finishedAt,
        ...(extra ?? {}),
      }));
    },
    [patchItem],
  );

  const pumpUploads = useCallback(() => {
    while (uploadInFlightRef.current < maxConcurrentUploads) {
      const next = preparedQueueRef.current.shift();
      if (!next) break;
      uploadInFlightRef.current += 1;
      startNetworkUpload(next.id, next.blob, next.filename, next.mimeType);
    }
  }, [maxConcurrentUploads]);

  const startNetworkUpload = useCallback(
    (id: string, blob: Blob, filename: string, mimeType: string) => {
      const item = itemsRef.current.find((entry) => entry.id === id);
      if (!item) {
        uploadInFlightRef.current = Math.max(0, uploadInFlightRef.current - 1);
        pumpUploads();
        return;
      }

      transitionStatus(id, "uploading", { progress: 0 });

      const formData = new FormData();
      formData.set(
        "file",
        new File([blob], filename, { type: mimeType }),
        filename,
      );
      if (convert) formData.set("convert", "1");

      const xhr = new XMLHttpRequest();
      xhrByIdRef.current.set(id, xhr);
      xhr.responseType = "json";
      xhr.withCredentials = true;

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          patchItem(id, { progress: event.loaded / event.total });
        }
      });

      xhr.addEventListener("load", () => {
        xhrByIdRef.current.delete(id);
        uploadInFlightRef.current = Math.max(0, uploadInFlightRef.current - 1);

        if (xhr.status === 401) {
          transitionStatus(id, "failed", {
            error: "Unauthorized. Please sign in again.",
            progress: 0,
          });
          const failed = itemsRef.current.find((entry) => entry.id === id);
          if (failed && onError) onError(failed);
          onUnauthorized?.();
          pumpUploads();
          return;
        }

        const result = (xhr.response ?? {}) as UploadResponse;
        if (xhr.status < 200 || xhr.status >= 300 || !result.assets?.length) {
          transitionStatus(id, "failed", {
            error: result.error ?? `Upload failed (${xhr.status}).`,
            progress: 0,
          });
          const failed = itemsRef.current.find((entry) => entry.id === id);
          if (failed && onError) onError(failed);
          pumpUploads();
          return;
        }

        const asset = result.assets[0];
        transitionStatus(id, "done", { progress: 1, asset });
        const done = itemsRef.current.find((entry) => entry.id === id);
        if (done && onAssetUploaded) onAssetUploaded(asset, done);
        pumpUploads();
      });

      xhr.addEventListener("error", () => {
        xhrByIdRef.current.delete(id);
        uploadInFlightRef.current = Math.max(0, uploadInFlightRef.current - 1);
        transitionStatus(id, "failed", {
          error: "Network error while uploading.",
          progress: 0,
        });
        const failed = itemsRef.current.find((entry) => entry.id === id);
        if (failed && onError) onError(failed);
        pumpUploads();
      });

      xhr.addEventListener("abort", () => {
        xhrByIdRef.current.delete(id);
        uploadInFlightRef.current = Math.max(0, uploadInFlightRef.current - 1);
        pumpUploads();
      });

      xhr.open("POST", endpoint, true);
      xhr.send(formData);
    },
    [convert, endpoint, onAssetUploaded, onError, onUnauthorized, patchItem, pumpUploads, transitionStatus],
  );

  const handleWorkerMessage = useCallback(
    (id: string, file: File, message: ImageWorkerOutput) => {
      if (message.kind === "step") {
        const step = message.step;
        if (step === "reading") transitionStatus(id, "reading");
        else if (step === "decoding") transitionStatus(id, "decoding");
        else if (step === "converting") transitionStatus(id, "converting");
        return;
      }

      if (message.kind === "failed") {
        transitionStatus(id, "failed", { error: message.error, progress: 0 });
        const failed = itemsRef.current.find((entry) => entry.id === id);
        if (failed && onError) onError(failed);
        return;
      }

      if (message.kind === "ready") {
        patchItem(id, {
          width: message.width,
          height: message.height,
          byteLength: message.byteLength,
        });
        const filename = message.converted
          ? renameExtension(file.name, "webp")
          : file.name;
        preparedQueueRef.current.push({
          id,
          blob: message.blob,
          filename,
          mimeType: message.mimeType,
        });
        pumpUploads();
      }
    },
    [onError, patchItem, pumpUploads, transitionStatus],
  );

  const enqueueWorker = useCallback(
    (item: UploadItem) => {
      const pool = ensurePool();
      const payload: ImageWorkerInput = {
        kind: "process",
        id: item.id,
        file: item.file,
        convert,
      };
      pool.send({
        id: item.id,
        payload,
        onMessage: (message) => handleWorkerMessage(item.id, item.file, message as ImageWorkerOutput),
      });
    },
    [convert, ensurePool, handleWorkerMessage],
  );

  const addFiles = useCallback(
    (incoming: FileList | File[] | null): string[] => {
      if (!incoming) return [];
      const list = Array.from(incoming).filter((file) =>
        file.type.startsWith("image/") ||
        /\.(svg|heic|heif|avif)$/i.test(file.name),
      );
      if (!list.length) return [];
      const now = Date.now();
      const newItems: UploadItem[] = list.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        objectUrlsRef.current.add(previewUrl);
        return {
          id: randomId(),
          file,
          previewUrl,
          status: "queued",
          progress: 0,
          steps: [{ step: "queued", at: now }],
          startedAt: now,
        };
      });
      setItems((current) => [...current, ...newItems]);
      newItems.forEach((item) => enqueueWorker(item));
      return newItems.map((item) => item.id);
    },
    [enqueueWorker],
  );

  const retry = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((entry) => entry.id === id);
      if (!item || item.status !== "failed") return;
      transitionStatus(id, "queued", { error: undefined, progress: 0 });
      enqueueWorker(item);
    },
    [enqueueWorker, transitionStatus],
  );

  const remove = useCallback((id: string) => {
    const xhr = xhrByIdRef.current.get(id);
    if (xhr) {
      try {
        xhr.abort();
      } catch {
        /* noop */
      }
      xhrByIdRef.current.delete(id);
    }
    preparedQueueRef.current = preparedQueueRef.current.filter((entry) => entry.id !== id);
    setItems((current) => {
      const target = current.find((entry) => entry.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
        objectUrlsRef.current.delete(target.previewUrl);
      }
      return current.filter((entry) => entry.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    xhrByIdRef.current.forEach((xhr) => {
      try {
        xhr.abort();
      } catch {
        /* noop */
      }
    });
    xhrByIdRef.current.clear();
    preparedQueueRef.current = [];
    setItems((current) => {
      current.forEach((entry) => {
        if (entry.previewUrl) {
          URL.revokeObjectURL(entry.previewUrl);
          objectUrlsRef.current.delete(entry.previewUrl);
        }
      });
      return [];
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setItems((current) => {
      const keep: UploadItem[] = [];
      current.forEach((entry) => {
        if (entry.status === "done") {
          if (entry.previewUrl) {
            URL.revokeObjectURL(entry.previewUrl);
            objectUrlsRef.current.delete(entry.previewUrl);
          }
          return;
        }
        keep.push(entry);
      });
      return keep;
    });
  }, []);

  useEffect(() => {
    return () => {
      poolRef.current?.dispose();
      poolRef.current = null;
      xhrByIdRef.current.forEach((xhr) => {
        try {
          xhr.abort();
        } catch {
          /* noop */
        }
      });
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      objectUrlsRef.current.clear();
    };
  }, []);

  const summary = useMemo(() => {
    const total = items.length;
    const completed = items.filter((item) => item.status === "done").length;
    const failed = items.filter((item) => item.status === "failed").length;
    const inFlight = items.filter(
      (item) => !isTerminalStep(item.status) && item.status !== "queued",
    ).length;
    const overall =
      total === 0
        ? 0
        : items.reduce((acc, item) => {
            if (item.status === "done") return acc + 1;
            if (item.status === "uploading") return acc + 0.5 + item.progress * 0.5;
            if (item.status === "converting") return acc + 0.45;
            if (item.status === "decoding") return acc + 0.3;
            if (item.status === "reading") return acc + 0.15;
            if (item.status === "failed") return acc + 0;
            return acc;
          }, 0) / total;
    return {
      total,
      completed,
      failed,
      inFlight,
      overallProgress: Math.max(0, Math.min(1, overall)),
    };
  }, [items]);

  return { items, addFiles, retry, remove, clear, clearCompleted, summary };
}

function renameExtension(filename: string, newExt: string) {
  const lastDot = filename.lastIndexOf(".");
  const stem =
    lastDot > 0 ? filename.slice(0, lastDot) : filename || "image";
  return `${stem}.${newExt}`;
}
