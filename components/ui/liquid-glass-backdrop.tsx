"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { liquidGlassConfig, type LiquidGlassRefractionConfig } from "@/lib/liquid-glass";
import { cn } from "@/lib/utils";
import { LiquidGlassWebGL } from "@/components/ui/liquid-glass-webgl";

type LiquidGlassBackdropVariant = "header" | "shell";

type LiquidGlassBackdropProps = {
  className?: string;
  variant?: LiquidGlassBackdropVariant;
};

type LiquidGlassMap = {
  href: string;
  scale: number;
};

type ElementSize = {
  width: number;
  height: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const detectSvgFilterInBackdropSupport = (): boolean => {
  if (typeof window === "undefined" || typeof CSS === "undefined") {
    return true;
  }
  const ua = window.navigator.userAgent;
  const isSafari = /^((?!chrome|crios|fxios|android).)*safari/i.test(ua);
  if (isSafari) return false;
  try {
    return (
      CSS.supports("backdrop-filter", "url(#x)") ||
      CSS.supports("-webkit-backdrop-filter", "url(#x)")
    );
  } catch {
    return true;
  }
};

const smoothStep = (value: number) => value * value * (3 - 2 * value);

const roundedRectSdf = (
  x: number,
  y: number,
  halfWidth: number,
  halfHeight: number,
  radius: number
) => {
  const qx = Math.abs(x) - (halfWidth - radius);
  const qy = Math.abs(y) - (halfHeight - radius);

  return (
    Math.min(Math.max(qx, qy), 0) +
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) -
    radius
  );
};

const toChannel = (value: number, scale: number) =>
  clamp(Math.round(128 + (value / scale) * 127), 0, 255);

const createDisplacementMap = (
  width: number,
  height: number,
  config: LiquidGlassRefractionConfig
): LiquidGlassMap | null => {
  if (typeof document === "undefined" || width < 2 || height < 2) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);

  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const imageData = context.createImageData(canvas.width, canvas.height);
  const { data } = imageData;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const radius = Math.min(config.cornerRadius, halfWidth, halfHeight);
  const bezel = Math.max(1, Math.min(config.bezel, halfWidth, halfHeight));
  const scale = Math.max(0.01, config.displacement);
  const sampleDelta = 1;

  const sdfAt = (px: number, py: number) =>
    roundedRectSdf(px - halfWidth, py - halfHeight, halfWidth, halfHeight, radius);

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const sdf = sdfAt(px, py);
      const insideDistance = Math.max(0, -sdf);
      const edgeProgress = clamp(1 - insideDistance / bezel, 0, 1);

      let dx = 0;
      let dy = 0;

      if (edgeProgress > 0) {
        const gradientX =
          sdfAt(Math.min(width, px + sampleDelta), py) -
          sdfAt(Math.max(0, px - sampleDelta), py);
        const gradientY =
          sdfAt(px, Math.min(height, py + sampleDelta)) -
          sdfAt(px, Math.max(0, py - sampleDelta));
        const gradientLength = Math.hypot(gradientX, gradientY) || 1;
        const magnitude = smoothStep(edgeProgress) * scale;

        dx = -(gradientX / gradientLength) * magnitude;
        dy = -(gradientY / gradientLength) * magnitude;
      }

      const index = (y * canvas.width + x) * 4;
      data[index] = toChannel(dx, scale);
      data[index + 1] = toChannel(dy, scale);
      data[index + 2] = 128;
      data[index + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);

  return {
    href: canvas.toDataURL("image/png"),
    scale,
  };
};

const formatBackdropFilter = (
  filterId: string | null,
  config: LiquidGlassRefractionConfig
) => {
  const filters = [
    filterId ? `url(#${filterId})` : null,
    `blur(${config.blur}px)`,
    `contrast(${config.contrast})`,
    `brightness(${config.brightness})`,
    `saturate(${config.saturate})`,
  ].filter(Boolean);

  return filters.join(" ");
};

export function LiquidGlassBackdrop({
  className,
  variant = "header",
}: LiquidGlassBackdropProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ElementSize | null>(null);
  const [useWebGLFallback, setUseWebGLFallback] = useState(false);

  useEffect(() => {
    if (!detectSvgFilterInBackdropSupport()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time post-mount feature detection; starts false on server to avoid hydration mismatch
      setUseWebGLFallback(true);
    }
  }, []);
  const reactId = useId();
  const filterId = useMemo(
    () => `liquid-glass-${variant}-${reactId.replace(/:/g, "")}`,
    [reactId, variant]
  );
  const config = liquidGlassConfig.refraction[variant];
  const variantClassName =
    variant === "header" ? "liquid-glass-header" : "liquid-glass-shell";

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const syncSize = (nextWidth: number, nextHeight: number) => {
      const width = Math.max(1, Math.round(nextWidth));
      const height = Math.max(1, Math.round(nextHeight));

      setSize((currentSize) => {
        if (
          currentSize?.width === width &&
          currentSize?.height === height
        ) {
          return currentSize;
        }

        return { width, height };
      });
    };

    const initialRect = element.getBoundingClientRect();
    syncSize(initialRect.width, initialRect.height);

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      syncSize(entry.contentRect.width, entry.contentRect.height);
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  const displacementMap = useMemo(
    () =>
      size && !useWebGLFallback
        ? createDisplacementMap(size.width, size.height, config)
        : null,
    [config, size, useWebGLFallback]
  );

  const backdropFilter = useMemo(
    () => formatBackdropFilter(displacementMap ? filterId : null, config),
    [config, displacementMap, filterId]
  );

  return (
    <>
      {size && displacementMap && !useWebGLFallback ? (
        <svg
          aria-hidden
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        >
          <defs>
            <filter
              id={filterId}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
              x="0"
              y="0"
              width={size.width.toString()}
              height={size.height.toString()}
            >
              <feImage
                href={displacementMap.href}
                x="0"
                y="0"
                width={size.width.toString()}
                height={size.height.toString()}
                preserveAspectRatio="none"
                result={`${filterId}-map`}
              />
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result={`${filterId}-r`}
              />
              <feDisplacementMap
                in={`${filterId}-r`}
                in2={`${filterId}-map`}
                scale={displacementMap.scale * (1 + config.chromaticAberration)}
                xChannelSelector="R"
                yChannelSelector="G"
                result={`${filterId}-rd`}
              />
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result={`${filterId}-g`}
              />
              <feDisplacementMap
                in={`${filterId}-g`}
                in2={`${filterId}-map`}
                scale={displacementMap.scale}
                xChannelSelector="R"
                yChannelSelector="G"
                result={`${filterId}-gd`}
              />
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                result={`${filterId}-b`}
              />
              <feDisplacementMap
                in={`${filterId}-b`}
                in2={`${filterId}-map`}
                scale={displacementMap.scale * (1 - config.chromaticAberration)}
                xChannelSelector="R"
                yChannelSelector="G"
                result={`${filterId}-bd`}
              />
              <feBlend
                in={`${filterId}-rd`}
                in2={`${filterId}-gd`}
                mode="screen"
                result={`${filterId}-rg`}
              />
              <feBlend
                in={`${filterId}-rg`}
                in2={`${filterId}-bd`}
                mode="screen"
              />
            </filter>
          </defs>
        </svg>
      ) : null}

      <div
        ref={elementRef}
        aria-hidden
        data-glass-mode={useWebGLFallback ? "webgl" : undefined}
        className={cn(variantClassName, "pointer-events-none absolute inset-0", className)}
        style={{
          backdropFilter,
          WebkitBackdropFilter: formatBackdropFilter(null, config),
        }}
      >
        {useWebGLFallback ? <LiquidGlassWebGL variant={variant} /> : null}
      </div>
    </>
  );
}
