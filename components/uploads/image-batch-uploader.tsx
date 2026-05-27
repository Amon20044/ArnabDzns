"use client";

import { useCallback, useId, useRef, useState } from "react";
import {
  CheckIcon,
  FileImageIcon,
  Loader2Icon,
  RotateCwIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import {
  useImageUploadQueue,
  type UploadItem,
  type UploadStep,
  type UseImageUploadQueueOptions,
  type UseImageUploadQueueReturn,
} from "@/lib/uploads/use-image-upload-queue";
import { cn } from "@/lib/utils";

const STEP_LABEL: Record<UploadStep, string> = {
  queued: "Queued",
  reading: "Reading file…",
  decoding: "Decoding image…",
  converting: "Converting to WebP…",
  uploading: "Uploading to ImgBB…",
  done: "Uploaded",
  failed: "Failed",
};

const STEP_ORDER: UploadStep[] = [
  "queued",
  "reading",
  "decoding",
  "converting",
  "uploading",
  "done",
];

function formatBytes(value: number | undefined) {
  if (!value || !Number.isFinite(value)) return "—";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024)
    return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export type UploadQueueViewProps = {
  queue: UseImageUploadQueueReturn;
  className?: string;
  emptyState?: React.ReactNode;
};

/** Renders an external queue (from useImageUploadQueue). Reusable wherever
 *  step-by-step upload feedback is needed. */
export function UploadQueueView({ queue, className, emptyState }: UploadQueueViewProps) {
  if (!queue.items.length) {
    return emptyState ? <div className={className}>{emptyState}</div> : null;
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>
          {queue.summary.completed} done · {queue.summary.inFlight} in flight ·{" "}
          {queue.summary.failed} failed · {queue.summary.total} total
        </span>
        <div className="flex gap-2">
          {queue.summary.completed > 0 && (
            <button
              type="button"
              onClick={queue.clearCompleted}
              className="rounded-full px-2 py-0.5 text-[11px] font-medium hover:bg-black/5"
            >
              Clear completed
            </button>
          )}
          <button
            type="button"
            onClick={queue.clear}
            className="rounded-full px-2 py-0.5 text-[11px] font-medium hover:bg-black/5"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-black/10" aria-hidden>
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
          style={{ width: `${queue.summary.overallProgress * 100}%` }}
        />
      </div>

      <ul className="grid gap-2">
        {queue.items.map((item) => (
          <UploadRow
            key={item.id}
            item={item}
            onRetry={() => queue.retry(item.id)}
            onRemove={() => queue.remove(item.id)}
          />
        ))}
      </ul>
    </div>
  );
}

export type ImageBatchUploaderProps = {
  className?: string;
  options?: UseImageUploadQueueOptions;
  hideDropZone?: boolean;
  children?: (api: {
    addFiles: (files: FileList | File[] | null) => void;
  }) => React.ReactNode;
};

/** All-in-one uploader: drop zone + queue + per-file step rows. */
export function ImageBatchUploader({
  className,
  options,
  hideDropZone,
  children,
}: ImageBatchUploaderProps) {
  const queue = useImageUploadQueue(options);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      queue.addFiles(event.dataTransfer?.files ?? null);
    },
    [queue],
  );

  const handlePick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className={cn("grid gap-3", className)}>
      {!hideDropZone && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload images"
          onClick={handlePick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handlePick();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-sm transition",
            isDragOver
              ? "border-primary bg-primary/5 text-primary"
              : "border-black/15 bg-white/60 text-text-secondary hover:border-black/35 hover:text-text-primary",
          )}
        >
          <UploadCloudIcon className="size-7 opacity-70" aria-hidden />
          <span className="font-medium">
            Drop images here or click to choose
          </span>
          <span className="text-[11px] opacity-70">
            Multiple files supported · processed off-thread · originals kept by default · uploads never expire
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            multiple
            accept="image/*"
            hidden
            onChange={(event) => {
              queue.addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
      )}

      {children?.({ addFiles: queue.addFiles })}

      <UploadQueueView queue={queue} />
    </div>
  );
}

interface UploadRowProps {
  item: UploadItem;
  onRetry: () => void;
  onRemove: () => void;
}

function UploadRow({ item, onRetry, onRemove }: UploadRowProps) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-black/8 bg-white/85 px-3 py-2 shadow-[0_8px_28px_rgba(15,23,42,0.04)]",
        item.status === "failed" && "border-red-200 bg-red-50/40",
        item.status === "done" && "border-emerald-200/70 bg-emerald-50/40",
      )}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-black/8 bg-black/4">
        {item.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.previewUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <FileImageIcon className="m-auto size-5 text-text-secondary" />
        )}
      </div>

      <div className="grid min-w-0 flex-1 gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div
            className="min-w-0 truncate font-medium text-text-primary"
            title={item.file.name}
          >
            {item.file.name}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-secondary">
            <span>{formatBytes(item.byteLength ?? item.file.size)}</span>
            {item.width && item.height ? (
              <span>
                {item.width}×{item.height}
              </span>
            ) : null}
            <StepBadge status={item.status} />
          </div>
        </div>

        <StepProgress item={item} />

        {item.error && (
          <div className="text-[11px] text-red-600">{item.error}</div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {item.status === "failed" && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full p-1.5 text-text-secondary transition hover:bg-black/5 hover:text-text-primary"
            aria-label="Retry upload"
          >
            <RotateCwIcon className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-1.5 text-text-secondary transition hover:bg-black/5 hover:text-text-primary"
          aria-label="Remove from queue"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </li>
  );
}

function StepBadge({ status }: { status: UploadStep }) {
  const isWorking =
    status === "reading" ||
    status === "decoding" ||
    status === "converting" ||
    status === "uploading";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        status === "done"
          ? "bg-emerald-100 text-emerald-700"
          : status === "failed"
            ? "bg-red-100 text-red-700"
            : status === "queued"
              ? "bg-black/6 text-text-secondary"
              : "bg-primary/10 text-primary",
      )}
    >
      {status === "done" && <CheckIcon className="size-3" />}
      {isWorking && <Loader2Icon className="size-3 animate-spin" />}
      {STEP_LABEL[status]}
    </span>
  );
}

function StepProgress({ item }: { item: UploadItem }) {
  const reached = new Set(item.steps.map((entry) => entry.step));
  const currentIndex = STEP_ORDER.indexOf(item.status);

  if (item.status === "failed") {
    return (
      <div className="h-1 w-full overflow-hidden rounded-full bg-red-100">
        <div className="h-full w-full rounded-full bg-red-300" />
      </div>
    );
  }

  const fractional =
    item.status === "uploading"
      ? Math.max(0, Math.min(1, item.progress))
      : item.status === "done"
        ? 1
        : currentIndex >= 0
          ? currentIndex / Math.max(1, STEP_ORDER.length - 1)
          : 0;

  return (
    <div className="grid gap-1">
      <div className="h-1 w-full overflow-hidden rounded-full bg-black/8">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
          style={{ width: `${fractional * 100}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-1 text-[9px] uppercase tracking-wide text-text-secondary">
        {STEP_ORDER.filter((step) => step !== "queued").map((step) => (
          <span
            key={step}
            className={cn(
              "rounded-full px-1.5 py-0.5",
              reached.has(step)
                ? "bg-primary/10 text-primary"
                : "bg-black/4 text-text-secondary/70",
            )}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
