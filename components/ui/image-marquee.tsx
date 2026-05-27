"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { IconType } from "react-icons";
import {
  SiApple,
  SiDiscord,
  SiGithub,
  SiGoogle,
  SiNetflix,
  SiReddit,
  SiSpotify,
  SiTelegram,
  SiYoutube,
} from "react-icons/si";
import { cn } from "@/lib/utils";

export type ImageMarqueeDirection = "left" | "right";
export type ClientMarqueeIconId =
  | "apple"
  | "discord"
  | "github"
  | "google"
  | "netflix"
  | "reddit"
  | "spotify"
  | "telegram"
  | "youtube";

export interface ImageMarqueeItem {
  id?: string;
  src?: string;
  alt?: string;
  title?: string;
  desc?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  priority?: boolean;
  /** Client / brand name (used when type="clients") */
  client?: string;
  /** Link to client website or relevant page */
  link?: string;
  /** Local icon id for client marquees, used instead of remote image URLs. */
  icon?: ClientMarqueeIconId;
  /** Optional brand color applied to icon-only client items. */
  iconColor?: string;
}

export interface ImageMarqueeRow {
  id?: string;
  direction?: ImageMarqueeDirection;
  speed?: number;
  height?: number | string;
  images: ImageMarqueeItem[];
}

export interface ImageMarqueeProps {
  rows: ImageMarqueeRow[];
  /** "gallery" (default) renders full images; "clients" renders compact logos */
  type?: "gallery" | "clients";
  height?: number | string;
  rowGap?: number | string;
  itemGap?: number | string;
  className?: string;
  rowClassName?: string;
  itemClassName?: string;
  fullBleed?: boolean;
  hoverSlowdownFactor?: number;
  minItemsPerRow?: number;
  imageSizes?: string;
  /**
   * When true and only one row is provided (gallery type), groups consecutive
   * landscape (w>h) images into 2-up stacked columns; portrait images and
   * odd-leftover landscapes occupy the full row height. Disabled for
   * multi-row marquees so 3-row layouts never split.
   */
  arrangeAsGrid?: boolean;
  /**
   * When true, the entire marquee is hidden until every image has loaded,
   * then enters with a "pixel tear" reveal (blur + saturate + scale + noise).
   * Individual images also fade-blur in as they decode.
   */
  revealOnLoad?: boolean;
}

type GridSlot =
  | {
      kind: "single";
      image: ImageMarqueeItem;
      aspectRatio: number;
    }
  | {
      kind: "stacked";
      images: [ImageMarqueeItem, ImageMarqueeItem];
      aspectRatio: number;
    };

interface MarqueeRowProps {
  row: ImageMarqueeRow;
  rowIndex: number;
  type: "gallery" | "clients";
  defaultHeight: string;
  itemGap: string;
  hoverSlowdownFactor: number;
  minItemsPerRow: number;
  imageSizes: string;
  rowClassName?: string;
  itemClassName?: string;
  gridMode: boolean;
  onImageLoad?: (src: string) => void;
}

const DEFAULT_ASPECT_RATIO = 16 / 9;
const DEFAULT_HEIGHT = "clamp(8.25rem, 18vw, 13rem)";
const DEFAULT_GAP = "1rem";
const DEFAULT_SPEED = 52;
const DEFAULT_IMAGE_SIZES =
  "(max-width: 640px) 72vw, (max-width: 1024px) 40vw, 24vw";
const REVEAL_FALLBACK_MS = 4500;

export const CLIENT_ICON_REGISTRY: Record<ClientMarqueeIconId, IconType> = {
  apple: SiApple,
  discord: SiDiscord,
  github: SiGithub,
  google: SiGoogle,
  netflix: SiNetflix,
  reddit: SiReddit,
  spotify: SiSpotify,
  telegram: SiTelegram,
  youtube: SiYoutube,
};

function toCssValue(value: number | string | undefined, fallback: string) {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value ?? fallback;
}

function resolveAspectRatio(image: ImageMarqueeItem) {
  if (typeof image.aspectRatio === "number" && image.aspectRatio > 0) {
    return image.aspectRatio;
  }

  if (
    typeof image.width === "number" &&
    typeof image.height === "number" &&
    image.height > 0
  ) {
    return image.width / image.height;
  }

  return DEFAULT_ASPECT_RATIO;
}

function buildGridSlots(images: ImageMarqueeItem[]): GridSlot[] {
  const slots: GridSlot[] = [];
  const queue: ImageMarqueeItem[] = [];

  const flushQueue = () => {
    while (queue.length >= 2) {
      const a = queue.shift()!;
      const b = queue.shift()!;
      const aspectRatio = Math.max(
        resolveAspectRatio(a),
        resolveAspectRatio(b),
      );
      slots.push({ kind: "stacked", images: [a, b], aspectRatio });
    }
    if (queue.length === 1) {
      const leftover = queue.shift()!;
      slots.push({
        kind: "single",
        image: leftover,
        aspectRatio: resolveAspectRatio(leftover),
      });
    }
  };

  for (const image of images) {
    const aspect = resolveAspectRatio(image);
    if (aspect > 1) {
      queue.push(image);
    } else {
      flushQueue();
      slots.push({ kind: "single", image, aspectRatio: aspect });
    }
  }
  flushQueue();

  return slots;
}

function expandSlots<T>(items: T[], minimumItems: number): T[] {
  if (!items.length) {
    return [];
  }

  const targetLength = Math.max(minimumItems, items.length);
  const copies = Math.ceil(targetLength / items.length);
  const expanded: T[] = [];

  for (let i = 0; i < copies; i++) {
    expanded.push(...items);
  }

  return expanded;
}

interface MarqueeTileProps {
  image: ImageMarqueeItem;
  type: "gallery" | "clients";
  height: string;
  width?: string;
  aspectRatio: number;
  imageSizes: string;
  priority: boolean;
  itemClassName?: string;
  onImageLoad?: (src: string) => void;
}

function GalleryTile({
  image,
  height,
  width,
  aspectRatio,
  imageSizes,
  priority,
  itemClassName,
  onImageLoad,
}: Omit<MarqueeTileProps, "type">) {
  const [loaded, setLoaded] = useState(false);
  const imageSrc = image.src;

  if (!imageSrc) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[0.5rem] transition-transform duration-300 ease-out group-hover:-translate-y-1",
        itemClassName,
      )}
      style={{ aspectRatio, height, width }}
    >
      <div
        className={cn(
          "absolute inset-0 transition-[opacity,filter,transform] duration-[1100ms] ease-out",
          loaded
            ? "opacity-100 blur-0 scale-100"
            : "opacity-0 blur-2xl scale-[1.06]",
        )}
      >
        <Image
          src={imageSrc}
          alt={image.alt ?? ""}
          fill
          sizes={imageSizes}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
          onLoad={() => {
            setLoaded(true);
            onImageLoad?.(imageSrc);
          }}
        />
      </div>
    </div>
  );
}

function MarqueeRow({
  row,
  rowIndex,
  type,
  defaultHeight,
  itemGap,
  hoverSlowdownFactor,
  minItemsPerRow,
  imageSizes,
  rowClassName,
  itemClassName,
  gridMode,
  onImageLoad,
}: MarqueeRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const segmentRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const offsetRef = useRef(0);
  const widthRef = useRef(0);
  const speedScaleRef = useRef(1);
  const frameRef = useRef<number | null>(null);
  const nextSegmentKeyRef = useRef(2);
  const [segmentKeys, setSegmentKeys] = useState([0, 1]);

  const direction = row.direction ?? (rowIndex % 2 === 0 ? "left" : "right");
  const speed = row.speed ?? DEFAULT_SPEED + rowIndex * 8;
  const height = toCssValue(row.height, defaultHeight);
  const edgePadding = `calc(${itemGap} / 2)`;
  const stackedTileHeight = `calc((${height} - ${itemGap}) / 2)`;

  const slots = useMemo<GridSlot[]>(() => {
    if (gridMode) {
      return buildGridSlots(row.images);
    }
    return row.images.map((image) => ({
      kind: "single" as const,
      image,
      aspectRatio: resolveAspectRatio(image),
    }));
  }, [gridMode, row.images]);

  const expandedSlots = useMemo(
    () => expandSlots(slots, minItemsPerRow),
    [minItemsPerRow, slots],
  );

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    const segment = segmentRef.current;

    if (!container || !track || !segment || !expandedSlots.length) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let previousTime = 0;

    const applyTransform = () => {
      if (!widthRef.current) {
        track.style.transform = "translate3d(0px, 0px, 0px)";
        return;
      }

      const translateX =
        direction === "left"
          ? -offsetRef.current
          : -(widthRef.current - offsetRef.current);

      track.style.transform = `translate3d(${translateX}px, 0px, 0px)`;
    };

    const updateMetrics = () => {
      widthRef.current = segment.getBoundingClientRect().width;
      const containerWidth = container.getBoundingClientRect().width;

      if (widthRef.current > 0) {
        offsetRef.current %= widthRef.current;
      } else {
        offsetRef.current = 0;
      }

      const nextSegmentCopies =
        widthRef.current > 0
          ? Math.max(2, Math.ceil(containerWidth / widthRef.current) + 1)
          : 2;

      setSegmentKeys((current) => {
        if (current.length === nextSegmentCopies) {
          return current;
        }

        if (current.length > nextSegmentCopies) {
          return current.slice(0, nextSegmentCopies);
        }

        const appendedKeys = Array.from(
          { length: nextSegmentCopies - current.length },
          () => nextSegmentKeyRef.current++,
        );

        return [...current, ...appendedKeys];
      });

      applyTransform();
    };

    const animate = (time: number) => {
      if (!previousTime) {
        previousTime = time;
      }

      const deltaSeconds = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      if (mediaQuery.matches || widthRef.current === 0) {
        track.style.transform = "translate3d(0px, 0px, 0px)";
      } else {
        const targetScale = hoverRef.current ? hoverSlowdownFactor : 1;
        speedScaleRef.current += (targetScale - speedScaleRef.current) * 0.08;
        offsetRef.current += speed * speedScaleRef.current * deltaSeconds;

        if (offsetRef.current >= widthRef.current) {
          offsetRef.current %= widthRef.current;
          setSegmentKeys((current) => {
            if (current.length < 2) {
              return current;
            }

            const [first, ...rest] = current;
            return [...rest, first];
          });
        }

        applyTransform();
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    const handleMotionChange = () => {
      previousTime = 0;
      speedScaleRef.current = 1;

      if (mediaQuery.matches) {
        offsetRef.current = 0;
      }

      applyTransform();
    };

    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(container);
    resizeObserver.observe(segment);
    updateMetrics();

    mediaQuery.addEventListener("change", handleMotionChange);
    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      mediaQuery.removeEventListener("change", handleMotionChange);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [direction, hoverSlowdownFactor, expandedSlots.length, speed]);

  if (!expandedSlots.length) {
    return null;
  }

  const isClient = type === "clients";

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden py-2 bg-transparent", rowClassName)}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {segmentKeys.map((segmentKey, segmentIndex) => (
          <div
            key={segmentKey}
            ref={segmentIndex === 0 ? segmentRef : undefined}
            aria-hidden={segmentIndex > 0}
            className="flex shrink-0 items-stretch"
            style={{ gap: itemGap, paddingInline: edgePadding }}
          >
            {expandedSlots.map((slot, slotIndex) => {
              const isPriorityIndex = segmentIndex === 0 && rowIndex === 0 && slotIndex < 2;

              if (isClient && slot.kind === "single") {
                const image = slot.image;
                const aspectRatio = slot.aspectRatio;
                const clientLabel = image.alt ?? image.client ?? "";
                const ClientIcon = image.icon
                  ? CLIENT_ICON_REGISTRY[image.icon]
                  : undefined;
                const imageSrc = image.src;
                const isSvgImage = imageSrc?.toLowerCase().endsWith(".svg") ?? false;
                const clientLogoAspectRatio = Math.max(
                  0.85,
                  Math.min(aspectRatio, 7.25),
                );
                const clientLogoWidth = `calc(${height} * ${clientLogoAspectRatio})`;

                const inner = (
                  <div
                    className={cn(
                      "relative flex items-center justify-center",
                      itemClassName,
                    )}
                    style={{ height, width: image.src ? clientLogoWidth : undefined }}
                  >
                    {ClientIcon ? (
                      <div
                        role="img"
                        aria-label={clientLabel}
                        className="flex items-center justify-center"
                      >
                        <ClientIcon
                          aria-hidden
                          className="size-[2.275rem] shrink-0 opacity-80 transition-all duration-300 ease-out group-hover:scale-110 group-hover:opacity-100 md:size-[2.6rem]"
                          style={{ color: image.iconColor ?? "currentColor" }}
                        />
                      </div>
                    ) : image.src ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={image.src}
                          alt={clientLabel}
                          fill
                          sizes={imageSizes}
                          unoptimized={isSvgImage}
                          priority={image.priority ?? isPriorityIndex}
                          className="object-contain opacity-80 drop-shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out group-hover:scale-110 group-hover:opacity-100"
                          onLoad={() => {
                            if (image.src) onImageLoad?.(image.src);
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        {image.client ?? clientLabel}
                      </span>
                    )}
                  </div>
                );

                return (
                  <article
                    key={`${image.id ?? image.src ?? image.icon ?? image.client ?? "marquee-item"}-${segmentIndex}-${slotIndex}`}
                    className={cn(
                      "group relative shrink-0 marquee-logo-reveal",
                    )}
                    style={
                      {
                        "--marquee-logo-delay": `${180 + Math.min(slotIndex, 8) * 52}ms`,
                      } as CSSProperties
                    }
                    onPointerEnter={() => {
                      hoverRef.current = true;
                    }}
                    onPointerLeave={() => {
                      hoverRef.current = false;
                    }}
                  >
                    {image.link ? (
                      <a
                        href={image.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={clientLabel}
                        title={image.client}
                      >
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </article>
                );
              }

              if (slot.kind === "stacked") {
                const [topImage, bottomImage] = slot.images;
                const stackedWidth = `calc(${stackedTileHeight} * ${slot.aspectRatio})`;

                return (
                  <article
                    key={`stacked-${segmentIndex}-${slotIndex}`}
                    className="group relative shrink-0"
                    onPointerEnter={() => {
                      hoverRef.current = true;
                    }}
                    onPointerLeave={() => {
                      hoverRef.current = false;
                    }}
                    style={{
                      height,
                      width: stackedWidth,
                      display: "flex",
                      flexDirection: "column",
                      gap: itemGap,
                    }}
                  >
                    <GalleryTile
                      image={topImage}
                      height={stackedTileHeight}
                      width="100%"
                      aspectRatio={resolveAspectRatio(topImage)}
                      imageSizes={imageSizes}
                      priority={isPriorityIndex}
                      itemClassName={itemClassName}
                      onImageLoad={onImageLoad}
                    />
                    <GalleryTile
                      image={bottomImage}
                      height={stackedTileHeight}
                      width="100%"
                      aspectRatio={resolveAspectRatio(bottomImage)}
                      imageSizes={imageSizes}
                      priority={isPriorityIndex}
                      itemClassName={itemClassName}
                      onImageLoad={onImageLoad}
                    />
                  </article>
                );
              }

              const image = slot.image;
              const aspectRatio = slot.aspectRatio;

              if (!image.src) {
                return null;
              }

              return (
                <article
                  key={`${image.id ?? image.src ?? "marquee-item"}-${segmentIndex}-${slotIndex}`}
                  className="group relative shrink-0"
                  onPointerEnter={() => {
                    hoverRef.current = true;
                  }}
                  onPointerLeave={() => {
                    hoverRef.current = false;
                  }}
                >
                  <GalleryTile
                    image={image}
                    height={height}
                    aspectRatio={aspectRatio}
                    imageSizes={imageSizes}
                    priority={image.priority ?? isPriorityIndex}
                    itemClassName={itemClassName}
                    onImageLoad={onImageLoad}
                  />
                </article>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImageMarquee({
  rows,
  type = "gallery",
  height,
  rowGap,
  itemGap,
  className,
  rowClassName,
  itemClassName,
  fullBleed = false,
  hoverSlowdownFactor = 0.28,
  minItemsPerRow = 8,
  imageSizes = DEFAULT_IMAGE_SIZES,
  arrangeAsGrid = false,
  revealOnLoad = false,
}: ImageMarqueeProps) {
  const resolvedHeight = toCssValue(height, DEFAULT_HEIGHT);
  const resolvedRowGap = toCssValue(rowGap, DEFAULT_GAP);
  const resolvedItemGap = toCssValue(itemGap, DEFAULT_GAP);

  // Grid arrangement is only available for single-row gallery marquees,
  // so the 3-row portfolio layout and the multi-row client layout never split.
  const gridMode = arrangeAsGrid && type === "gallery" && rows.length === 1;

  const expectedSrcs = useMemo(() => {
    const set = new Set<string>();
    for (const row of rows) {
      for (const image of row.images) {
        if (image.src) set.add(image.src);
      }
    }
    return set;
  }, [rows]);

  const expectedCount = expectedSrcs.size;
  const loadedRef = useRef<Set<string>>(new Set());
  const [ready, setReady] = useState(
    () => !revealOnLoad || expectedCount === 0,
  );

  const handleImageLoad = useCallback(
    (src: string) => {
      if (!revealOnLoad) return;
      if (!expectedSrcs.has(src)) return;
      loadedRef.current.add(src);
      if (loadedRef.current.size >= expectedCount) {
        setReady(true);
      }
    },
    [expectedCount, expectedSrcs, revealOnLoad],
  );

  useEffect(() => {
    if (!revealOnLoad || expectedCount === 0) {
      return;
    }

    const fallback = window.setTimeout(() => {
      setReady(true);
    }, REVEAL_FALLBACK_MS);

    return () => window.clearTimeout(fallback);
  }, [expectedCount, revealOnLoad]);

  if (!rows.length) {
    return null;
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-transparent py-2 [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]",
        fullBleed && "left-1/2 w-screen -translate-x-1/2",
        revealOnLoad && "marquee-pixel-tear",
        revealOnLoad && ready && "is-ready",
        className,
      )}
    >
      <div className="flex flex-col" style={{ gap: resolvedRowGap }}>
        {rows.map((row, rowIndex) => (
          <MarqueeRow
            key={row.id ?? `marquee-row-${rowIndex}`}
            row={row}
            rowIndex={rowIndex}
            type={type}
            defaultHeight={resolvedHeight}
            itemGap={resolvedItemGap}
            hoverSlowdownFactor={hoverSlowdownFactor}
            minItemsPerRow={minItemsPerRow}
            imageSizes={imageSizes}
            rowClassName={rowClassName}
            itemClassName={itemClassName}
            gridMode={gridMode}
            onImageLoad={handleImageLoad}
          />
        ))}
      </div>
    </section>
  );
}
