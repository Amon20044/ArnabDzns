"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CTAConfig } from "@/types";

interface CTAButtonProps {
  config: CTAConfig;
}

export const CTAButton = ({ config }: CTAButtonProps) => {
  const { label, variant, path, href } = config;
  const isExternal = !!href;
  const target = isExternal ? href! : path!;

  const baseClass = cn(
    "relative flex items-center justify-center px-4 py-2 rounded-full",
    "text-[13px] font-semibold whitespace-nowrap overflow-hidden",
    "transition-all duration-200 select-none cursor-pointer",
    variant === "primary"
      ? "bg-text-primary text-white hover:bg-black-soft"
      : "text-text-secondary border border-border hover:border-accent hover:text-accent hover:bg-accent/5"
  );

  const inner = (
    <>
      {/* Shimmer on primary only */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)",
          }}
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </>
  );

  if (isExternal) {
    return (
      <motion.a
        href={target}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
        whileTap={{ scale: 0.96 }}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.div whileTap={{ scale: 0.96 }}>
      <Link href={target} className={baseClass}>
        {inner}
      </Link>
    </motion.div>
  );
};
