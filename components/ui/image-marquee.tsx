"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
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
  client?: string;
  link?: string;
  icon?: ClientMarqueeIconId;
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
  /**
   * When true and only one row is provided (gallery type), groups consecutive
   * landscape (w>h) tiles into 2-up stacked columns; portraits and any
   * odd-leftover landscape render full-height. Disabled for multi-row.
   */
  arrangeAsGrid?: boolean;
  /** Hide the marquee until all images have loaded, then play a pixel-tear reveal. */
  revealOnLoad?: boolean;
  /**
   * Allow pointer/touch drag to manually scrub the rows. While dragging, the
   * auto-animation pauses. A click that exceeds the drag threshold is
   * suppressed so it doesn't open the lightbox.
   */
  draggable?: boolean;
  /** Open a centered full-view overlay when a gallery tile is clicked. */
  enableLightbox?: boolean;
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
  rowClassName?: string;
  itemClassName?: string;
  gridMode: boolean;
  onTileClick?: (image: ImageMarqueeItem) => void;
  draggable: boolean;
}

const DEFAULT_ASPECT_RATIO = 16 / 9;
const DEFAULT_HEIGHT = "clamp(8.25rem, 18vw, 13rem)";
const DEFAULT_GAP = "1rem";
const DEFAULT_SPEED = 52;
const REVEAL_KICKOFF_MS = 220;
const DRAG_THRESHOLD_PX = 6;

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

interface GalleryTileProps {
  image: ImageMarqueeItem;
  height: string;
  width?: string;
  aspectRatio: number;
  priority: boolean;
  itemClassName?: string;
  onTileClick?: (image: ImageMarqueeItem) => void;
}

function GalleryTile({
  image,
  height,
  width,
  aspectRatio,
  priority,
  itemClassName,
  onTileClick,
}: GalleryTileProps) {
  const [loaded, setLoaded] = useState(false);
  const imageSrc = image.src;

  if (!imageSrc) {
    return null;
  }

  const clickable = Boolean(onTileClick);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[0.5rem] transition-transform duration-300 ease-out group-hover:-translate-y-1",
        clickable && "cursor-zoom-in",
        itemClassName,
      )}
      style={{ aspectRatio, height, width }}
      onClick={
        clickable
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
              onTileClick?.(image);
            }
          : undefined
      }
    >
      <div
        className={cn(
          "absolute inset-0 transition-[opacity,filter] duration-[420ms] ease-out",
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-lg",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={image.alt ?? ""}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          draggable={false}
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] select-none pointer-events-none"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
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
  rowClassName,
  itemClassName,
  gridMode,
  onTileClick,
  draggable,
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
  const dragRef = useRef({
    pointerId: -1,
    active: false,
    moved: false,
    startX: 0,
    startOffset: 0,
  });
  const applyTransformRef = useRef<() => void>(() => {});
  const [segmentKeys, setSegmentKeys] = useState([0, 1]);

  const direction = row.direction ?? (rowIndex % 2 === 0 ? "left" : "right");
  const speed = row.speed ?? DEFAULT_SPEED + rowIndex * 8;
  const height = toCssValue(row.height, defaultHeight);
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
    applyTransformRef.current = applyTransform;

    const updateMetrics = () => {
      widthRef.current = segment.getBoundingClientRect().width;
      const containerWidth = container.getBoundingClientRect().width;

      if (widthRef.current > 0) {
        offsetRef.current = ((offsetRef.current % widthRef.current) + widthRef.current) % widthRef.current;
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
      } else if (dragRef.current.active) {
        // While dragging, leave offset untouched; pointer handlers apply transform directly.
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

  const wrapOffset = useCallback((next: number) => {
    const width = widthRef.current;
    if (!width) return 0;
    return ((next % width) + width) % width;
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggable) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        active: true,
        moved: false,
        startX: event.clientX,
        startOffset: offsetRef.current,
      };
      hoverRef.current = true;
    },
    [draggable],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggable) return;
      const state = dragRef.current;
      if (!state.active || event.pointerId !== state.pointerId) return;

      const deltaRaw = event.clientX - state.startX;
      if (!state.moved && Math.abs(deltaRaw) > DRAG_THRESHOLD_PX) {
        state.moved = true;
      }

      const directionSign = direction === "left" ? 1 : -1;
      offsetRef.current = wrapOffset(state.startOffset - deltaRaw * directionSign);
      applyTransformRef.current();
    },
    [direction, draggable, wrapOffset],
  );

  const releasePointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const state = dragRef.current;
      if (!state.active || event.pointerId !== state.pointerId) return;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* pointer may already be released */
      }
      state.active = false;
      hoverRef.current = false;
    },
    [],
  );

  const onClickCapture = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!draggable) return;
      if (dragRef.current.moved) {
        event.preventDefault();
        event.stopPropagation();
        dragRef.current.moved = false;
      }
    },
    [draggable],
  );

  if (!expandedSlots.length) {
    return null;
  }

  const isClient = type === "clients";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-transparent select-none",
        draggable && "touch-pan-y cursor-grab active:cursor-grabbing",
        rowClassName,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onClickCapture={onClickCapture}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {segmentKeys.map((segmentKey, segmentIndex) => (
          <div
            key={segmentKey}
            ref={segmentIndex === 0 ? segmentRef : undefined}
            aria-hidden={segmentIndex > 0}
            className="flex shrink-0 items-stretch"
            style={{ gap: itemGap, paddingInlineEnd: itemGap }}
          >
            {expandedSlots.map((slot, slotIndex) => {
              const isPriorityIndex =
                segmentIndex === 0 && rowIndex === 0 && slotIndex < 2;

              if (isClient && slot.kind === "single") {
                const image = slot.image;
                const aspectRatio = slot.aspectRatio;
                const clientLabel = image.alt ?? image.client ?? "";
                const ClientIcon = image.icon
                  ? CLIENT_ICON_REGISTRY[image.icon]
                  : undefined;
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
                    style={{
                      height,
                      width: image.src ? clientLogoWidth : undefined,
                    }}
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.src}
                          alt={clientLabel}
                          loading={
                            image.priority ?? isPriorityIndex ? "eager" : "lazy"
                          }
                          decoding="async"
                          fetchPriority={
                            image.priority ?? isPriorityIndex ? "high" : "auto"
                          }
                          draggable={false}
                          referrerPolicy="no-referrer-when-downgrade"
                          className="absolute inset-0 h-full w-full object-contain opacity-80 drop-shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out group-hover:scale-110 group-hover:opacity-100 select-none pointer-events-none"
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
                    className="group relative shrink-0 marquee-logo-reveal"
                    style={
                      {
                        "--marquee-logo-delay": `${180 + Math.min(slotIndex, 8) * 52}ms`,
                      } as CSSProperties
                    }
                    onPointerEnter={() => {
                      hoverRef.current = true;
                    }}
                    onPointerLeave={() => {
                      if (!dragRef.current.active) hoverRef.current = false;
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
                      if (!dragRef.current.active) hoverRef.current = false;
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
                      priority={isPriorityIndex}
                      itemClassName={itemClassName}
                      onTileClick={onTileClick}
                    />
                    <GalleryTile
                      image={bottomImage}
                      height={stackedTileHeight}
                      width="100%"
                      aspectRatio={resolveAspectRatio(bottomImage)}
                      priority={isPriorityIndex}
                      itemClassName={itemClassName}
                      onTileClick={onTileClick}
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
                    if (!dragRef.current.active) hoverRef.current = false;
                  }}
                >
                  <GalleryTile
                    image={image}
                    height={height}
                    aspectRatio={aspectRatio}
                    priority={image.priority ?? isPriorityIndex}
                    itemClassName={itemClassName}
                    onTileClick={onTileClick}
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

interface GalleryOverlayProps {
  images: ImageMarqueeItem[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}

function GalleryOverlay({
  images,
  index,
  onIndexChange,
  onClose,
}: GalleryOverlayProps) {
  const total = images.length;
  const safeIndex = Math.min(Math.max(index, 0), Math.max(total - 1, 0));
  const image = images[safeIndex];
  const dragRef = useRef<{ active: boolean; pointerId: number; startX: number; moved: boolean }>({
    active: false,
    pointerId: -1,
    startX: 0,
    moved: false,
  });

  const goPrev = useCallback(() => {
    if (total < 2) return;
    onIndexChange((safeIndex - 1 + total) % total);
  }, [onIndexChange, safeIndex, total]);

  const goNext = useCallback(() => {
    if (total < 2) return;
    onIndexChange((safeIndex + 1) % total);
  }, [onIndexChange, safeIndex, total]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") goPrev();
      else if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [goNext, goPrev, onClose]);

  useEffect(() => {
    if (total < 2) return;
    const adjacent = [
      images[(safeIndex + 1) % total],
      images[(safeIndex - 1 + total) % total],
    ];
    adjacent.forEach((adj) => {
      if (!adj?.src) return;
      const preload = new window.Image();
      preload.src = adj.src;
    });
  }, [images, safeIndex, total]);

  if (!image?.src) {
    return null;
  }

  const onStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onStagePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    if (!state.active || event.pointerId !== state.pointerId) return;
    if (Math.abs(event.clientX - state.startX) > DRAG_THRESHOLD_PX) {
      state.moved = true;
    }
  };

  const onStagePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    if (!state.active || event.pointerId !== state.pointerId) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    state.active = false;
    const delta = event.clientX - state.startX;
    if (Math.abs(delta) >= 40) {
      if (delta < 0) goNext();
      else goPrev();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt ?? image.title ?? "Image gallery"}
      className="marquee-lightbox fixed inset-0 z-[120] h-[100dvh] w-[100vw] overflow-hidden bg-black"
      onClick={onClose}
    >
      <div
        className="relative h-full w-full select-none touch-pan-y"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={onStagePointerUp}
        onPointerCancel={onStagePointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={image.src}
          src={image.src}
          alt={image.alt ?? ""}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          draggable={false}
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full select-none object-contain"
        />
      </div>

      <button
        type="button"
        aria-label="Close gallery"
        className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 sm:right-6 sm:top-6"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <span aria-hidden className="text-xl leading-none">×</span>
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            className="absolute left-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 sm:left-6 sm:h-14 sm:w-14"
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
          >
            <span aria-hidden className="text-2xl leading-none">‹</span>
          </button>
          <button
            type="button"
            aria-label="Next image"
            className="absolute right-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 sm:right-6 sm:h-14 sm:w-14"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
          >
            <span aria-hidden className="text-2xl leading-none">›</span>
          </button>

          <div
            className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur-md sm:bottom-7 sm:text-sm"
            aria-live="polite"
          >
            {safeIndex + 1} / {total}
          </div>
        </>
      )}
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
  arrangeAsGrid = false,
  revealOnLoad = false,
  draggable = false,
  enableLightbox = false,
}: ImageMarqueeProps) {
  const resolvedHeight = toCssValue(height, DEFAULT_HEIGHT);
  const resolvedRowGap = toCssValue(rowGap, DEFAULT_GAP);
  const resolvedItemGap = toCssValue(itemGap, DEFAULT_GAP);

  const gridMode = arrangeAsGrid && type === "gallery" && rows.length === 1;

  const [ready, setReady] = useState(() => !revealOnLoad);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const galleryImages = useMemo<ImageMarqueeItem[]>(() => {
    if (!enableLightbox || type !== "gallery") return [];
    const seen = new Set<string>();
    const flat: ImageMarqueeItem[] = [];
    for (const row of rows) {
      for (const image of row.images) {
        if (!image.src || seen.has(image.src)) continue;
        seen.add(image.src);
        flat.push(image);
      }
    }
    return flat;
  }, [enableLightbox, rows, type]);

  useEffect(() => {
    if (!revealOnLoad) return;

    // Kick off the reveal on a short skeleton-style timeout. This animates
    // all tiles at once without waiting for any image load — images keep
    // streaming in behind the same animation, then per-tile blur-up handles
    // any that arrive late.
    let frame = 0;
    const timer = window.setTimeout(() => {
      frame = window.requestAnimationFrame(() => setReady(true));
    }, REVEAL_KICKOFF_MS);

    return () => {
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [revealOnLoad]);

  const handleTileClick = useMemo(() => {
    if (!enableLightbox || type !== "gallery" || galleryImages.length === 0) {
      return undefined;
    }
    return (image: ImageMarqueeItem) => {
      if (!image.src) return;
      const idx = galleryImages.findIndex((entry) => entry.src === image.src);
      setGalleryIndex(idx === -1 ? 0 : idx);
    };
  }, [enableLightbox, galleryImages, type]);

  if (!rows.length) {
    return null;
  }

  return (
    <section
      className={cn(
        "image-marquee-edge-fade relative overflow-x-clip overflow-y-visible bg-transparent",
        fullBleed && "image-marquee-full-bleed",
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
            rowClassName={rowClassName}
            itemClassName={itemClassName}
            gridMode={gridMode}
            onTileClick={handleTileClick}
            draggable={draggable}
          />
        ))}
      </div>
      {galleryIndex !== null && galleryImages.length > 0 && (
        <GalleryOverlay
          images={galleryImages}
          index={galleryIndex}
          onIndexChange={setGalleryIndex}
          onClose={() => setGalleryIndex(null)}
        />
      )}
    </section>
  );
}
