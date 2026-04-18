"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { createMetallicSurface } from "@/lib/metallic-surface";
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

const spring = { type: "spring", stiffness: 320, damping: 22, mass: 0.55 } as const;

export const StatusBadge = ({
  children,
  leading,
  className,
  contentClassName,
  compact = false,
  interactive = true,
  showIndicator = false,
  pulse = false,
  tone,
  textColor,
  iconColor,
  indicatorColor,
}: StatusBadgeProps) => {
  const theme = createMetallicSurface({ tone, textColor, iconColor, indicatorColor });

  const indicator =
    leading ??
    (showIndicator ? (
      <LiveIndicator pulse={pulse} color={theme.indicatorColor} pulseColor={theme.indicatorPulseColor} />
    ) : null);

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
