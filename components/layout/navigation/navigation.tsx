"use client";

import { motion } from "framer-motion";
import { PhoneCall, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";
import { navigationConfig } from "@/data/navigation";
import { storeUrl } from "@/data/site";
import { cn } from "@/lib/utils";
import type { NavigationConfig, NavItemConfig } from "@/types";
import { iconRegistry } from "./icon-registry";

interface NavigationProps {
  content?: NavigationConfig;
}

const dockSpring = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 } as const;

/**
 * Bottom dock.
 *
 * One tray for every screen size: a white well of section links, then the
 * primary action. The active link carries a purple chip that slides between
 * items (a shared layout animation) and shows its label; the others are
 * icon-only with a tooltip. There is no pointer tracking, so moving the mouse
 * over the dock never re-renders it.
 */
export const Navigation = ({ content = navigationConfig }: NavigationProps) => {
  const pathname = usePathname();
  const { scrollTo } = useSmoothScroll();
  const [activeSectionId, setActiveSectionId] = useState("home");

  const { items } = content;
  const primaryCta = content.ctas.find((cta) => cta.variant === "primary" && (cta.href ?? cta.path));
  const primaryTarget = primaryCta?.href ?? primaryCta?.path ?? "/contact";
  const isHomePage = pathname === "/";

  const isActive = useCallback(
    (item: NavItemConfig) => {
      if (item.sectionId) {
        return isHomePage && activeSectionId === item.sectionId;
      }

      return pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
    },
    [activeSectionId, isHomePage, pathname],
  );

  const syncHashForSection = useCallback((sectionId: string) => {
    const nextUrl = sectionId === "home" ? "/" : `/#${sectionId}`;
    const currentUrl = `${window.location.pathname}${window.location.hash}`;

    if (currentUrl !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      if (sectionId === "home") {
        syncHashForSection(sectionId);
        scrollTo(0, { lerp: 0.16 });
        return;
      }

      const target = document.querySelector<HTMLElement>(`[data-nav-section="${sectionId}"]`);

      if (!target) {
        return;
      }

      syncHashForSection(sectionId);
      scrollTo(target, { offset: -92, lerp: 0.16 });
    },
    [scrollTo, syncHashForSection],
  );

  const handleNavClick = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, item: NavItemConfig) => {
      if (!isHomePage || !item.sectionId) {
        return;
      }

      event.preventDefault();
      setActiveSectionId(item.sectionId);
      scrollToSection(item.sectionId);
    },
    [isHomePage, scrollToSection],
  );

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    const sectionElements = items
      .map((item) =>
        item.sectionId
          ? document.querySelector<HTMLElement>(`[data-nav-section="${item.sectionId}"]`)
          : null,
      )
      .filter((element): element is HTMLElement => element !== null);

    if (!sectionElements.length) {
      return;
    }

    const knownSectionIds = new Set(
      sectionElements
        .map((element) => element.dataset.navSection)
        .filter((value): value is string => !!value),
    );

    const syncFromHash = () => {
      const currentHash = window.location.hash.replace(/^#/, "");
      const nextSectionId = currentHash && knownSectionIds.has(currentHash) ? currentHash : "home";

      setActiveSectionId((current) => (current === nextSectionId ? current : nextSectionId));
    };

    syncFromHash();

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (entryA, entryB) =>
              entryA.boundingClientRect.top - entryB.boundingClientRect.top ||
              entryB.intersectionRatio - entryA.intersectionRatio,
          );
        const nextSection = visibleEntries[0]?.target as HTMLElement | undefined;
        const nextSectionId = nextSection?.dataset.navSection;

        if (!nextSectionId) {
          return;
        }

        setActiveSectionId((current) => (current === nextSectionId ? current : nextSectionId));
        syncHashForSection(nextSectionId);
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.2, 0.35, 0.55],
      },
    );

    sectionElements.forEach((element) => observer.observe(element));
    window.addEventListener("hashchange", syncFromHash);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [isHomePage, items, syncHashForSection]);

  return (
    <motion.nav
      aria-label="Main navigation"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-2"
      initial={{ y: 28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 28, delay: 0.1 }}
    >
      <div className="tray tray-tight pointer-events-auto flex max-w-full items-stretch gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_1px_rgba(var(--shade-rgb),0.09),0_22px_40px_-18px_rgba(var(--shade-rgb),0.6)]">
        <ul className="tray-card flex items-center gap-0.5 p-1">
          {items.map((item) => {
            const Icon = iconRegistry[item.id];

            if (!Icon) {
              return null;
            }

            const active = isActive(item);

            return (
              <motion.li key={item.id} layout transition={dockSpring} className="relative">
                <Link
                  href={item.path}
                  aria-label={item.isNew ? `${item.label}, new` : item.label}
                  aria-current={active ? "page" : undefined}
                  onClick={(event) => handleNavClick(event, item)}
                  className={cn(
                    "group relative flex h-10 items-center gap-2 rounded-[0.6rem] px-2.5 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-purple-400 sm:px-3",
                    active ? "text-purple-800" : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="dock-active-chip"
                      transition={dockSpring}
                      className="absolute inset-0 rounded-[0.6rem] bg-purple-100 shadow-[inset_0_0_0_1px_var(--color-purple-200),0_2px_0_var(--color-purple-200)]"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-[0.5rem] bg-black px-2.5 py-1.5 text-[12px] font-semibold leading-none text-white opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:translate-y-0 group-hover:opacity-100 max-sm:hidden"
                    >
                      {item.label}
                    </span>
                  )}

                  <Icon
                    aria-hidden
                    className={cn(
                      "relative size-[18px] shrink-0 transition-transform duration-200 ease-out group-hover:-translate-y-0.5",
                      active ? "stroke-[2.2px]" : "stroke-[1.9px]",
                    )}
                  />

                  {active ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.08 }}
                      className="relative whitespace-nowrap text-[13px] font-semibold tracking-[-0.01em] max-[420px]:hidden"
                    >
                      {item.label}
                    </motion.span>
                  ) : null}

                  {item.isNew && !active ? (
                    <span
                      aria-hidden
                      className="absolute right-1 top-1 size-1.5 rounded-full bg-purple-600"
                    />
                  ) : null}
                </Link>
              </motion.li>
            );
          })}
        </ul>

        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Shop"
          className="tray-card flex w-12 shrink-0 items-center justify-center text-text-primary transition-colors duration-200 hover:text-purple-700 sm:hidden"
        >
          <ShoppingBag aria-hidden className="size-[18px]" strokeWidth={2} />
        </a>

        <Link
          href={primaryTarget}
          aria-label={primaryCta?.label ?? "Contact"}
          className="press press--accent press--compact !h-auto shrink-0 !rounded-[0.75rem] !px-3.5 !shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_3px_0_var(--color-purple-900)] sm:!px-4"
        >
          <PhoneCall aria-hidden className="size-[17px]" strokeWidth={2.3} />
          <span className="max-sm:hidden">{primaryCta?.label ?? "Contact"}</span>
        </Link>
      </div>
    </motion.nav>
  );
};
