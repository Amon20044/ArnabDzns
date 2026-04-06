"use client";

import Link from "next/link";
import { motion, useSpring } from "framer-motion";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  label: string;
  Icon: LucideIcon;
  isActive: boolean;
  /** Dock magnification size in px (driven by mouse proximity) */
  iconSize: number;
}

export const NavItem = ({ to, label, Icon, isActive, iconSize }: NavItemProps) => {
  const sizeSpring = useSpring(iconSize, { stiffness: 380, damping: 18 });

  useEffect(() => {
    sizeSpring.set(iconSize);
  }, [iconSize, sizeSpring]);

  return (
    <Link
      href={to}
      className={cn(
        "group relative flex flex-col items-center justify-center px-3 py-1.5 rounded-full",
        "transition-colors duration-200",
        isActive
          ? "text-accent"
          : "text-text-secondary hover:text-text-primary"
      )}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Active pill background */}
      {isActive && (
        <motion.div
          layoutId="navActiveItem"
          className="absolute inset-0 rounded-full bg-accent/8"
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
        />
      )}

      {/* Hover background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-black/[0.04] opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.15 }}
      />

      {/* Icon with dock magnification */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        style={{ width: sizeSpring, height: sizeSpring }}
      >
        <Icon
          className={cn(
            "transition-colors duration-200",
            isActive
              ? "stroke-[1.8px]"
              : "stroke-[1.6px] group-hover:stroke-[1.8px]"
          )}
          style={{ width: "100%", height: "100%" }}
        />
      </motion.div>

      {/* Label */}
      <span
        className={cn(
          "relative z-10 text-[11px] font-medium tracking-wide leading-none mt-0.5",
          "transition-colors duration-200",
          isActive ? "text-accent" : "text-text-secondary group-hover:text-text-primary"
        )}
      >
        {label}
      </span>

      {/* Active dot */}
      {isActive && (
        <motion.div
          layoutId="navDot"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
        />
      )}
    </Link>
  );
};
