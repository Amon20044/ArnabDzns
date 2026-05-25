"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { createMetallicSurface } from "@/lib/metallic-surface";
import { cn } from "@/lib/utils";

type ShinyIconLinkSize = "sm" | "md" | "nav";

interface ShinyIconLinkProps {
  href: string;
  label: string;
  Icon: LucideIcon;
  active?: boolean;
  external?: boolean;
  size?: ShinyIconLinkSize;
  tone?: string;
  className?: string;
  iconClassName?: string;
}

const sizeClassNames: Record<ShinyIconLinkSize, string> = {
  sm: "size-8 rounded-full",
  md: "size-9 rounded-[11px]",
  nav: "size-8 rounded-full",
};

const iconClassNames: Record<ShinyIconLinkSize, string> = {
  sm: "size-[15px]",
  md: "size-[16px]",
  nav: "size-[15.5px]",
};

export function ShinyIconLink({
  href,
  label,
  Icon,
  active = false,
  external = false,
  size = "md",
  tone = "#a855f7",
  className,
  iconClassName,
}: ShinyIconLinkProps) {
  const theme = createMetallicSurface({
    tone: active ? "#09090b" : tone,
    textColor: "#ffffff",
    iconColor: "#ffffff",
  });
  const opensNewTab =
    external &&
    !href.startsWith("mailto:") &&
    !href.startsWith("tel:");
  const linkClassName = cn(
    "group relative inline-flex shrink-0 items-center justify-center overflow-hidden select-none",
    "transition-transform duration-200 ease-out",
    sizeClassNames[size],
  );
  const content = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={theme.surfaceStyle}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-px rounded-[inherit] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
        style={theme.glowStyle}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-8 top-1/2 z-[2] h-[240%] w-5 -translate-y-1/2 rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.72),transparent)] opacity-0 transition-all duration-700 ease-out group-hover:left-[130%] group-hover:opacity-100"
      />
      <Icon
        aria-hidden
        className={cn(
          "relative z-[3] shrink-0",
          iconClassNames[size],
          iconClassName,
        )}
        strokeWidth={size === "nav" ? 1.9 : 1.8}
        style={{ color: theme.iconColor }}
      />
      <span className="sr-only">{label}</span>
    </>
  );

  if (opensNewTab) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={cn("inline-flex shrink-0", className)}
        whileHover={{ y: -1.5, scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <span className={linkClassName}>{content}</span>
      </motion.a>
    );
  }

  return (
    <motion.div
      className={cn("inline-flex shrink-0", className)}
      whileHover={{ y: -1.5, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <Link
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={linkClassName}
      >
        {content}
      </Link>
    </motion.div>
  );
}
