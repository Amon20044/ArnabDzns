"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExternalLinkIcon,
  ImagePlusIcon,
  ImagesIcon,
  PencilLineIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react";
import {
  ArrayMeta,
  EditorSection,
  NumberField,
  SectionGrid,
  SelectField,
  TextField,
  ToggleField,
  moveArrayItem,
  removeArrayItem,
  updateArrayItem,
} from "@/components/admin/content-editor-fields";
import { EditorModal } from "@/components/admin/editor-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CLIENT_ICON_REGISTRY,
  type ImageMarqueeItem,
  type ImageMarqueeRow,
} from "@/components/ui/image-marquee";
import { cn } from "@/lib/utils";

type MarqueeRowsEditorProps = {
  rows: ImageMarqueeRow[];
  onChange: (rows: ImageMarqueeRow[]) => void;
  type?: "clients" | "gallery";
};

type PickerState = {
  rowIndex: number;
  replaceIndex?: number;
} | null;

type SeoState = {
  rowIndex: number;
  itemIndex: number;
} | null;

type LibraryEntry = {
  item: ImageMarqueeItem;
  rowIndex: number;
  itemIndex: number;
  sortKey: number;
};

type UploadedMarqueeAsset = {
  id?: string;
  src: string;
  displaySrc?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  alt?: string;
  title?: string;
  desc?: string;
};

type UploadResponse = {
  assets?: UploadedMarqueeAsset[];
  error?: string;
};

const MARQUEE_DIRECTION_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function createUniqueId(prefix: string) {
  const normalizedPrefix = slugify(prefix) || "asset";

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${normalizedPrefix}-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `${normalizedPrefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function resolveAspectRatio(item: ImageMarqueeItem) {
  if (typeof item.aspectRatio === "number" && item.aspectRatio > 0) {
    return item.aspectRatio;
  }

  if (
    typeof item.width === "number" &&
    typeof item.height === "number" &&
    item.width > 0 &&
    item.height > 0
  ) {
    return item.width / item.height;
  }

  return 16 / 9;
}

function resolveItemLabel(item: ImageMarqueeItem, fallback = "Untitled image") {
  return (
    item.client?.trim() ||
    item.title?.trim() ||
    item.alt?.trim() ||
    item.id?.trim() ||
    fallback
  );
}

function resolveItemSubtitle(item: ImageMarqueeItem) {
  return (
    item.alt?.trim() ||
    item.desc?.trim() ||
    item.link?.trim() ||
    item.src?.trim() ||
    (item.icon ? `Fallback icon: ${item.icon}` : "SEO details can be added later.")
  );
}

function createMarqueeRow(index: number, type: "clients" | "gallery") {
  return {
    id: `${type === "clients" ? "clients" : "marquee"}-row-${index + 1}`,
    direction: index % 2 === 0 ? "left" : "right",
    speed: type === "clients" ? 40 : 56,
    height: type === "clients" ? "3rem" : "12rem",
    images: [],
  } satisfies ImageMarqueeRow;
}

function cloneMarqueeItem(item: ImageMarqueeItem): ImageMarqueeItem {
  const nextWidth =
    typeof item.width === "number" && item.width > 0 ? item.width : undefined;
  const nextHeight =
    typeof item.height === "number" && item.height > 0 ? item.height : undefined;

  return {
    ...item,
    id: createUniqueId(resolveItemLabel(item, "marquee-item")),
    alt: item.alt ?? item.client ?? item.title ?? "",
    title: item.title ?? item.client ?? "",
    desc: item.desc ?? "",
    client: item.client ?? "",
    link: item.link ?? "",
    iconColor: item.iconColor ?? "",
    width: nextWidth,
    height: nextHeight,
    aspectRatio: item.aspectRatio ?? resolveAspectRatio(item),
    priority: Boolean(item.priority),
  };
}

function uploadedAssetToMarqueeItem(
  asset: UploadedMarqueeAsset,
  type: "clients" | "gallery",
): ImageMarqueeItem {
  const width =
    typeof asset.width === "number" && asset.width > 0
      ? asset.width
      : type === "clients"
        ? 280
        : 1600;
  const height =
    typeof asset.height === "number" && asset.height > 0
      ? asset.height
      : type === "clients"
        ? 112
        : 900;
  const baseLabel = asset.title || asset.alt || asset.src || "uploaded-image";

  return {
    id: createUniqueId(baseLabel),
    src: asset.src,
    alt: asset.alt ?? "",
    title: asset.title ?? asset.alt ?? "",
    desc: asset.desc ?? "",
    client: type === "clients" ? asset.title ?? asset.alt ?? "" : "",
    link: "",
    width,
    height,
    aspectRatio:
      asset.aspectRatio && asset.aspectRatio > 0
        ? asset.aspectRatio
        : width / height,
    priority: false,
  };
}

function MarqueeAssetPreview({
  item,
  type,
  className,
}: {
  item: ImageMarqueeItem;
  type: "clients" | "gallery";
  className?: string;
}) {
  const ClientIcon =
    item.icon && !item.src ? CLIENT_ICON_REGISTRY[item.icon] : undefined;
  const label = resolveItemLabel(item, type === "clients" ? "Client" : "Image");

  if (type === "clients") {
    return (
      <div
        className={cn(
          "relative flex h-full min-h-24 items-center justify-center overflow-hidden rounded-[1.35rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,245,249,0.82)_100%)] px-4",
          className,
        )}
      >
        {item.src ? (
          <Image
            src={item.src}
            alt={item.alt ?? label}
            width={item.width ?? 280}
            height={item.height ?? 112}
            sizes="(max-width: 768px) 45vw, 180px"
            className="h-12 w-full object-contain"
          />
        ) : ClientIcon ? (
          <ClientIcon
            className="size-12"
            style={{ color: item.iconColor ?? "currentColor" }}
          />
        ) : (
          <span className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </span>
        )}
      </div>
    );
  }

  if (item.src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.35rem] border border-black/6 bg-slate-100",
          className,
        )}
        style={{ aspectRatio: resolveAspectRatio(item) }}
      >
        <Image
          src={item.src}
          alt={item.alt ?? label}
          fill
          sizes="(max-width: 768px) 70vw, 200px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-28 items-center justify-center rounded-[1.35rem] border border-dashed border-border bg-muted/40 px-4 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      Upload an image to preview this slot.
    </div>
  );
}

function MarqueeImageTile({
  item,
  index,
  type,
  canMoveUp,
  canMoveDown,
  onEdit,
  onReplace,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  item: ImageMarqueeItem;
  index: number;
  type: "clients" | "gallery";
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onReplace: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const label = resolveItemLabel(item, `Image ${index + 1}`);
  const subtitle = resolveItemSubtitle(item);
  const ClientIcon =
    item.icon && !item.src ? CLIENT_ICON_REGISTRY[item.icon] : undefined;
  const aspectClass = type === "clients" ? "aspect-[4/3]" : "aspect-[16/9]";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
      <div className={cn("relative w-full overflow-hidden bg-slate-100", aspectClass)}>
        {item.src ? (
          <Image
            src={item.src}
            alt={item.alt ?? label}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
            className={type === "clients" ? "object-contain p-4" : "object-cover"}
          />
        ) : ClientIcon ? (
          <div className="flex h-full w-full items-center justify-center p-5">
            <ClientIcon
              className="h-3/4 w-3/4"
              style={{ color: item.iconColor ?? "currentColor" }}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </div>
        )}

        <div className="pointer-events-none absolute left-2 top-2">
          <Badge
            variant={item.alt ? "success" : "warning"}
            className="pointer-events-auto shadow-sm"
          >
            {item.alt ? "Alt ready" : "Add alt"}
          </Badge>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-black/65 via-black/25 to-transparent p-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5">
            <Button type="button" size="icon-sm" variant="secondary" onClick={onEdit} title="Edit SEO">
              <PencilLineIcon />
            </Button>
            <Button type="button" size="icon-sm" variant="secondary" onClick={onReplace} title="Replace">
              <ImagePlusIcon />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              disabled={!canMoveUp}
              onClick={onMoveUp}
              title="Move up"
            >
              <ArrowUpIcon />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              disabled={!canMoveDown}
              onClick={onMoveDown}
              title="Move down"
            >
              <ArrowDownIcon />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              onClick={onRemove}
              title="Remove"
            >
              <Trash2Icon />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-0.5 px-3 py-2">
        <p className="truncate text-sm font-semibold text-foreground">{label}</p>
        <p className="truncate text-xs leading-5 text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function MarqueeRowsEditor({
  rows,
  onChange,
  type = "gallery",
}: MarqueeRowsEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pickerState, setPickerState] = useState<PickerState>(null);
  const [seoState, setSeoState] = useState<SeoState>(null);
  const [assetSearch, setAssetSearch] = useState("");
  const deferredAssetSearch = useDeferredValue(assetSearch.trim().toLowerCase());
  const [recentFirst, setRecentFirst] = useState(true);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, startUploadTransition] = useTransition();

  const pickerRow = pickerState ? rows[pickerState.rowIndex] : undefined;
  const seoItem = seoState
    ? rows[seoState.rowIndex]?.images[seoState.itemIndex]
    : undefined;

  useEffect(() => {
    if (pickerState && !rows[pickerState.rowIndex]) {
      setPickerState(null);
    }
  }, [pickerState, rows]);

  useEffect(() => {
    if (
      seoState &&
      !rows[seoState.rowIndex]?.images?.[seoState.itemIndex]
    ) {
      setSeoState(null);
    }
  }, [rows, seoState]);

  const libraryItems = useMemo<LibraryEntry[]>(() => {
    return rows.flatMap((row, rowIndex) =>
      row.images.map((item, itemIndex) => ({
        item,
        rowIndex,
        itemIndex,
        sortKey: rowIndex * 1000 + itemIndex,
      })),
    );
  }, [rows]);

  const filteredLibraryItems = useMemo(() => {
    const searchableItems = libraryItems.filter(
      (entry) => entry.item.src || entry.item.icon || entry.item.client,
    );

    const matchedItems = deferredAssetSearch
      ? searchableItems.filter((entry) => {
          const haystack = [
            resolveItemLabel(entry.item),
            entry.item.alt,
            entry.item.title,
            entry.item.desc,
            entry.item.client,
            entry.item.link,
            entry.item.src,
            entry.item.icon,
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(deferredAssetSearch);
        })
      : searchableItems;

    return [...matchedItems].sort((left, right) =>
      recentFirst
        ? right.sortKey - left.sortKey
        : left.sortKey - right.sortKey,
    );
  }, [deferredAssetSearch, libraryItems, recentFirst]);

  function redirectToLogin() {
    const nextPath =
      typeof window === "undefined"
        ? "/dashboard/content"
        : `${window.location.pathname}${window.location.search}`;

    router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    router.refresh();
  }

  function updateRow(rowIndex: number, nextRow: ImageMarqueeRow) {
    onChange(updateArrayItem(rows, rowIndex, nextRow));
  }

  function updateRowImages(rowIndex: number, nextImages: ImageMarqueeItem[]) {
    const row = rows[rowIndex];

    if (!row) {
      return;
    }

    updateRow(rowIndex, {
      ...row,
      images: nextImages,
    });
  }

  function insertAssetsIntoTarget(
    target: NonNullable<PickerState>,
    assets: ImageMarqueeItem[],
  ) {
    if (!assets.length) {
      return null;
    }

    const row = rows[target.rowIndex];

    if (!row) {
      return null;
    }

    const nextAssets = assets.map((item) => cloneMarqueeItem(item));
    let nextImages = [...row.images];
    const firstInsertedIndex =
      typeof target.replaceIndex === "number"
        ? target.replaceIndex
        : nextImages.length;

    if (typeof target.replaceIndex === "number") {
      const [firstAsset, ...restAssets] = nextAssets;

      nextImages = updateArrayItem(nextImages, target.replaceIndex, firstAsset);

      if (restAssets.length) {
        nextImages = [
          ...nextImages.slice(0, target.replaceIndex + 1),
          ...restAssets,
          ...nextImages.slice(target.replaceIndex + 1),
        ];
      }
    } else {
      nextImages = [...nextImages, ...nextAssets];
    }

    updateRowImages(target.rowIndex, nextImages);

    return firstInsertedIndex;
  }

  function openPicker(rowIndex: number, replaceIndex?: number) {
    setUploadError("");
    setAssetSearch("");
    setPickerState({ rowIndex, replaceIndex });
  }

  function handleSelectLibraryItem(entry: LibraryEntry) {
    if (!pickerState) {
      return;
    }

    const nextIndex = insertAssetsIntoTarget(pickerState, [entry.item]);
    const targetRowIndex = pickerState.rowIndex;

    setPickerState(null);

    if (typeof nextIndex === "number") {
      setSeoState({
        rowIndex: targetRowIndex,
        itemIndex: nextIndex,
      });
    }
  }

  function handleFileSelection(fileList: FileList | null) {
    if (!pickerState || !fileList?.length) {
      return;
    }

    const files = [...fileList].filter((file) => file.type.startsWith("image/"));

    if (!files.length) {
      setUploadError("Choose at least one image file to upload.");
      return;
    }

    const target = pickerState;

    startUploadTransition(async () => {
      try {
        setUploadError("");

        const uploadedAssets: ImageMarqueeItem[] = [];

        for (const file of files) {
          const formData = new FormData();
          formData.set("file", file);

          const response = await fetch("/api/uploads/imgbb", {
            method: "POST",
            body: formData,
            credentials: "same-origin",
          });
          const result = (await response.json()) as UploadResponse;

          if (response.status === 401) {
            redirectToLogin();
            return;
          }

          if (!response.ok || !result.assets?.length) {
            throw new Error(result.error ?? "ImgBB upload failed.");
          }

          uploadedAssets.push(
            ...result.assets.map((asset) => uploadedAssetToMarqueeItem(asset, type)),
          );
        }

        const nextIndex = insertAssetsIntoTarget(target, uploadedAssets);
        setPickerState(null);

        if (typeof nextIndex === "number") {
          setSeoState({
            rowIndex: target.rowIndex,
            itemIndex: nextIndex,
          });
        }
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Image upload failed.",
        );
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    });
  }

  function updateSeoItem(nextItem: ImageMarqueeItem) {
    if (!seoState) {
      return;
    }

    const row = rows[seoState.rowIndex];

    if (!row) {
      return;
    }

    updateRow(seoState.rowIndex, {
      ...row,
      images: updateArrayItem(row.images, seoState.itemIndex, nextItem),
    });
  }

  return (
    <>
      <EditorSection
        title="Marquee Rows"
        description="Manage each row with the same reusable upload, reuse, and SEO-edit flow."
        action={
          <ArrayMeta
            count={rows.length}
            label={rows.length === 1 ? "row" : "rows"}
          />
        }
      >
        <div className="grid gap-4">
          {rows.length ? (
            rows.map((row, rowIndex) => (
              <Card
                key={row.id ?? `marquee-row-${rowIndex}`}
                className="rounded-[1.85rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,248,250,0.94)_100%)] shadow-[0_20px_70px_rgba(15,23,42,0.06)]"
              >
                <CardHeader className="border-b border-black/6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="grid gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Row {rowIndex + 1}</Badge>
                        <Badge variant="outline">
                          {row.images.length} {row.images.length === 1 ? "asset" : "assets"}
                        </Badge>
                        <Badge variant="outline">
                          {type === "clients" ? "Client logos" : "Gallery images"}
                        </Badge>
                      </div>
                      <div>
                        <CardTitle>{row.id || `Row ${rowIndex + 1}`}</CardTitle>
                        <CardDescription>
                          {type === "clients"
                            ? "Upload client logos, replace icon-only entries, or reuse artwork from another row."
                            : "Upload fresh visuals or reuse existing marquee artwork from another row."}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openPicker(rowIndex)}
                      >
                        <ImagePlusIcon />
                        Add media
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={rowIndex === 0}
                        onClick={() =>
                          onChange(moveArrayItem(rows, rowIndex, "up"))
                        }
                      >
                        <ArrowUpIcon />
                        Up
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={rowIndex === rows.length - 1}
                        onClick={() =>
                          onChange(moveArrayItem(rows, rowIndex, "down"))
                        }
                      >
                        <ArrowDownIcon />
                        Down
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onChange(removeArrayItem(rows, rowIndex))}
                      >
                        <Trash2Icon />
                        Remove row
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="grid gap-5 pt-5">
                  <SectionGrid className="xl:grid-cols-4">
                    <TextField
                      label="Row ID"
                      value={row.id}
                      onChange={(id) => updateRow(rowIndex, { ...row, id })}
                    />
                    <SelectField
                      label="Direction"
                      value={row.direction}
                      onChange={(direction) =>
                        updateRow(rowIndex, {
                          ...row,
                          direction: direction as ImageMarqueeRow["direction"],
                        })
                      }
                      options={MARQUEE_DIRECTION_OPTIONS}
                    />
                    <NumberField
                      label="Speed"
                      value={row.speed}
                      onChange={(speed) => updateRow(rowIndex, { ...row, speed })}
                    />
                    <TextField
                      label="Height"
                      value={
                        typeof row.height === "number"
                          ? String(row.height)
                          : row.height
                      }
                      onChange={(height) =>
                        updateRow(rowIndex, { ...row, height })
                      }
                    />
                  </SectionGrid>

                  <div className="grid gap-3">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Row assets
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Each tile can upload, replace, reorder, and open the dedicated SEO details modal.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {row.images.map((item, itemIndex) => (
                        <MarqueeImageTile
                          key={item.id ?? `${rowIndex}-${itemIndex}`}
                          item={item}
                          index={itemIndex}
                          type={type}
                          canMoveUp={itemIndex > 0}
                          canMoveDown={itemIndex < row.images.length - 1}
                          onEdit={() =>
                            setSeoState({
                              rowIndex,
                              itemIndex,
                            })
                          }
                          onReplace={() => openPicker(rowIndex, itemIndex)}
                          onMoveUp={() =>
                            updateRowImages(
                              rowIndex,
                              moveArrayItem(row.images, itemIndex, "up"),
                            )
                          }
                          onMoveDown={() =>
                            updateRowImages(
                              rowIndex,
                              moveArrayItem(row.images, itemIndex, "down"),
                            )
                          }
                          onRemove={() =>
                            updateRowImages(
                              rowIndex,
                              removeArrayItem(row.images, itemIndex),
                            )
                          }
                        />
                      ))}

                      <button
                        type="button"
                        onClick={() => openPicker(rowIndex)}
                        className="group flex flex-col overflow-hidden rounded-2xl border-2 border-dashed border-black/15 bg-white/60 text-left transition hover:border-foreground/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                      >
                        <div
                          className={cn(
                            "flex w-full items-center justify-center bg-slate-50 transition group-hover:bg-slate-100",
                            type === "clients" ? "aspect-[4/3]" : "aspect-[16/9]",
                          )}
                        >
                          <div className="flex size-11 items-center justify-center rounded-full bg-black text-white shadow-sm transition group-hover:scale-105">
                            <PlusIcon className="size-5" />
                          </div>
                        </div>
                        <div className="grid gap-0.5 px-3 py-2">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {type === "clients" ? "Add logo" : "Add image"}
                          </p>
                          <p className="truncate text-xs leading-5 text-muted-foreground">
                            Upload to ImgBB or reuse from library.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-border bg-background/70 px-5 py-8 text-sm text-muted-foreground">
              No marquee rows yet. Add one and start uploading assets right away.
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => onChange([...rows, createMarqueeRow(rows.length, type)])}
          >
            <PlusIcon />
            Add marquee row
          </Button>
        </div>
      </EditorSection>

      <EditorModal
        open={Boolean(pickerState && pickerRow)}
        onClose={() => setPickerState(null)}
        title={
          pickerState?.replaceIndex !== undefined
            ? `Replace media in Row ${pickerState.rowIndex + 1}`
            : `Add media to Row ${pickerState ? pickerState.rowIndex + 1 : ""}`
        }
        description={
          type === "clients"
            ? "Upload new logos to ImgBB or reuse any logo already present in the marquee library."
            : "Upload new visuals to ImgBB or reuse artwork already present in another marquee row."
        }
        size="xl"
        footer={
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Uploaded assets are added to the draft immediately and open in the SEO editor next.
            </p>
            <Button type="button" variant="outline" onClick={() => setPickerState(null)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {type === "clients" ? "Client logo flow" : "Gallery flow"}
            </Badge>
            {pickerState ? (
              <Badge variant="outline">Row {pickerState.rowIndex + 1}</Badge>
            ) : null}
            {pickerState?.replaceIndex !== undefined ? (
              <Badge variant="warning">Replacing current asset</Badge>
            ) : null}
          </div>

          <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
            <div className="rounded-[1.7rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(244,247,250,0.88)_100%)] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
              <div className="flex size-12 items-center justify-center rounded-full bg-black text-white">
                <UploadCloudIcon className="size-5" />
              </div>

              <div className="mt-4 grid gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Upload to ImgBB
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Pick one or multiple images. We upload them, grab the direct URL,
                  and add them into the selected row for you.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => handleFileSelection(event.target.files)}
              />

              <div className="mt-5 grid gap-3">
                <Button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloudIcon />
                  {isUploading ? "Uploading..." : "Choose images"}
                </Button>
                <p className="text-xs leading-5 text-muted-foreground">
                  PNG, JPG, JPEG, WebP, or SVG work best here.
                </p>
                {uploadError ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {uploadError}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={assetSearch}
                    onChange={(event) => setAssetSearch(event.target.value)}
                    placeholder="Search the marquee media library..."
                    className="pl-9"
                  />
                </div>
                <Button
                  type="button"
                  variant={recentFirst ? "secondary" : "outline"}
                  onClick={() => setRecentFirst((current) => !current)}
                >
                  <ImagesIcon />
                  {recentFirst ? "Recent first" : "Oldest first"}
                </Button>
              </div>

              {filteredLibraryItems.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {filteredLibraryItems.map((entry) => (
                    <button
                      key={`${entry.rowIndex}-${entry.itemIndex}-${entry.item.id ?? entry.item.src ?? entry.item.icon ?? "asset"}`}
                      type="button"
                      onClick={() => handleSelectLibraryItem(entry)}
                      className="rounded-[1.4rem] border border-black/6 bg-white/90 p-3 text-left shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-foreground/12 hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
                    >
                      <MarqueeAssetPreview item={entry.item} type={type} />
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {resolveItemLabel(entry.item)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            Row {entry.rowIndex + 1}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {entry.item.src ? "Image" : "Icon"}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-border bg-background/70 px-5 py-10 text-sm text-muted-foreground">
                  No uploaded assets match this search yet. Upload a new file to start the library.
                </div>
              )}
            </div>
          </div>
        </div>
      </EditorModal>

      <EditorModal
        open={Boolean(seoState && seoItem)}
        onClose={() => setSeoState(null)}
        title="Edit image details"
        description="Refine SEO text, labels, and display metadata for the selected marquee asset."
        size="lg"
        footer={
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              These edits update the draft immediately. Save the section when you are happy with the row.
            </p>
            <Button type="button" onClick={() => setSeoState(null)}>
              Done
            </Button>
          </div>
        }
      >
        {seoItem ? (
          <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
            <div className="grid gap-4">
              <MarqueeAssetPreview item={seoItem} type={type} className="min-h-44" />

              <div className="rounded-[1.45rem] border border-black/6 bg-white/85 p-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Source
                    </span>
                    {seoItem.src ? (
                      <a
                        href={seoItem.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        Open
                        <ExternalLinkIcon className="size-3.5" />
                      </a>
                    ) : null}
                  </div>
                  <p className="break-all text-sm leading-6 text-muted-foreground">
                    {seoItem.src || "No uploaded image URL yet. This entry is still icon or text based."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <SectionGrid>
                <TextField
                  label="Asset ID"
                  value={seoItem.id}
                  onChange={(id) => updateSeoItem({ ...seoItem, id })}
                />
                <TextField
                  label="Client / brand"
                  value={seoItem.client}
                  onChange={(client) => updateSeoItem({ ...seoItem, client })}
                />
                <TextField
                  label="Alt text"
                  value={seoItem.alt}
                  onChange={(alt) => updateSeoItem({ ...seoItem, alt })}
                  description="Keep this descriptive and specific for image SEO."
                />
                <TextField
                  label="Image title"
                  value={seoItem.title}
                  onChange={(title) => updateSeoItem({ ...seoItem, title })}
                />
                <TextField
                  label="Destination link"
                  value={seoItem.link}
                  onChange={(link) => updateSeoItem({ ...seoItem, link })}
                />
                <ToggleField
                  label="Priority image"
                  checked={Boolean(seoItem.priority)}
                  onCheckedChange={(priority) =>
                    updateSeoItem({ ...seoItem, priority })
                  }
                  description="Marks this media as a priority image for the marquee."
                />
                <NumberField
                  label="Width"
                  value={seoItem.width}
                  onChange={(width) => updateSeoItem({ ...seoItem, width })}
                />
                <NumberField
                  label="Height"
                  value={seoItem.height}
                  onChange={(height) => updateSeoItem({ ...seoItem, height })}
                />
                <NumberField
                  label="Aspect ratio"
                  value={seoItem.aspectRatio}
                  onChange={(aspectRatio) =>
                    updateSeoItem({ ...seoItem, aspectRatio })
                  }
                />
                {type === "clients" ? (
                  <>
                    <TextField
                      label="Fallback icon ID"
                      value={seoItem.icon}
                      onChange={(icon) =>
                        updateSeoItem({
                          ...seoItem,
                          icon: (icon || undefined) as ImageMarqueeItem["icon"],
                        })
                      }
                      description="Optional backup if you want this logo to render as an icon."
                    />
                    <TextField
                      label="Icon color"
                      value={seoItem.iconColor}
                      onChange={(iconColor) =>
                        updateSeoItem({ ...seoItem, iconColor })
                      }
                    />
                  </>
                ) : null}
              </SectionGrid>

              <Field>
                <FieldLabel>Description</FieldLabel>
                <FieldContent>
                  <Textarea
                    rows={5}
                    value={seoItem.desc ?? ""}
                    placeholder="Add an image description, caption context, or internal notes."
                    onChange={(event) =>
                      updateSeoItem({ ...seoItem, desc: event.target.value })
                    }
                  />
                  <FieldDescription>
                    This helps keep the image inventory organized and gives editors context beyond the alt text.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </div>
          </div>
        ) : null}
      </EditorModal>
    </>
  );
}
