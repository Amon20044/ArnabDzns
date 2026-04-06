"use client";

import Link from "next/link";
import { motion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
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
  const [hovered, setHovered] = useState(false);
  const sizeSpring = useSpring(iconSize, { stiffness: 380, damping: 18 });

  useEffect(() => {
    sizeSpring.set(iconSize);
  }, [iconSize, sizeSpring]);

  return (
    <Link
      href={to}
      className={cn(
        "group relative flex items-center rounded-full select-none",
        "transition-colors duration-150",
        isActive ? "text-accent" : "text-[#71717a] hover:text-[#18181b]"
      )}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Liquid glass capsule — Framer Motion handles isActive dim */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full glass-capsule pointer-events-none"
        initial={false}
        animate={{ opacity: hovered ? 1 : isActive ? 0.45 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      />

      {/* Content row */}
      <div className="relative z-10 flex items-center py-[7px] pl-[11px] pr-[11px]">
        {/* Icon + active dot */}
        <div className="relative shrink-0">
          <motion.div
            className="flex items-center justify-center"
            style={{ width: sizeSpring, height: sizeSpring }}
          >
            <Icon
              className={isActive ? "stroke-[1.8px]" : "stroke-[1.5px]"}
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>

          {isActive && (
            <motion.div
              layoutId="navDot"
              className="absolute left-1/2 -translate-x-1/2 -bottom-[9px] w-[4px] h-[4px] rounded-full bg-accent"
              animate={{ opacity: hovered ? 0 : 1 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </div>

        {/* Label — CSS group-hover reveal (reliable: fires on native :hover, no JS needed) */}
        <span
          aria-hidden
          className={cn(
            "block whitespace-nowrap overflow-hidden leading-none",
            "text-[12px] font-medium tracking-wide",
            "transition-all duration-[260ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
            "max-w-0 opacity-0 ml-0",
            "group-hover:max-w-[96px] group-hover:opacity-100 group-hover:ml-[7px]"
          )}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};
