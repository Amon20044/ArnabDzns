"use client";

import { animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ImpactBreakdownSegment, ImpactChartPoint } from "@/types";
import { resolveImpactAccent } from "./impact-theme";

const ease = [0.22, 1, 0.36, 1] as const;

/* --------------------------------------------------------------------------
   CountUp — eases a numeric value from 0 to `value` when `isActive` is true.
   Formats with `format` so callers can show "120M+", "+18.4%", "3.2x".
   -------------------------------------------------------------------------- */

interface CountUpProps {
  value: number;
  /** Target pre-formatted display. Used as final frame to avoid float jitter. */
  display: string;
  isActive: boolean;
  duration?: number;
  /** Optional formatter for the in-flight numeric value. Defaults to rounding. */
  format?: (current: number, target: number) => string;
  className?: string;
}

export function CountUp({
  value,
  display,
  isActive,
  duration = 1.2,
  format,
  className,
}: CountUpProps) {
  const counter = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(() => format?.(0, value) ?? "0");

  useMotionValueEvent(counter, "change", (latest) => {
    if (Math.abs(latest - value) < 0.001) {
      setDisplayValue(display);
      return;
    }
    if (format) {
      setDisplayValue(format(latest, value));
      return;
    }
    // Mirror display precision — if target has a decimal, show one; else integer.
    const hasDecimal = Math.abs(value % 1) > 0;
    setDisplayValue(
      hasDecimal ? latest.toFixed(1) : Math.round(latest).toLocaleString(),
    );
  });

  useEffect(() => {
    if (!isActive) {
      counter.set(0);
      return;
    }
    const controls = animate(counter, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [counter, duration, isActive, value]);

  return <span className={className}>{displayValue}</span>;
}

/* --------------------------------------------------------------------------
   Sparkline — draws an animated SVG path + optional area fill. Accents
   follow the card's accent tokens.
   -------------------------------------------------------------------------- */

interface SparklineProps {
  points: ImpactChartPoint[];
  accent: string;
  isActive: boolean;
  className?: string;
  fill?: boolean;
  strokeWidth?: number;
  height?: number;
}

export function Sparkline({
  points,
  accent,
  isActive,
  className,
  fill = true,
  strokeWidth = 2,
  height = 56,
}: SparklineProps) {
  const tokens = resolveImpactAccent(accent);
  const gradientId = useId().replace(/:/g, "");

  const geometry = useMemo(() => {
    if (points.length === 0) {
      return { path: "", area: "", width: 100 };
    }
    const width = 100;
    const max = Math.max(...points.map((p) => p.value));
    const min = Math.min(...points.map((p) => p.value));
    const range = max - min || 1;
    const step = width / Math.max(1, points.length - 1);

    const coords = points.map((point, index) => {
      const x = index * step;
      const y = height - ((point.value - min) / range) * (height - strokeWidth * 2) - strokeWidth;
      return [x, y] as const;
    });

    const path = coords
      .map(([x, y], index) => (index === 0 ? `M${x},${y}` : `L${x},${y}`))
      .join(" ");

    const area = `${path} L${width},${height} L0,${height} Z`;

    return { path, area, width };
  }, [height, points, strokeWidth]);

  return (
    <svg
      viewBox={`0 0 ${geometry.width} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tokens.solid} stopOpacity="0.42" />
          <stop offset="100%" stopColor={tokens.solid} stopOpacity="0" />
        </linearGradient>
      </defs>

      {fill ? (
        <motion.path
          d={geometry.area}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 1 : 0 }}
          transition={{ duration: 0.9, ease, delay: 0.3 }}
        />
      ) : null}

      <motion.path
        d={geometry.path}
        fill="none"
        stroke={tokens.foreground}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isActive ? 1 : 0 }}
        transition={{ duration: 1.1, ease, delay: 0.15 }}
        style={{ filter: `drop-shadow(0 0 6px ${tokens.soft})` }}
      />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   Bars — horizontal or vertical, animates height-in with staggered delay.
   -------------------------------------------------------------------------- */

interface BarsProps {
  points: ImpactChartPoint[];
  accent: string;
  isActive: boolean;
  orientation?: "vertical" | "horizontal";
  showLabels?: boolean;
  max?: number;
  className?: string;
}

export function Bars({
  points,
  accent,
  isActive,
  orientation = "vertical",
  showLabels = true,
  max,
  className,
}: BarsProps) {
  const tokens = resolveImpactAccent(accent);
  const maxValue = max ?? Math.max(...points.map((p) => p.value), 1);

  if (orientation === "horizontal") {
    return (
      <div className={cn("flex w-full flex-col gap-2", className)}>
        {points.map((point, index) => {
          const ratio = Math.min(1, point.value / maxValue);
          return (
            <div key={`${point.label ?? index}`} className="flex items-center gap-3">
              {showLabels ? (
                <span className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary/78">
                  {point.label}
                </span>
              ) : null}
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-black/[0.08]">
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${tokens.solid} 0%, ${tokens.foreground} 100%)`,
                    boxShadow: `0 0 12px ${tokens.soft}`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: isActive ? `${ratio * 100}%` : 0 }}
                  transition={{ duration: 0.85, ease, delay: 0.08 * index }}
                />
              </div>
              {showLabels ? (
                <span className="w-10 shrink-0 text-right text-[11px] font-semibold tabular-nums text-text-primary">
                  {point.value}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex h-full w-full items-end justify-between gap-2", className)}>
      {points.map((point, index) => {
        const ratio = Math.min(1, point.value / maxValue);
        return (
          <div key={`${point.label ?? index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <motion.span
              className="w-full rounded-t-md"
              style={{
                background: `linear-gradient(180deg, ${tokens.foreground} 0%, ${tokens.solid} 100%)`,
                boxShadow: `0 0 14px ${tokens.soft}`,
              }}
              initial={{ height: 0 }}
              animate={{ height: isActive ? `${Math.max(6, ratio * 100)}%` : 0 }}
              transition={{ duration: 0.8, ease, delay: 0.06 * index }}
            />
            {showLabels && point.label ? (
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-secondary/78">
                {point.label}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------------------
   BreakdownBar — single segmented stacked bar with animated width per segment.
   -------------------------------------------------------------------------- */

interface BreakdownBarProps {
  segments: ImpactBreakdownSegment[];
  isActive: boolean;
  className?: string;
}

export function BreakdownBar({ segments, isActive, className }: BreakdownBarProps) {
  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div className="relative flex h-3 w-full overflow-hidden rounded-full bg-black/[0.08]">
        {segments.map((segment, index) => {
          const tokens = resolveImpactAccent(segment.accent ?? "violet");
          return (
            <motion.span
              key={segment.id}
              className="h-full"
              style={{
                background: `linear-gradient(90deg, ${tokens.solid} 0%, ${tokens.foreground} 100%)`,
              }}
              initial={{ width: 0 }}
              animate={{ width: isActive ? `${segment.share}%` : 0 }}
              transition={{ duration: 0.85, ease, delay: 0.08 * index }}
            />
          );
        })}
      </div>

      <ul className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((segment, index) => {
          const tokens = resolveImpactAccent(segment.accent ?? "violet");
          return (
            <motion.li
              key={segment.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 6 }}
              transition={{ duration: 0.4, ease, delay: 0.12 + 0.05 * index }}
              className="flex items-center gap-2 text-[12px] text-text-secondary"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: tokens.solid, boxShadow: `0 0 10px ${tokens.soft}` }}
              />
              <span className="flex-1 truncate">{segment.label}</span>
              <span className="font-semibold tabular-nums text-text-primary">{segment.share}%</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/* --------------------------------------------------------------------------
   BeforeAfterBar — two side-by-side growing bars with numeric callouts.
   Red → green accent ramp to signal the direction of change.
   -------------------------------------------------------------------------- */

interface BeforeAfterBarProps {
  baseline: { label: string; value: number; display: string };
  current: { label: string; value: number; display: string };
  multiplier?: string;
  isActive: boolean;
  className?: string;
}

export function BeforeAfterBar({
  baseline,
  current,
  multiplier,
  isActive,
  className,
}: BeforeAfterBarProps) {
  const max = Math.max(baseline.value, current.value) || 1;
  const baselineRatio = baseline.value / max;
  const currentRatio = current.value / max;

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/78">
            {baseline.label}
          </span>
          <div className="relative h-24 w-full overflow-hidden rounded-[1rem] bg-black/[0.06]">
            <motion.span
              className="absolute inset-x-0 bottom-0 rounded-t-[1rem]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(251,113,133,0.9) 0%, rgba(190,18,60,0.9) 100%)",
                boxShadow: "0 0 18px rgba(244,63,94,0.28)",
              }}
              initial={{ height: 0 }}
              animate={{ height: isActive ? `${Math.max(10, baselineRatio * 100)}%` : 0 }}
              transition={{ duration: 0.75, ease, delay: 0.1 }}
            />
          </div>
          <span className="text-sm font-semibold text-text-primary">{baseline.display}</span>
        </div>

        <div className="flex flex-col items-center gap-1 pb-10">
          {multiplier ? (
            <motion.span
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.9 }}
              transition={{ duration: 0.5, ease, delay: 0.9 }}
            >
              {multiplier}
            </motion.span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/78">
            {current.label}
          </span>
          <div className="relative h-24 w-full overflow-hidden rounded-[1rem] bg-black/[0.06]">
            <motion.span
              className="absolute inset-x-0 bottom-0 rounded-t-[1rem]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(110,231,183,0.95) 0%, rgba(5,150,105,0.95) 100%)",
                boxShadow: "0 0 22px rgba(16,185,129,0.35)",
              }}
              initial={{ height: 0 }}
              animate={{ height: isActive ? `${Math.max(12, currentRatio * 100)}%` : 0 }}
              transition={{ duration: 0.85, ease, delay: 0.35 }}
            />
          </div>
          <span className="text-sm font-semibold text-text-primary">{current.display}</span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   TrendChip — tiny up/down % badge using the card accent.
   Intentionally not StatusBadge because StatusBadge is a richer rounded chip
   used for hero/section intros; a small inline trend reads cleaner here.
   -------------------------------------------------------------------------- */

interface TrendChipProps {
  display: string;
  direction: "up" | "down" | "flat";
  className?: string;
}

export function TrendChip({ display, direction, className }: TrendChipProps) {
  const tone =
    direction === "up"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : direction === "down"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-border-accent/70 bg-white/76 text-text-secondary";

  const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums",
        tone,
        className,
      )}
    >
      <span aria-hidden>{arrow}</span>
      {display}
    </span>
  );
}
