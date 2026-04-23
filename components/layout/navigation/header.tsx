"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  type ReactNode,
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
  profileBioContent: ReactNode;
  content?: HeaderConfig;
}

const MODAL_SCROLL_LOCK_EVENT = "app:modal-scroll-lock";

export const Header = ({ profileBioContent, content = headerConfig }: HeaderProps) => {
  const { availabilityLabel, brand, socials } = content;
  const [isVisible, setIsVisible] = useState(true);
  const [brandHovered, setBrandHovered] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const isVisibleRef = useRef(true);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const setProfileDialog = (nextOpen: boolean) => {
    startTransition(() => setProfileDialogOpen(nextOpen));
  };

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

  const handleDialogKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setProfileDialog(false);
    }
  });

  useEffect(() => {
    if (!profileDialogOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.dispatchEvent(
      new CustomEvent(MODAL_SCROLL_LOCK_EVENT, {
        detail: { locked: true },
      }),
    );
    document.addEventListener("keydown", handleDialogKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.dispatchEvent(
        new CustomEvent(MODAL_SCROLL_LOCK_EVENT, {
          detail: { locked: false },
        }),
      );
      document.removeEventListener("keydown", handleDialogKeyDown);
    };
  }, [profileDialogOpen]);

  return (
    <>
      <AnimatePresence>
        {profileDialogOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center px-4 py-5 sm:px-6 sm:py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close profile bio"
              className="absolute inset-0 bg-[rgba(16,18,24,0.42)] backdrop-blur-[14px]"
              onClick={() => setProfileDialog(false)}
            />

            <motion.div
              id="profile-bio-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-bio-title"
              className="relative z-10 flex max-h-[calc(100vh-2.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.8rem]
                         border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(247,247,249,0.92)_100%)]
                         shadow-[0_30px_90px_rgba(15,23,42,0.22)] ring-1 ring-black/5 sm:max-h-[calc(100vh-4rem)] sm:rounded-[2rem]"
              initial={{ opacity: 0, y: 22, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4 border-b border-black/6 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="relative size-12 shrink-0 overflow-hidden rounded-full
                               bg-black-soft ring-1 ring-black/10 shadow-[0_8px_18px_rgba(9,9,11,0.14)]"
                  >
                    <Image
                      src={brand.logoSrc}
                      alt={brand.logoAlt}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p
                      id="profile-bio-title"
                      className="truncate text-[15px] font-semibold leading-tight tracking-tight text-text-primary sm:text-base"
                    >
                      {brand.name}
                    </p>
                    <p className="truncate text-[12.5px] leading-[18px] text-text-secondary sm:text-[13px]">
                      {brand.role}
                    </p>
                  </div>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="Close profile bio modal"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white/82
                             text-text-primary shadow-[0_10px_24px_rgba(15,23,42,0.10)] transition-colors duration-150
                             hover:border-accent/20 hover:text-accent"
                  onClick={() => setProfileDialog(false)}
                >
                  <X className="size-5" />
                </button>
              </div>

              <div
                data-lenis-prevent
                data-lenis-prevent-wheel
                data-lenis-prevent-touch
                className="flex-1 touch-pan-y overflow-y-auto overscroll-contain px-4 pb-4 pt-3
                           [-webkit-overflow-scrolling:touch] sm:px-6 sm:pb-6 sm:pt-4"
              >
                <div
                  className="rounded-[1.45rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(251,251,252,0.82)_100%)]
                             px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:px-8 sm:py-8"
                >
                  {profileBioContent}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
          <button
            type="button"
            className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-full py-1 pr-1 text-left sm:gap-3.5 sm:pr-3"
            aria-haspopup="dialog"
            aria-expanded={profileDialogOpen}
            aria-controls="profile-bio-dialog"
            onMouseEnter={() => setBrandHovered(true)}
            onMouseLeave={() => setBrandHovered(false)}
            onFocus={() => setBrandHovered(true)}
            onBlur={() => setBrandHovered(false)}
            onClick={() => setProfileDialog(true)}
          >
            <motion.div
              className="relative size-11 shrink-0 overflow-hidden rounded-full
                         bg-black-soft ring-1 ring-black/10
                         shadow-[0_4px_14px_rgba(9,9,11,0.10)]"
              whileHover={{ scale: 1.04 }}
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

            <div className="min-w-0">
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
                    Open full bio
                  </span>
                </motion.div>
              </div>
            </div>
          </button>

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
    </>
  );
};
