"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

type PrimaryButtonSize = "default" | "compact";

interface PrimaryButtonProps {
  label: string;
  href: string;
  Icon?: LucideIcon;
  external?: boolean;
  className?: string;
  size?: PrimaryButtonSize;
}

const ease = [0.22, 1, 0.36, 1] as const;
const spring = { type: "spring", stiffness: 280, damping: 18, mass: 0.6 } as const;
const shimmerMotion = {
  originX: "-42%",
  originY: "0%",
  width: "40%",
  height: "376%",
  startX: "-24%",
  startY: "0%",
  endX: "460%",
  endY: "40%",
} as const;

export const PrimaryButton = ({
  label,
  href,
  Icon,
  external = false,
  className,
  size = "default",
}: PrimaryButtonProps) => {
  const [hovered, setHovered] = useState(false);
  const isCompact = size === "compact";
  const showLeadingIcon = !isCompact || hovered;
  const showLabel = true;
  const showBalanceSlot = !!Icon && hovered;
  const iconSlotWidth = isCompact ? 18 : 22;
  const iconGap = isCompact ? 7 : 10;
  const iconStrokeWidth = isCompact ? 2.1 : 2.25;
  const labelColorClass = "text-white";

  const leadingIcon = Icon ? (
    <motion.span
      aria-hidden
      className={cn(
        "relative z-10 inline-flex items-center overflow-hidden",
        labelColorClass
      )}
      initial={false}
      animate={{
        maxWidth: showLeadingIcon ? iconSlotWidth : 0,
        opacity: showLeadingIcon ? 1 : 0,
        marginRight: showLabel ? iconGap : 0,
        x: showLeadingIcon ? 0 : -6,
      }}
      transition={{ duration: 0.38, ease }}
    >
      <Icon
        className={cn("shrink-0", isCompact ? "size-4" : "size-[17px]")}
        strokeWidth={iconStrokeWidth}
      />
    </motion.span>
  ) : null;

  const balanceSlot = Icon ? (
    <motion.span
      aria-hidden
      className="pointer-events-none inline-flex overflow-hidden opacity-0"
      initial={false}
      animate={{
        maxWidth: showBalanceSlot ? iconSlotWidth : 0,
        marginLeft: showBalanceSlot ? iconGap : 0,
      }}
      transition={{ duration: 0.38, ease }}
    >
      <span className={cn("block shrink-0", isCompact ? "size-4" : "size-[17px]")} />
    </motion.span>
  ) : null;

  const linkClassName = cn(
    "primary-button group relative inline-flex items-center justify-center overflow-hidden rounded-full select-none",
    "will-change-transform",
    isCompact
      ? "px-[18px] py-[8px] text-[13px] font-semibold leading-none"
      : "px-8 py-[18px] text-[15px] font-semibold text-white",
  );

  const surfaceOpacity = 1;
  const glowOpacity = hovered ? 0.86 : 0.46;

  const content = (
    <>
      <motion.span
        aria-hidden
        className="glass-capsule-primary pointer-events-none absolute inset-0 rounded-full"
        initial={false}
        animate={{ opacity: surfaceOpacity }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-px rounded-full bg-[radial-gradient(circle_at_20%_18%,rgba(216,180,254,0.72)_0%,rgba(168,85,247,0.28)_38%,rgba(76,29,149,0.08)_62%,transparent_82%)]"
        initial={false}
        animate={{ opacity: glowOpacity }}
        transition={{ duration: 0.3, ease }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute z-[5] block -rotate-[18deg] bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.06)_20%,rgba(255,255,255,0.62)_50%,rgba(255,255,255,0.08)_80%,transparent_100%)]"
        initial={false}
        animate={{
          x: hovered ? shimmerMotion.endX : shimmerMotion.startX,
          y: hovered ? shimmerMotion.endY : shimmerMotion.startY,
          opacity: hovered ? 1 : 0,
        }}
        style={{
          left: shimmerMotion.originX,
          top: shimmerMotion.originY,
          width: shimmerMotion.width,
          height: shimmerMotion.height,
        }}
        transition={{ duration: 1.05, ease }}
      />
      {leadingIcon}
      <motion.span
        className={cn(
          "relative z-10 inline-block overflow-hidden whitespace-nowrap transition-colors duration-200",
          labelColorClass,
        )}
        initial={false}
        animate={{
          maxWidth: showLabel ? 180 : 0,
          opacity: showLabel ? 1 : 0,
        }}
        transition={{ duration: 0.32, ease }}
      >
        {label}
      </motion.span>
      {balanceSlot}
    </>
  );

  return (
    <motion.div
      className={cn("inline-block origin-center transform-gpu will-change-transform", className)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={false}
      animate={{
        scale: hovered ? 1.06 : 1,
        rotate: hovered ? -10 : 0,
        y: hovered ? -1.5 : 0,
      }}
      whileTap={{ scale: 0.97 }}
      transition={spring}
    >
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
          aria-label={label}
        >
          {content}
        </a>
      ) : (
        <Link href={href} className={linkClassName} aria-label={label}>
          {content}
        </Link>
      )}
    </motion.div>
  );
};
