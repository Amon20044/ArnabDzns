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
  /** When true, the worker re-encodes to webp before upload. */
  convert?: boolean;
  /** Max concurrent network uploads. Defaults to 3. */
  maxConcurrentUploads?: number;
  /** Files larger than this upload one at a time. Defaults to 16 MiB; set 0 to disable. */
  serialUploadByteThreshold?: number;
  onAssetUploaded?: (asset: UploadedAsset, item: UploadItem) => void;
  onError?: (item: UploadItem) => void;
  onUnauthorized?: () => void;
};

export type UseImageUploadQueueReturn = {
  items: UploadItem[];
  /** Returns the ids assigned to the newly queued files. */
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

type PreparedUpload = {
  id: string;
  blob: Blob;
  filename: string;
  mimeType: string;
  byteLength: number;
};

const DEFAULT_SERIAL_UPLOAD_BYTE_THRESHOLD = 16 * 1024 * 1024;
const SUPPORTED_IMAGE_NAME_RE = /\.(svg|heic|heif|avif)$/i;

export function isSupportedImageUploadFile(file: File) {
  return (
    file.type.startsWith("image/") || SUPPORTED_IMAGE_NAME_RE.test(file.name)
  );
}

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `upl-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function isTerminalStep(step: UploadStep) {
  return step === "done" || step === "failed";
}

function readStepProgress(item: UploadItem) {
  if (item.status === "done") return 1;
  if (item.status === "uploading") {
    return 0.6 + Math.max(0, Math.min(1, item.progress)) * 0.4;
  }
  if (item.status === "converting") return 0.5;
  if (item.status === "decoding") return 0.35;
  if (item.status === "reading") return 0.2;
  return 0;
}

function readErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useImageUploadQueue(
  options: UseImageUploadQueueOptions = {},
): UseImageUploadQueueReturn {
  const {
    endpoint = "/api/uploads/imgbb",
    convert = false,
    maxConcurrentUploads = 3,
    serialUploadByteThreshold = DEFAULT_SERIAL_UPLOAD_BYTE_THRESHOLD,
    onAssetUploaded,
    onError,
    onUnauthorized,
  } = options;

  const [items, setItems] = useState<UploadItem[]>([]);
  const itemsRef = useRef<UploadItem[]>([]);
  const poolRef = useRef<WorkerPool | null>(null);
  const preparedQueueRef = useRef<PreparedUpload[]>([]);
  const uploadInFlightRef = useRef(0);
  const serialUploadInFlightRef = useRef(false);
  const pumpUploadsRef = useRef<() => void>(() => {});
  const xhrByIdRef = useRef<Map<string, XMLHttpRequest>>(new Map());
  const objectUrlsRef = useRef<Set<string>>(new Set());

  itemsRef.current = items;

  const replaceItems = useCallback((nextItems: UploadItem[]) => {
    itemsRef.current = nextItems;
    setItems(nextItems);
  }, []);

  const patchItem = useCallback(
    (
      id: string,
      patch: Partial<UploadItem> | ((prev: UploadItem) => Partial<UploadItem>),
    ) => {
      const current = itemsRef.current;
      const index = current.findIndex((item) => item.id === id);

      if (index < 0) {
        return null;
      }

      const partial =
        typeof patch === "function" ? patch(current[index]) : patch;
      const nextItem = { ...current[index], ...partial };
      const nextItems = current.slice();
      nextItems[index] = nextItem;
      replaceItems(nextItems);

      return nextItem;
    },
    [replaceItems],
  );

  const transitionStatus = useCallback(
    (id: string, status: UploadStep, extra?: Partial<UploadItem>) => {
      const at = Date.now();
      return patchItem(id, (prev) => ({
        status,
        steps:
          prev.status === status
            ? prev.steps
            : [...prev.steps, { step: status, at }],
        finishedAt: isTerminalStep(status) ? at : prev.finishedAt,
        ...(extra ?? {}),
      }));
    },
    [patchItem],
  );

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

  const completeNetworkUpload = useCallback((wasSerial: boolean) => {
    uploadInFlightRef.current = Math.max(0, uploadInFlightRef.current - 1);

    if (wasSerial) {
      serialUploadInFlightRef.current = false;
    }

    pumpUploadsRef.current();
  }, []);

  const startNetworkUpload = useCallback(
    (entry: PreparedUpload, isSerial: boolean) => {
      const { id, blob, filename, mimeType } = entry;
      const item = itemsRef.current.find((candidate) => candidate.id === id);

      if (!item) {
        completeNetworkUpload(isSerial);
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

        if (xhr.status === 401) {
          const failed = transitionStatus(id, "failed", {
            error: "Unauthorized. Please sign in again.",
            progress: 0,
          });
          if (failed) onError?.(failed);
          onUnauthorized?.();
          completeNetworkUpload(isSerial);
          return;
        }

        const result = (xhr.response ?? {}) as UploadResponse;
        if (xhr.status < 200 || xhr.status >= 300 || !result.assets?.length) {
          const failed = transitionStatus(id, "failed", {
            error: result.error ?? `Upload failed (${xhr.status}).`,
            progress: 0,
          });
          if (failed) onError?.(failed);
          completeNetworkUpload(isSerial);
          return;
        }

        const asset = result.assets[0];
        const done = transitionStatus(id, "done", {
          asset,
          progress: 1,
        });
        if (done) onAssetUploaded?.(asset, done);
        completeNetworkUpload(isSerial);
      });

      xhr.addEventListener("error", () => {
        xhrByIdRef.current.delete(id);
        const failed = transitionStatus(id, "failed", {
          error: "Network error while uploading.",
          progress: 0,
        });
        if (failed) onError?.(failed);
        completeNetworkUpload(isSerial);
      });

      xhr.addEventListener("abort", () => {
        xhrByIdRef.current.delete(id);
        completeNetworkUpload(isSerial);
      });

      xhr.open("POST", endpoint, true);
      xhr.send(formData);
    },
    [
      completeNetworkUpload,
      convert,
      endpoint,
      onAssetUploaded,
      onError,
      onUnauthorized,
      patchItem,
      transitionStatus,
    ],
  );

  const pumpUploads = useCallback(() => {
    if (serialUploadInFlightRef.current) {
      return;
    }

    const uploadLimit = Math.max(1, Math.floor(maxConcurrentUploads));

    while (uploadInFlightRef.current < uploadLimit) {
      const next = preparedQueueRef.current[0];
      if (!next) break;

      const shouldUploadSerially =
        serialUploadByteThreshold > 0 &&
        next.byteLength >= serialUploadByteThreshold;

      if (shouldUploadSerially && uploadInFlightRef.current > 0) {
        break;
      }

      preparedQueueRef.current.shift();
      uploadInFlightRef.current += 1;

      if (shouldUploadSerially) {
        serialUploadInFlightRef.current = true;
      }

      startNetworkUpload(next, shouldUploadSerially);

      if (shouldUploadSerially) {
        break;
      }
    }
  }, [maxConcurrentUploads, serialUploadByteThreshold, startNetworkUpload]);

  pumpUploadsRef.current = pumpUploads;

  const handleWorkerMessage = useCallback(
    (id: string, file: File, message: ImageWorkerOutput) => {
      if (message.kind === "step") {
        if (message.step === "reading") transitionStatus(id, "reading");
        else if (message.step === "decoding") transitionStatus(id, "decoding");
        else if (message.step === "converting") {
          transitionStatus(id, "converting");
        }
        return;
      }

      if (message.kind === "failed") {
        const failed = transitionStatus(id, "failed", {
          error: message.error,
          progress: 0,
        });
        if (failed) onError?.(failed);
        return;
      }

      if (message.kind === "ready") {
        if (!itemsRef.current.some((entry) => entry.id === id)) {
          return;
        }

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
          byteLength: message.byteLength,
        });
        pumpUploads();
      }
    },
    [onError, patchItem, pumpUploads, transitionStatus],
  );

  const enqueueWorker = useCallback(
    (item: UploadItem) => {
      try {
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
          onMessage: (message) =>
            handleWorkerMessage(
              item.id,
              item.file,
              message as ImageWorkerOutput,
            ),
        });
      } catch (error) {
        const failed = transitionStatus(item.id, "failed", {
          error: readErrorMessage(error, "Image worker could not start."),
          progress: 0,
        });
        if (failed) onError?.(failed);
      }
    },
    [convert, ensurePool, handleWorkerMessage, onError, transitionStatus],
  );

  const addFiles = useCallback(
    (incoming: FileList | File[] | null): string[] => {
      if (!incoming) return [];

      const list = Array.from(incoming).filter(isSupportedImageUploadFile);
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

      replaceItems([...itemsRef.current, ...newItems]);
      newItems.forEach((item) => enqueueWorker(item));
      return newItems.map((item) => item.id);
    },
    [enqueueWorker, replaceItems],
  );

  const retry = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((entry) => entry.id === id);
      if (!item || item.status !== "failed") return;

      transitionStatus(id, "queued", {
        error: undefined,
        finishedAt: undefined,
        progress: 0,
        startedAt: Date.now(),
      });
      enqueueWorker(item);
    },
    [enqueueWorker, transitionStatus],
  );

  const remove = useCallback(
    (id: string) => {
      const xhr = xhrByIdRef.current.get(id);
      if (xhr) {
        try {
          xhr.abort();
        } catch {
          /* noop */
        }
        xhrByIdRef.current.delete(id);
      }

      preparedQueueRef.current = preparedQueueRef.current.filter(
        (entry) => entry.id !== id,
      );

      const current = itemsRef.current;
      const target = current.find((entry) => entry.id === id);

      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
        objectUrlsRef.current.delete(target.previewUrl);
      }

      replaceItems(current.filter((entry) => entry.id !== id));
    },
    [replaceItems],
  );

  const clear = useCallback(() => {
    xhrByIdRef.current.forEach((xhr) => {
      try {
        xhr.abort();
      } catch {
        /* noop */
      }
    });
    xhrByIdRef.current.clear();
    uploadInFlightRef.current = 0;
    serialUploadInFlightRef.current = false;
    preparedQueueRef.current = [];
    poolRef.current?.dispose();
    poolRef.current = null;

    itemsRef.current.forEach((entry) => {
      if (entry.previewUrl) {
        URL.revokeObjectURL(entry.previewUrl);
        objectUrlsRef.current.delete(entry.previewUrl);
      }
    });

    replaceItems([]);
  }, [replaceItems]);

  const clearCompleted = useCallback(() => {
    const keep: UploadItem[] = [];

    itemsRef.current.forEach((entry) => {
      if (entry.status === "done") {
        if (entry.previewUrl) {
          URL.revokeObjectURL(entry.previewUrl);
          objectUrlsRef.current.delete(entry.previewUrl);
        }
        return;
      }

      keep.push(entry);
    });

    replaceItems(keep);
  }, [replaceItems]);

  useEffect(() => {
    const xhrMap = xhrByIdRef.current;
    const objectUrls = objectUrlsRef.current;

    return () => {
      poolRef.current?.dispose();
      poolRef.current = null;
      xhrMap.forEach((xhr) => {
        try {
          xhr.abort();
        } catch {
          /* noop */
        }
      });
      objectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      objectUrls.clear();
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
        : items.reduce((acc, item) => acc + readStepProgress(item), 0) / total;

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
