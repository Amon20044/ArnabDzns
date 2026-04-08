"use client";

import type { LucideIcon } from "lucide-react";
import { motion, useSpring } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  id: string;
  to: string;
  label: string;
  Icon: LucideIcon;
  isActive: boolean;
  iconSize: number;
  isNew?: boolean;
}

export const NavItem = ({
  id,
  to,
  label,
  Icon,
  isActive,
  iconSize,
  isNew = false,
}: NavItemProps) => {
  const [hovered, setHovered] = useState(false);
  const [labelWidth, setLabelWidth] = useState(0);
  const sizeSpring = useSpring(iconSize, { stiffness: 380, damping: 18 });
  const labelInnerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    sizeSpring.set(iconSize);
  }, [iconSize, sizeSpring]);

  useEffect(() => {
    const labelInner = labelInnerRef.current;

    if (!labelInner) {
      return;
    }

    const measure = () => setLabelWidth(labelInner.scrollWidth);

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(labelInner);

    return () => resizeObserver.disconnect();
  }, [isNew, label]);

  return (
    <Link
      href={to}
      data-nav-item={id}
      className={cn(
        "group relative flex min-w-0 flex-1 items-center justify-center rounded-full select-none sm:flex-none",
        "transition-colors duration-150",
        isActive ? "text-accent" : "text-text-secondary hover:text-text-primary"
      )}
      aria-label={isNew ? `${label}, new` : label}
      aria-current={isActive ? "page" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        aria-hidden
        className="glass-capsule pointer-events-none absolute inset-0 rounded-full"
        initial={false}
        animate={{ opacity: hovered ? 1 : isActive ? 0.45 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      />

      <div className="relative z-10 flex items-center justify-center px-[9px] py-[9px] sm:py-[7px] sm:pl-[11px] sm:pr-[11px]">
        <div className="relative shrink-0">
          <motion.div
            className="flex items-center justify-center"
            style={{ width: sizeSpring, height: sizeSpring }}
          >
            <Icon
              className={isActive ? "stroke-[2px]" : "stroke-[1.8px]"}
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>

          {isActive ? (
            <motion.div
              layoutId="navDot"
              className="absolute -bottom-[9px] left-1/2 h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-accent"
              animate={{ opacity: hovered ? 0 : 1 }}
              transition={{ duration: 0.15 }}
            />
          ) : null}
        </div>

        <motion.span
          aria-hidden
          className="block overflow-hidden leading-none"
          initial={false}
          animate={{
            marginLeft: hovered ? 7 : 0,
            maxWidth: hovered ? labelWidth : 0,
            opacity: hovered ? 1 : 0,
          }}
          transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
        >
          <span
            ref={labelInnerRef}
            className="inline-flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-[11px] font-medium tracking-wide sm:text-[12px]">{label}</span>

            {isNew ? (
              <span
                className="rounded-full border border-accent/20 bg-accent/10
                           px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-accent"
              >
                New
              </span>
            ) : null}
          </span>
        </motion.span>
      </div>
    </Link>
  );
};
