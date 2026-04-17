"use client";

import { useEffect, useMemo, useRef } from "react";
import { createMetallicSurface } from "@/lib/metallic-surface";
import { cn } from "@/lib/utils";

export interface ServiceItem {
  id?: string;
  label: string;
  tone?: string;
}

interface ServiceMarqueeProps {
  services: ServiceItem[];
  speed?: number;
  direction?: "left" | "right";
  className?: string;
  minItems?: number;
}

const DEFAULT_SPEED = 35;

function expandItems<T>(items: T[], minimum: number): T[] {
  if (!items.length) return [];
  const copies = Math.ceil(minimum / items.length);
  const expanded: T[] = [];
  for (let i = 0; i < copies; i++) expanded.push(...items);
  return expanded;
}

function ServiceChip({ service }: { service: ServiceItem }) {
  const theme = createMetallicSurface({
    tone: "#ffffff",
    textColor: "transparent",
  });

  return (
    <div
      className="group relative inline-flex w-fit shrink-0 items-center overflow-hidden rounded-full px-5 py-2.5 select-none"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,240,255,0.85) 100%)",
          border: "1px solid rgba(168,85,247,0.15)",
          boxShadow: [
            "inset 1px 1px 0 rgba(255,255,255,0.9)",
            "0 2px 8px rgba(168,85,247,0.06)",
          ].join(", "),
          backdropFilter: theme.surfaceStyle.backdropFilter,
          WebkitBackdropFilter: theme.surfaceStyle.WebkitBackdropFilter,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-px rounded-full opacity-60"
        style={theme.glowStyle}
      />
      <span
        className="relative z-10 whitespace-nowrap bg-gradient-to-r from-purple-700 via-purple-500 to-purple-400 bg-clip-text text-[13px] font-semibold tracking-tight text-transparent"
      >
        {service.label}
      </span>
    </div>
  );
}

export function ServiceMarquee({
  services,
  speed = DEFAULT_SPEED,
  direction = "left",
  className,
  minItems = 16,
}: ServiceMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const segmentRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const widthRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const items = useMemo(() => expandItems(services, minItems), [services, minItems]);

  useEffect(() => {
    const track = trackRef.current;
    const segment = segmentRef.current;
    if (!track || !segment || !items.length) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let previousTime = 0;

    const applyTransform = () => {
      if (!widthRef.current) {
        track.style.transform = "translate3d(0px, 0px, 0px)";
        return;
      }
      const translateX = direction === "left"
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
      if (!previousTime) previousTime = time;
      const deltaSeconds = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      if (mediaQuery.matches || widthRef.current === 0) {
        track.style.transform = "translate3d(0px, 0px, 0px)";
      } else {
        offsetRef.current += speed * deltaSeconds;
        if (offsetRef.current >= widthRef.current) {
          offsetRef.current %= widthRef.current;
        }
        applyTransform();
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(segment);
    updateWidth();

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [direction, items.length, speed]);

  if (!items.length) return null;

  return (
    <div
      className={cn(
        "relative left-1/2 w-screen -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {[0, 1].map((segmentIndex) => (
          <div
            key={segmentIndex}
            ref={segmentIndex === 0 ? segmentRef : undefined}
            aria-hidden={segmentIndex === 1}
            className="flex shrink-0 items-center gap-3 px-1.5"
          >
            {items.map((service, i) => (
              <ServiceChip
                key={`${service.id ?? service.label}-${segmentIndex}-${i}`}
                service={service}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
