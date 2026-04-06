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
import { socialIconRegistry } from "./social-icons";

export const Header = () => {
  const { availabilityLabel, brand, socials } = headerConfig;
  const [isVisible, setIsVisible] = useState(true);
  const [brandHovered, setBrandHovered] = useState(false);
  const lastScrollYRef = useRef(0);
  const isVisibleRef = useRef(true);

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
      className="fixed inset-x-0 top-4 z-40 px-4 sm:px-6"
      initial={{ opacity: 0, y: -24 }}
      animate={{
        opacity: isVisible ? 1 : 0.94,
        y: isVisible ? 0 : -112,
      }}
      transition={{
        opacity: { duration: 0.2, ease: "easeOut" },
        y: { type: "spring", stiffness: 320, damping: 28 },
      }}
    >
      <div
        className="mx-auto flex max-w-6xl flex-col gap-3 rounded-[30px]
                   border border-white/80 bg-white/82 p-3
                   shadow-[0_20px_60px_rgba(9,9,11,0.08),0_4px_22px_rgba(168,85,247,0.12)]
                   backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3"
      >
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.38, ease: "easeOut", delay: 0.08 }}
        >
          <Link
            href={brand.path}
            className="group flex min-w-0 items-center gap-3 rounded-[24px] px-1 py-1"
            onMouseEnter={() => setBrandHovered(true)}
            onMouseLeave={() => setBrandHovered(false)}
            onFocus={() => setBrandHovered(true)}
            onBlur={() => setBrandHovered(false)}
          >
            <div
              className="relative size-12 shrink-0 overflow-hidden rounded-[18px]
                         border border-white/80 bg-accent/10 ring-1 ring-accent/10"
            >
              <Image
                src={brand.logoSrc}
                alt={brand.logoAlt}
                fill
                loading="eager"
                sizes="48px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-tight text-text-primary">
                {brand.name}
              </p>

              <div className="relative h-[18px] overflow-hidden">
                <motion.div
                  className="flex flex-col"
                  animate={{ y: brandHovered ? -18 : 0 }}
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                >
                  <span className="truncate text-[12px] text-text-secondary sm:text-[13px]">
                    {brand.role}
                  </span>
                  <span className="truncate text-[12px] text-accent sm:text-[13px]">
                    {brand.bio}
                  </span>
                </motion.div>
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-accent/20
                       bg-accent/8 px-3 py-2 text-[11px] font-medium text-text-primary sm:text-[12px]"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, ease: "easeOut", delay: 0.12 }}
          >
            <span className="relative flex size-2.5 shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
              <span className="relative size-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="truncate">{availabilityLabel}</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-1 rounded-full border border-border/70 bg-white/80 p-1.5"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.34, ease: "easeOut", delay: 0.16 }}
          >
            {socials.map((social) => {
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
                  className="flex size-9 items-center justify-center rounded-full text-text-secondary
                             transition-colors duration-150 hover:text-accent focus-visible:text-accent"
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Icon className="size-[18px]" />
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};
