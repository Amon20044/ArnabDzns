"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { headerConfig } from "@/data/navigation";
import { storeUrl } from "@/data/site";
import { ArnabCharacter } from "@/components/illustrations/arnab-character";
import type { HeaderConfig } from "@/types";
import { socialIconRegistry } from "./social-icons";

interface HeaderProps {
  content?: HeaderConfig;
}

export const Header = ({ content = headerConfig }: HeaderProps) => {
  const { availabilityLabel, brand, socials } = content;
  const shopLink = content.shop ?? { label: "Shop", path: "/shop" };
  const [isVisible, setIsVisible] = useState(true);
  const [brandHovered, setBrandHovered] = useState(false);
  const [bioOpen, setBioOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const firstName = brand.name.trim().split(/\s+/)[0] ?? brand.name;
  const roles = brand.role
    .split(/[·|,]/)
    .map((role) => role.trim())
    .filter(Boolean)
    .slice(0, 4);
  const bioWords = brand.bio.trim().split(/\s+/);
  // Old content may still point the shop at the removed /shop page.
  const shopHref = shopLink.path.startsWith("http") ? shopLink.path : storeUrl;

  const handleScroll = useEffectEvent(() => {
    if (scrollFrameRef.current !== null) {
      return;
    }

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;

      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDelta = currentScrollY - lastScrollYRef.current;
      const isNearTop = currentScrollY < 24;
      const nextVisible = isNearTop
        ? true
        : scrollDelta < -4
          ? true
          : scrollDelta > 4
            ? false
            : isVisibleRef.current;

      if (nextVisible !== isVisibleRef.current) {
        isVisibleRef.current = nextVisible;
        startTransition(() => setIsVisible(nextVisible));
      }

      lastScrollYRef.current = currentScrollY;
    });
  });

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    isVisibleRef.current = true;

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!bioOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!trayRef.current?.contains(event.target as Node)) {
        setBioOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setBioOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [bioOpen]);

  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3"
      initial={false}
      animate={{
        opacity: isVisible || bioOpen ? 1 : 0,
        y: isVisible || bioOpen ? 0 : -96,
      }}
      transition={{
        opacity: { duration: 0.22, ease: "easeOut" },
        y: { type: "spring", stiffness: 280, damping: 30 },
      }}
    >
      {/* One tray, three wells: who, status, where to find him. */}
      <div
        ref={trayRef}
        className="tray tray-tight pointer-events-auto relative flex max-w-full items-stretch gap-1.5"
      >
        <button
          type="button"
          className="tray-card group flex min-w-0 cursor-pointer items-center gap-2.5 py-1.5 pl-1.5 pr-3.5 text-left sm:pr-5"
          aria-expanded={bioOpen}
          aria-controls="arnab-bio-bubble"
          aria-label={bioOpen ? `Close ${brand.name} bio` : `Open ${brand.name} bio`}
          onClick={() => setBioOpen((open) => !open)}
          onMouseEnter={() => setBrandHovered(true)}
          onMouseLeave={() => setBrandHovered(false)}
          onFocus={() => setBrandHovered(true)}
          onBlur={() => setBrandHovered(false)}
        >
          <motion.span
            aria-hidden
            className="relative block size-10 shrink-0 overflow-hidden rounded-[0.6rem] bg-[radial-gradient(circle_at_50%_30%,#c084fc,#7e22ce)]"
            animate={{
              rotate: bioOpen ? -8 : brandHovered ? -6 : 0,
              scale: bioOpen || brandHovered ? 1.06 : 1,
            }}
            transition={{ type: "spring", stiffness: 340, damping: 18 }}
          >
            <span className="absolute left-1/2 top-[6%] block w-[185%] -translate-x-1/2">
              <ArnabCharacter title="" />
            </span>
          </motion.span>

          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold leading-tight tracking-tight text-text-primary">
              {brand.name}
            </span>
            <span className="relative block h-[17px] overflow-hidden">
              <motion.span
                className="flex flex-col"
                animate={{ y: brandHovered || bioOpen ? -17 : 0 }}
                transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              >
                <span className="truncate text-[12px] leading-[17px] text-text-secondary">
                  All solutions on one stop.
                </span>
                <span className="truncate text-[12px] leading-[17px] text-accent-dark">
                  {bioOpen ? "Tap to close." : "Tap to say hi."}
                </span>
              </motion.span>
            </span>
          </span>
        </button>

        {/* Speech bubble: grows out of the avatar, then the words land one by one. */}
        <AnimatePresence>
          {bioOpen ? (
            <motion.div
              id="arnab-bio-bubble"
              role="region"
              aria-label={`About ${brand.name}`}
              className="absolute left-0 top-full z-10 mt-4 w-[min(22rem,calc(100vw-1.5rem))] origin-[1.75rem_0]"
              initial={{ opacity: 0, scale: 0.4, y: -14, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: -10, transition: { duration: 0.16 } }}
              transition={{ type: "spring", stiffness: 380, damping: 22, mass: 0.7 }}
            >
              <span
                aria-hidden
                className="absolute -top-2 left-6 size-5 rotate-45 rounded-[5px] bg-black"
              />
              <div className="relative rounded-[1.4rem] bg-black p-5 text-white shadow-[0_5px_0_#000,0_28px_44px_-18px_rgba(var(--shade-rgb),0.7)]">
                <button
                  type="button"
                  onClick={() => setBioOpen(false)}
                  aria-label="Close bio"
                  className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <X aria-hidden className="size-3.5" strokeWidth={2.6} />
                </button>

                <p className="font-hand text-[1.7rem] leading-none text-purple-300">
                  hey, I&apos;m {firstName}{" "}
                  <motion.span
                    aria-hidden
                    className="inline-block origin-[70%_80%]"
                    animate={{ rotate: [0, 18, -8, 18, 0] }}
                    transition={{ duration: 1.2, delay: 0.25 }}
                  >
                    👋
                  </motion.span>
                </p>

                <p className="mt-3 text-[0.98rem] leading-[1.55] text-white/90">
                  {bioWords.map((word, index) => (
                    <motion.span
                      key={`${word}-${index}`}
                      className="inline-block whitespace-pre"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: 0.18 + index * 0.028 }}
                    >
                      {word}{" "}
                    </motion.span>
                  ))}
                </p>

                {roles.length ? (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {roles.map((role, index) => (
                      <motion.li
                        key={role}
                        className="rounded-[0.5rem] bg-white/10 px-2.5 py-1.5 text-[0.72rem] font-semibold leading-none tracking-[0.02em] text-white/90"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 20,
                          delay: 0.5 + index * 0.06,
                        }}
                      >
                        {role}
                      </motion.li>
                    ))}
                  </ul>
                ) : null}

                <Link
                  href="/contact"
                  onClick={() => setBioOpen(false)}
                  className="press press--accent press--compact group mt-5 w-full"
                >
                  Start a project
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                    strokeWidth={2.4}
                  />
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="tray-card hidden items-center gap-2 px-4 sm:flex">
          <span className="relative flex size-2.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#22c55e]/60" />
            <span className="relative size-2.5 rounded-full bg-[#22c55e]" />
          </span>
          <span className="whitespace-nowrap text-[13px] font-semibold tracking-[-0.01em] text-text-primary">
            {availabilityLabel}
          </span>
        </div>

        <div className="tray-card flex shrink-0 items-center gap-1 px-1.5">
          <a
            href={shopHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={shopLink.label}
            className="hidden size-9 items-center justify-center rounded-[0.6rem] bg-purple-600 text-white shadow-[0_3px_0_var(--color-purple-900)] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0.5 sm:flex"
          >
            <ShoppingBag aria-hidden className="size-4" strokeWidth={2.1} />
          </a>

          {socials.map((social) => {
            const Icon = socialIconRegistry[social.id];

            if (!Icon) {
              return null;
            }

            return (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex size-9 items-center justify-center rounded-[0.6rem] text-text-primary transition-[background-color,color,transform] duration-150 ease-out hover:-translate-y-0.5 hover:bg-purple-100 hover:text-accent-dark active:translate-y-0"
              >
                <Icon className="size-[16px]" />
              </a>
            );
          })}
        </div>
      </div>
    </motion.header>
  );
};
