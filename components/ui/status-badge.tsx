"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  children: ReactNode;
  leading?: ReactNode;
  className?: string;
  contentClassName?: string;
  compact?: boolean;
  interactive?: boolean;
  showIndicator?: boolean;
  pulse?: boolean;
  tone?: string;
  textColor?: string;
  iconColor?: string;
  indicatorColor?: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

const spring = { type: "spring", stiffness: 320, damping: 22, mass: 0.55 } as const;
const defaultTone = "#a855f7";
const white = { r: 255, g: 255, b: 255 };
const black = { r: 9, g: 9, b: 11 };
const nearBlack = { r: 18, g: 18, b: 22 };

export const StatusBadge = ({
  children,
  leading,
  className,
  contentClassName,
  compact = false,
  interactive = true,
  showIndicator = false,
  pulse = false,
  tone = defaultTone,
  textColor,
  iconColor,
  indicatorColor,
}: StatusBadgeProps) => {
  const theme = createStatusBadgeTheme({
    tone,
    textColor,
    iconColor,
    indicatorColor,
  });

  const indicator = leading ?? (
    showIndicator ? (
      <LiveIndicator pulse={pulse} color={theme.indicatorColor} pulseColor={theme.indicatorPulseColor} />
    ) : null
  );

  return (
    <motion.div
      className={cn(
        "group relative inline-flex w-fit items-center overflow-hidden rounded-full select-none",
        compact ? "gap-2 px-3.5 py-[7px]" : "gap-2.5 px-4 py-2.5",
        className,
      )}
      whileHover={interactive ? { y: -2, scale: 1.03 } : undefined}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      transition={spring}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={theme.surfaceStyle}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-px rounded-full opacity-70 transition-opacity duration-300 group-hover:opacity-95"
        style={theme.glowStyle}
      />

      {indicator ? (
        <span
          className="relative z-10 inline-flex shrink-0"
          style={{ color: theme.iconColor }}
        >
          {indicator}
        </span>
      ) : null}

      <span
        className={cn(
          "relative z-10 whitespace-nowrap font-semibold tracking-tight",
          compact ? "text-[12.5px] leading-none" : "text-[13px]",
          contentClassName,
        )}
        style={{ color: theme.textColor }}
      >
        {children}
      </span>
    </motion.div>
  );
};

const LiveIndicator = ({
  pulse,
  color,
  pulseColor,
}: {
  pulse: boolean;
  color: string;
  pulseColor: string;
}) => (
  <span className="relative flex size-2.5 shrink-0">
    {pulse ? (
      <span
        aria-hidden
        className="absolute inset-0 rounded-full animate-ping"
        style={{ backgroundColor: pulseColor }}
      />
    ) : null}
    <span
      aria-hidden
      className="relative size-2.5 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.18)]"
      style={{ backgroundColor: color }}
    />
  </span>
);

const createStatusBadgeTheme = ({
  tone,
  textColor,
  iconColor,
  indicatorColor,
}: {
  tone: string;
  textColor?: string;
  iconColor?: string;
  indicatorColor?: string;
}) => {
  const base = parseColor(tone) ?? parseColor(defaultTone) ?? { r: 168, g: 85, b: 247 };
  const surfaceStart = mix(base, black, 0.8);
  const surfaceEnd = mix(base, nearBlack, 0.56);
  const averageSurface = mix(surfaceStart, surfaceEnd, 0.5);
  const autoText = pickContrastColor(averageSurface);
  const resolvedTextColor = textColor ?? autoText;
  const resolvedIconColor = iconColor ?? resolvedTextColor;
  const resolvedIndicator = indicatorColor ?? rgbToString(mix(base, white, 0.16));
  const parsedIndicator = parseColor(resolvedIndicator) ?? mix(base, white, 0.16);
  const pulseColor = rgbaString(parsedIndicator, 0.38);

  const surfaceStyle: CSSProperties = {
    background: `linear-gradient(135deg, ${rgbaString(surfaceStart, 0.93)} 0%, ${rgbaString(surfaceEnd, 0.88)} 100%)`,
    border: `1px solid ${rgbaString(mix(base, white, 0.28), 0.38)}`,
    boxShadow: [
      "inset 1px 1px 0 rgba(255,255,255,0.18)",
      `inset 0 0 14px ${rgbaString(base, 0.22)}`,
      `0 4px 20px ${rgbaString(mix(base, black, 0.48), 0.25)}`,
      "0 1px 3px rgba(0,0,0,0.15)",
    ].join(", "),
    backdropFilter: "brightness(0.88) blur(12px) saturate(1.5) url(#lg-distort)",
    WebkitBackdropFilter: "brightness(0.88) blur(12px) saturate(1.5)",
  };

  const glowStyle: CSSProperties = {
    background: `radial-gradient(circle at 20% 18%, ${rgbaString(mix(base, white, 0.52), 0.72)} 0%, ${rgbaString(mix(base, white, 0.18), 0.28)} 34%, ${rgbaString(mix(base, black, 0.34), 0.1)} 60%, transparent 82%)`,
  };

  return {
    surfaceStyle,
    glowStyle,
    textColor: resolvedTextColor,
    iconColor: resolvedIconColor,
    indicatorColor: resolvedIndicator,
    indicatorPulseColor: pulseColor,
  };
};

const parseColor = (input: string): RGB | null => {
  const value = input.trim().toLowerCase();

  if (value.startsWith("#")) {
    return parseHexColor(value);
  }

  if (value.startsWith("rgb")) {
    return parseRgbColor(value);
  }

  if (value.startsWith("hsl")) {
    return parseHslColor(value);
  }

  return null;
};

const parseHexColor = (value: string): RGB | null => {
  const hex = value.slice(1);

  if (hex.length === 3 || hex.length === 4) {
    const [r, g, b] = hex.split("").map((channel) => channel + channel);
    return {
      r: Number.parseInt(r, 16),
      g: Number.parseInt(g, 16),
      b: Number.parseInt(b, 16),
    };
  }

  if (hex.length === 6 || hex.length === 8) {
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
};

const parseRgbColor = (value: string): RGB | null => {
  const match = value.match(/rgba?\((.*)\)/);

  if (!match) {
    return null;
  }

  const parts = normalizeFunctionParts(match[1]);

  if (parts.length < 3) {
    return null;
  }

  return {
    r: parseRgbChannel(parts[0]),
    g: parseRgbChannel(parts[1]),
    b: parseRgbChannel(parts[2]),
  };
};

const parseHslColor = (value: string): RGB | null => {
  const match = value.match(/hsla?\((.*)\)/);

  if (!match) {
    return null;
  }

  const parts = normalizeFunctionParts(match[1]);

  if (parts.length < 3) {
    return null;
  }

  const h = normalizeHue(Number.parseFloat(parts[0]));
  const s = clamp(Number.parseFloat(parts[1]) / 100, 0, 1);
  const l = clamp(Number.parseFloat(parts[2]) / 100, 0, 1);

  return hslToRgb(h, s, l);
};

const normalizeFunctionParts = (value: string) =>
  value
    .replace(/\//g, " ")
    .replace(/,/g, " ")
    .trim()
    .split(/\s+/);

const parseRgbChannel = (value: string) => {
  if (value.endsWith("%")) {
    return clamp(Math.round((Number.parseFloat(value) / 100) * 255), 0, 255);
  }

  return clamp(Math.round(Number.parseFloat(value)), 0, 255);
};

const hslToRgb = (h: number, s: number, l: number): RGB => {
  if (s === 0) {
    const grayscale = Math.round(l * 255);
    return { r: grayscale, g: grayscale, b: grayscale };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hueToChannel(p, q, h + 1 / 3) * 255),
    g: Math.round(hueToChannel(p, q, h) * 255),
    b: Math.round(hueToChannel(p, q, h - 1 / 3) * 255),
  };
};

const hueToChannel = (p: number, q: number, t: number) => {
  let channel = t;

  if (channel < 0) {
    channel += 1;
  }

  if (channel > 1) {
    channel -= 1;
  }

  if (channel < 1 / 6) {
    return p + (q - p) * 6 * channel;
  }

  if (channel < 1 / 2) {
    return q;
  }

  if (channel < 2 / 3) {
    return p + (q - p) * (2 / 3 - channel) * 6;
  }

  return p;
};

const normalizeHue = (value: number) => {
  const hue = value % 360;
  return (hue < 0 ? hue + 360 : hue) / 360;
};

const mix = (from: RGB, to: RGB, amount: number): RGB => ({
  r: Math.round(from.r + (to.r - from.r) * amount),
  g: Math.round(from.g + (to.g - from.g) * amount),
  b: Math.round(from.b + (to.b - from.b) * amount),
});

const rgbaString = (rgb: RGB, alpha: number) =>
  `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp(alpha, 0, 1)})`;

const rgbToString = (rgb: RGB) => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

const pickContrastColor = (background: RGB) => {
  const whiteContrast = contrastRatio(background, white);
  const blackContrast = contrastRatio(background, black);

  return whiteContrast >= blackContrast ? rgbToString(white) : rgbToString(black);
};

const contrastRatio = (first: RGB, second: RGB) => {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));

  return (lighter + 0.05) / (darker + 0.05);
};

const relativeLuminance = ({ r, g, b }: RGB) => {
  const transform = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
