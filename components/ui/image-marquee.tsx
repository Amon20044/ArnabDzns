"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

export type ImageMarqueeDirection = "left" | "right";

export interface ImageMarqueeItem {
  id?: string;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  priority?: boolean;
  /** Client / brand name (used when type="clients") */
  client?: string;
  /** Link to client website or relevant page */
  link?: string;
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
}

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
}

const DEFAULT_ASPECT_RATIO = 16 / 9;
const DEFAULT_HEIGHT = "clamp(8.25rem, 18vw, 13rem)";
const DEFAULT_GAP = "1rem";
const DEFAULT_SPEED = 52;
const DEFAULT_IMAGE_SIZES = "(max-width: 640px) 72vw, (max-width: 1024px) 40vw, 24vw";

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

  if (typeof image.width === "number" && typeof image.height === "number" && image.height > 0) {
    return image.width / image.height;
  }

  return DEFAULT_ASPECT_RATIO;
}

function expandImages(images: ImageMarqueeItem[], minimumItems: number) {
  if (!images.length) {
    return [];
  }

  // Always expand to at least minimumItems, rounding up to a full multiple of source length
  // so the loop is seamless (no partial set at the boundary)
  const targetLength = Math.max(minimumItems, images.length);
  const copies = Math.ceil(targetLength / images.length);
  const expanded: ImageMarqueeItem[] = [];

  for (let i = 0; i < copies; i++) {
    expanded.push(...images);
  }

  return expanded;
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
}: MarqueeRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const segmentRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const offsetRef = useRef(0);
  const widthRef = useRef(0);
  const speedScaleRef = useRef(1);
  const frameRef = useRef<number | null>(null);

  const direction = row.direction ?? (rowIndex % 2 === 0 ? "left" : "right");
  const speed = row.speed ?? DEFAULT_SPEED + rowIndex * 8;
  const height = toCssValue(row.height, defaultHeight);
  const edgePadding = `calc(${itemGap} / 2)`;
  const images = useMemo(
    () => expandImages(row.images, minItemsPerRow),
    [minItemsPerRow, row.images],
  );

  useEffect(() => {
    const track = trackRef.current;
    const segment = segmentRef.current;

    if (!track || !segment || !images.length) {
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

    const updateWidth = () => {
      widthRef.current = segment.getBoundingClientRect().width;

      if (widthRef.current > 0) {
        offsetRef.current %= widthRef.current;
      } else {
        offsetRef.current = 0;
      }

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

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(segment);
    updateWidth();

    mediaQuery.addEventListener("change", handleMotionChange);
    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      mediaQuery.removeEventListener("change", handleMotionChange);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [direction, hoverSlowdownFactor, images.length, speed]);

  if (!images.length) {
    return null;
  }

  return (
    <div className={cn("overflow-hidden py-2 bg-transparent", rowClassName)}>
      <div ref={trackRef} className="flex w-max will-change-transform">
        {[0, 1].map((segmentIndex) => (
          <div
            key={segmentIndex}
            ref={segmentIndex === 0 ? segmentRef : undefined}
            aria-hidden={segmentIndex === 1}
            className="flex shrink-0"
            style={{ gap: itemGap, paddingInline: edgePadding }}
          >
            {images.map((image, imageIndex) => {
              const aspectRatio = resolveAspectRatio(image);
              const isClient = type === "clients";

              const inner = isClient ? (
                <div
                  className={cn(
                    "relative flex items-center justify-center",
                    itemClassName,
                  )}
                  style={{ height }}
                >
                  <Image
                    src={image.src}
                    alt={image.alt ?? image.client ?? ""}
                    width={image.width ?? 160}
                    height={image.height ?? 48}
                    sizes={imageSizes}
                    priority={image.priority ?? (segmentIndex === 0 && rowIndex === 0 && imageIndex < 2)}
                    className="h-full w-auto object-contain brightness-0 opacity-40 transition-all duration-400 ease-out hover:brightness-100 hover:opacity-100"
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    "relative overflow-hidden rounded-[0.5rem] transition-transform duration-300 ease-out group-hover:-translate-y-1",
                    itemClassName,
                  )}
                  style={{ aspectRatio, height }}
                >
                  <Image
                    src={image.src}
                    alt={image.alt ?? ""}
                    fill
                    sizes={imageSizes}
                    priority={image.priority ?? (segmentIndex === 0 && rowIndex === 0 && imageIndex < 2)}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                  />
                </div>
              );

              return (
                <article
                  key={`${image.id ?? image.src}-${segmentIndex}-${imageIndex}`}
                  className="group relative shrink-0"
                  onPointerEnter={() => {
                    hoverRef.current = true;
                  }}
                  onPointerLeave={() => {
                    hoverRef.current = false;
                  }}
                >
                  {isClient && image.link ? (
                    <a
                      href={image.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={image.client}
                    >
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
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
  fullBleed = true,
  hoverSlowdownFactor = 0.28,
  minItemsPerRow = 8,
  imageSizes = DEFAULT_IMAGE_SIZES,
}: ImageMarqueeProps) {
  const resolvedHeight = toCssValue(height, DEFAULT_HEIGHT);
  const resolvedRowGap = toCssValue(rowGap, DEFAULT_GAP);
  const resolvedItemGap = toCssValue(itemGap, DEFAULT_GAP);

  if (!rows.length) {
    return null;
  }

  return (
    <section
      className={cn(
        "overflow-hidden bg-transparent py-2 [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]",
        fullBleed && "relative left-1/2 w-screen -translate-x-1/2",
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
          />
        ))}
      </div>
    </section>
  );
}
