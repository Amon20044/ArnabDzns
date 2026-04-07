"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { cn } from "@/lib/utils";
import type { CTAConfig } from "@/types";

interface CTAButtonProps {
  config: CTAConfig;
}

export const CTAButton = ({ config }: CTAButtonProps) => {
  if (config.variant === "primary") {
    const primaryTarget = config.href ?? config.path;

    if (!primaryTarget) {
      return null;
    }

    return (
      <PrimaryButton
        label={config.label}
        href={primaryTarget}
        Icon={config.Icon}
        external={!!config.href}
        mode="hero"
      />
    );
  }

  return <SecondaryCTAButton config={config} />;
};

const SecondaryCTAButton = ({ config }: CTAButtonProps) => {
  const { label, path, href, Icon } = config;
  const [hovered, setHovered] = useState(false);
  const isExternal = !!href;
  const target = href ?? path;

  if (!target) {
    return null;
  }

  const inner = (
    <div className="relative flex items-center py-[8px] pl-[11px] pr-[11px]">
      <motion.div
        aria-hidden
        className={cn("absolute inset-0 rounded-full pointer-events-none", "glass-capsule")}
        initial={false}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      />

      {Icon && (
        <div
          className={cn(
            "relative z-10 flex items-center justify-center shrink-0 transition-colors duration-150",
            hovered ? "text-accent" : "text-[#71717a]"
          )}
          style={{ width: 18, height: 18 }}
        >
          <Icon className="w-full h-full stroke-[1.6px]" />
        </div>
      )}

      <motion.span
        aria-hidden
        className={cn(
          "relative z-10 text-[13px] font-semibold whitespace-nowrap leading-none transition-colors duration-150",
          hovered ? "text-accent" : "text-[#71717a]"
        )}
        animate={{
          maxWidth: hovered ? 110 : 0,
          opacity: hovered ? 1 : 0,
          marginLeft: hovered ? 7 : 0,
        }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: "hidden", display: "block" }}
      >
        {label}
      </motion.span>
    </div>
  );

  if (isExternal) {
    return (
      <motion.a
        href={target}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center rounded-full select-none cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileTap={{ scale: 0.96 }}
        aria-label={label}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.div
      className="relative flex items-center rounded-full select-none cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.96 }}
    >
      <Link href={target} className="flex items-center" aria-label={label}>
        {inner}
      </Link>
    </motion.div>
  );
};
