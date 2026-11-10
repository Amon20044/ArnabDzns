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

/** Where the measured data ends; the rest of the width is the projection. */
const DATA_END_X = 86;

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
      return { line: "", projection: "", area: "", end: null as null | { x: number; y: number } };
    }

    const max = Math.max(...points.map((p) => p.value));
    const min = Math.min(...points.map((p) => p.value));
    const range = max - min || 1;
    const step = DATA_END_X / Math.max(1, points.length - 1);

    // Headroom so the peak and the end marker never touch the top edge.
    const top = height * 0.16;
    const usable = height * 0.72;

    const coords = points.map((point, index) => ({
      x: index * step,
      y: top + (1 - (point.value - min) / range) * usable,
    }));

    // Smooth curve through the points. Control points are clamped between
    // their neighbours so the line never overshoots the data.
    let line = `M${coords[0].x},${coords[0].y}`;

    for (let index = 0; index < coords.length - 1; index += 1) {
      const previous = coords[index - 1] ?? coords[index];
      const current = coords[index];
      const next = coords[index + 1];
      const afterNext = coords[index + 2] ?? next;
      const low = Math.min(current.y, next.y);
      const high = Math.max(current.y, next.y);
      const clampY = (value: number) => Math.min(high, Math.max(low, value));

      const c1x = current.x + (next.x - previous.x) / 6;
      const c1y = clampY(current.y + (next.y - previous.y) / 6);
      const c2x = next.x - (afterNext.x - current.x) / 6;
      const c2y = clampY(next.y - (afterNext.y - current.y) / 6);

      line += ` C${c1x},${c1y} ${c2x},${c2y} ${next.x},${next.y}`;
    }

    // Projection: carry the closing trend on to the right edge, flattened a
    // little, so the chart can bleed off the card without a hard stop.
    const end = coords[coords.length - 1];
    const beforeEnd = coords[coords.length - 2] ?? end;
    const slope = step > 0 ? (end.y - beforeEnd.y) / step : 0;
    const projectedY = Math.min(
      height - 2,
      Math.max(height * 0.06, end.y + slope * (100 - end.x) * 0.55),
    );
    const bend = `Q${(end.x + 100) / 2},${(end.y + projectedY) / 2 - 0.5} 100,${projectedY}`;
    const projection = `M${end.x},${end.y} ${bend}`;
    const area = `${line} ${bend} L100,${height} L0,${height} Z`;

    return { line, projection, area, end };
  }, [height, points]);

  return (
    <div className={cn("relative h-full w-full", className)} aria-hidden>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ clipPath: isActive ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)" }}
        transition={{ duration: 1.2, ease, delay: 0.1 }}
      >
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tokens.solid} stopOpacity="0.3" />
              <stop offset="60%" stopColor={tokens.solid} stopOpacity="0.08" />
              <stop offset="100%" stopColor={tokens.solid} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* guide lines */}
          {[0.3, 0.55, 0.8].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              x2="100"
              y1={height * ratio}
              y2={height * ratio}
              stroke="rgb(44 30 72)"
              strokeOpacity="0.09"
              strokeWidth="1"
              strokeDasharray="2 5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {fill ? <path d={geometry.area} fill={`url(#${gradientId})`} /> : null}

          {/* The stroke stays a true hairline even though the chart stretches. */}
          <path
            d={geometry.projection}
            fill="none"
            stroke={tokens.solid}
            strokeOpacity="0.55"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="1 6"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={geometry.line}
            fill="none"
            stroke={tokens.solid}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </motion.div>

      {/* End marker: an HTML dot, so it stays round on a stretched chart. */}
      {geometry.end ? (
        <motion.span
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${geometry.end.x}%`,
            top: `${(geometry.end.y / height) * 100}%`,
          }}
          initial={false}
          animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.4 }}
          transition={{ type: "spring", stiffness: 380, damping: 20, delay: isActive ? 1.05 : 0 }}
        >
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-60"
            style={{ backgroundColor: tokens.solid }}
          />
          <span
            className="absolute inset-0 rounded-full shadow-[0_0_0_3px_#fff]"
            style={{ backgroundColor: tokens.solid }}
          />
        </motion.span>
      ) : null}
    </div>
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
      ? "border-purple-200 bg-purple-50 text-purple-700"
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
