"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { headerConfig } from "@/data/navigation";
import { LiquidGlassBackdrop } from "@/components/ui/liquid-glass-backdrop";
import { StatusBadge } from "@/components/ui/status-badge";
import type { HeaderConfig } from "@/types";
import { socialIconRegistry } from "./social-icons";

interface HeaderProps {
  content?: HeaderConfig;
}

export const Header = ({ content = headerConfig }: HeaderProps) => {
  const { availabilityLabel, brand, socials } = content;
  const [isVisible, setIsVisible] = useState(true);
  const [brandHovered, setBrandHovered] = useState(false);
  const lastScrollYRef = useRef(0);
  const isVisibleRef = useRef(true);
  const brandHref = brand.path === "/" ? "/about" : brand.path;

  const handleScroll = useEffectEvent(() => {
    const currentScrollY = window.scrollY;
    const isNearTop = currentScrollY < 24;
    const isScrollingUp = currentScrollY <= lastScrollYRef.current;
    const nextVisible = isNearTop || isScrollingUp;

    if (nextVisible !== isVisibleRef.current) {
      isVisibleRef.current = nextVisible;
      startTransition(() => setIsVisible(nextVisible));
    }

    lastScrollYRef.current = currentScrollY;
  });

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    isVisibleRef.current = true;

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40 overflow-hidden border-b border-white/35 bg-transparent"
      initial={{ opacity: 0, y: -16 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : -96,
      }}
      transition={{
        opacity: { duration: 0.22, ease: "easeOut" },
        y: { type: "spring", stiffness: 280, damping: 30 },
      }}
    >
      <LiquidGlassBackdrop />

      <div className="relative z-10 mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-8">
        <Link
          href={brandHref}
          className="group relative flex min-w-0 flex-1 items-center gap-2.5 rounded-full py-1 pr-1 sm:gap-3.5 sm:pr-3"
          aria-label={`Open ${brand.name} bio`}
          onMouseEnter={() => setBrandHovered(true)}
          onMouseLeave={() => setBrandHovered(false)}
          onFocus={() => setBrandHovered(true)}
          onBlur={() => setBrandHovered(false)}
        >
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full border border-black/10 bg-white/0 shadow-[0_8px_22px_rgba(15,23,42,0.06)]"
            initial={false}
            animate={{
              opacity: brandHovered ? 1 : 0,
              scale: brandHovered ? 1 : 0.98,
              backgroundColor: brandHovered
                ? "rgba(255,255,255,0.36)"
                : "rgba(255,255,255,0)",
            }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          />

          <motion.div
            className="relative z-[1] size-11 shrink-0 overflow-hidden rounded-full
                       bg-black-soft ring-1 ring-black/10
                       shadow-[0_4px_14px_rgba(9,9,11,0.10)]"
            animate={{ scale: brandHovered ? 1.04 : 1 }}
            transition={{ type: "spring", stiffness: 340, damping: 22 }}
          >
            <Image
              src={brand.logoSrc}
              alt={brand.logoAlt}
              fill
              loading="eager"
              sizes="44px"
              className="object-cover"
            />
          </motion.div>

          <div className="relative z-[1] min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight tracking-tight text-text-primary">
              {brand.name}
            </p>

            <div className="relative h-[18px] overflow-hidden">
              <motion.div
                className="flex flex-col"
                animate={{ y: brandHovered ? -18 : 0 }}
                transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              >
                <span className="truncate text-[12.5px] leading-[18px] text-text-secondary">
                  {brand.role}
                </span>
                <span className="truncate text-[12.5px] leading-[18px] text-accent">
                  Open Bio
                </span>
              </motion.div>
            </div>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <motion.div
            className="hidden sm:block"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.36, ease: "easeOut", delay: 0.08 }}
          >
            <StatusBadge
              compact
              showIndicator
              pulse
              tone="#059669"
              indicatorColor="#34d399"
            >
              {availabilityLabel}
            </StatusBadge>
          </motion.div>

          <span
            aria-hidden
            className="hidden h-6 w-px bg-black/10 sm:block"
          />

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {socials.map((social, index) => {
              const Icon = socialIconRegistry[social.id];

              if (!Icon) {
                return null;
              }

              return (
                <motion.a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="liquid-glass flex size-[2.125rem] items-center justify-center rounded-[11px]
                             text-text-primary
                             transition-colors duration-150
                             hover:text-accent hover:border-accent/30 sm:size-9"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.32,
                    ease: "easeOut",
                    delay: 0.12 + index * 0.05,
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <Icon className="size-[16px]" />
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
