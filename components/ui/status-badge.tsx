"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
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
  /**
   * Kept for content compatibility. Badges are neutral paper tags now, so the
   * stored tone no longer paints the chip; it is accepted and ignored.
   */
  tone?: string;
  textColor?: string;
  iconColor?: string;
  indicatorColor?: string;
}

const spring = { type: "spring", stiffness: 420, damping: 24, mass: 0.5 } as const;

export const StatusBadge = ({
  children,
  leading,
  className,
  contentClassName,
  compact = false,
  interactive = true,
  showIndicator = false,
  pulse = false,
}: StatusBadgeProps) => {
  const indicator = leading ?? (showIndicator ? <LiveIndicator pulse={pulse} /> : null);

  return (
    <motion.div
      className={cn(
        "inline-flex w-fit max-w-full select-none items-center justify-center bg-white text-text-primary",
        "shadow-[0_0_0_1px_rgba(var(--shade-rgb),0.1),0_2px_0_var(--paper-line)]",
        compact
          ? "gap-1.5 rounded-[0.6rem] px-2.5 py-1.5"
          : "gap-2 rounded-[0.7rem] px-3 py-2",
        className,
      )}
      whileHover={interactive ? { y: -2, rotate: -1.5 } : undefined}
      whileTap={interactive ? { y: 1 } : undefined}
      transition={spring}
    >
      {indicator ? (
        <span className="inline-flex shrink-0 items-center self-center text-accent">
          {indicator}
        </span>
      ) : null}

      <span
        className={cn(
          "whitespace-nowrap text-center font-semibold tracking-[-0.01em]",
          compact ? "text-[12px] leading-none" : "text-[12.5px] leading-none sm:text-[13px]",
          contentClassName,
        )}
      >
        {children}
      </span>
    </motion.div>
  );
};

const LiveIndicator = ({ pulse }: { pulse: boolean }) => (
  <span className="relative flex size-2.5 shrink-0">
    {pulse ? (
      <span
        aria-hidden
        className="absolute inset-0 animate-ping rounded-full bg-[#22c55e]/60"
      />
    ) : null}
    <span
      aria-hidden
      className="relative size-2.5 rounded-full bg-[#22c55e] shadow-[0_0_0_2px_rgba(34,197,94,0.22)]"
    />
  </span>
);
