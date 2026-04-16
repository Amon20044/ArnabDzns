"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

type PrimaryButtonSize = "default" | "compact";
type PrimaryButtonIconVisibility = "always" | "hover";
type PrimaryButtonTone = "default" | "white";

interface PrimaryButtonProps {
  label: string;
  href?: string;
  Icon?: LucideIcon;
  external?: boolean;
  className?: string;
  size?: PrimaryButtonSize;
  iconVisibility?: PrimaryButtonIconVisibility;
  iconOnly?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
  iconClassName?: string;
  tone?: PrimaryButtonTone;
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
  iconVisibility,
  iconOnly = false,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
  iconClassName,
  tone = "default",
}: PrimaryButtonProps) => {
  const [hovered, setHovered] = useState(false);
  const isCompact = size === "compact";
  const isWhiteTone = tone === "white";
  const resolvedIconVisibility = iconVisibility ?? (isCompact ? "hover" : "always");
  const showLeadingIcon =
    !!Icon && (iconOnly || resolvedIconVisibility === "always" || hovered);
  const showLabel = !iconOnly;
  const showBalanceSlot =
    !!Icon && !iconOnly && resolvedIconVisibility === "hover" && hovered;
  const iconSlotWidth = isCompact ? 20 : 24;
  const iconGap = isCompact ? 8 : 10;
  const iconStrokeWidth = isCompact ? 2.2 : 2.3;
  const labelColorClass = isWhiteTone ? "text-text-primary" : "text-white";
  const toneTextClass = isWhiteTone ? "text-text-primary" : "text-white";
  const enableTilt = !fullWidth && !iconOnly;
  const isMailOrPhoneLink = href?.startsWith("mailto:") || href?.startsWith("tel:");
  const shouldRenderAnchor = !!href && (external || isMailOrPhoneLink);
  const shouldOpenNewTab = external && !isMailOrPhoneLink;

  const iconOnlyContent = Icon && iconOnly ? (
    <motion.span
      aria-hidden
      className={cn(
        "relative z-10 inline-flex items-center justify-center",
        labelColorClass,
        isCompact ? "size-5" : "size-6",
      )}
      initial={false}
      animate={{ scale: hovered ? 1.04 : 1, opacity: 1 }}
      transition={{ duration: 0.22, ease }}
    >
      <Icon
        className={cn("h-full w-full", iconClassName)}
        strokeWidth={isCompact ? 2.35 : 2.4}
      />
    </motion.span>
  ) : null;

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
        marginRight: showLeadingIcon && showLabel ? iconGap : 0,
        x: showLeadingIcon ? 0 : -6,
      }}
      transition={{ duration: 0.38, ease }}
    >
      <Icon
        className={cn("shrink-0", isCompact ? "size-[18px]" : "size-[18px]", iconClassName)}
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
      <span className={cn("block shrink-0", isCompact ? "size-[18px]" : "size-[18px]")} />
    </motion.span>
  ) : null;

  const linkClassName = cn(
    "primary-button group relative inline-flex items-center justify-center gap-0 overflow-hidden rounded-full select-none",
    isWhiteTone && "primary-button--white",
    "will-change-transform",
    fullWidth && "w-full",
    iconOnly
      ? isCompact
        ? "size-16 p-0 text-[13px] font-semibold leading-none"
        : cn("size-12 p-0 text-[15px] font-semibold", toneTextClass)
      : isCompact
        ? "px-[18px] py-[8px] text-[13px] font-semibold leading-none"
        : cn("px-8 py-[18px] text-[15px] font-semibold", toneTextClass),
  );

  const surfaceOpacity = 1;
  const glowOpacity = hovered ? (isWhiteTone ? 0.92 : 0.86) : isWhiteTone ? 0.72 : 0.46;

  const content = (
    <>
      {isWhiteTone ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(120deg,rgba(255,255,255,0.96)_8%,rgba(243,232,255,0.95)_34%,rgba(216,180,254,0.72)_62%,rgba(255,255,255,0.96)_100%)]"
          initial={false}
          animate={{ opacity: hovered ? 0.92 : 0.68 }}
          transition={{ duration: 0.28, ease }}
        />
      ) : null}
      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none absolute rounded-full",
          isWhiteTone ? "inset-px glass-capsule" : "inset-0 glass-capsule-primary",
        )}
        initial={false}
        animate={{ opacity: surfaceOpacity }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      />
      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-px rounded-full",
          isWhiteTone
            ? "bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.92)_0%,rgba(243,232,255,0.72)_40%,rgba(168,85,247,0.08)_72%,transparent_88%)]"
            : "bg-[radial-gradient(circle_at_20%_18%,rgba(216,180,254,0.72)_0%,rgba(168,85,247,0.28)_38%,rgba(76,29,149,0.08)_62%,transparent_82%)]",
        )}
        initial={false}
        animate={{ opacity: glowOpacity }}
        transition={{ duration: 0.3, ease }}
      />
      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none absolute z-[5] block -rotate-[18deg]",
          isWhiteTone
            ? "bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.18)_20%,rgba(255,255,255,0.94)_50%,rgba(255,255,255,0.22)_80%,transparent_100%)]"
            : "bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.06)_20%,rgba(255,255,255,0.62)_50%,rgba(255,255,255,0.08)_80%,transparent_100%)]",
        )}
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
      {iconOnly ? (
        iconOnlyContent
      ) : (
        <>
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
      )}
    </>
  );

  return (
    <motion.div
      className={cn(
        "inline-block origin-center transform-gpu will-change-transform",
        fullWidth && "w-full",
        className,
      )}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={false}
      animate={{
        scale: hovered ? (isWhiteTone ? 1.03 : 1.06) : 1,
        rotate: hovered && enableTilt && !isWhiteTone ? -10 : 0,
        y: hovered ? (isWhiteTone ? -1 : -1.5) : 0,
      }}
      whileTap={{ scale: 0.97 }}
      transition={spring}
    >
      {href && shouldRenderAnchor ? (
        <a
          href={href}
          target={shouldOpenNewTab ? "_blank" : undefined}
          rel={shouldOpenNewTab ? "noopener noreferrer" : undefined}
          className={linkClassName}
          aria-label={label}
        >
          {content}
        </a>
      ) : href ? (
        <Link href={href} className={linkClassName} aria-label={label}>
          {content}
        </Link>
      ) : (
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={linkClassName}
          aria-label={label}
        >
          {content}
        </button>
      )}
    </motion.div>
  );
};
