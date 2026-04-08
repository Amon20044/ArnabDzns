"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { cn } from "@/lib/utils";
import { navigationConfig } from "@/data/navigation";
import type { NavItemConfig } from "@/types";
import { LiquidGlassBackdrop } from "@/components/ui/liquid-glass-backdrop";
import { CTAButton } from "./cta-button";
import { iconRegistry } from "./icon-registry";
import { NavItem } from "./nav-item";

export const Navigation = () => {
  const pathname = usePathname();
  const navbarRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [itemCenters, setItemCenters] = useState<Record<string, number>>({});
  const [activeSectionId, setActiveSectionId] = useState("home");

  const { items, ctas } = navigationConfig;
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

  const mobilePrimaryCta = ctas.find(
    (cta) => cta.variant === "primary" && !!(cta.href ?? cta.path) && !!cta.Icon,
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
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const behavior = prefersReducedMotion ? "auto" : "smooth";

      if (sectionId === "home") {
        syncHashForSection(sectionId);
        window.scrollTo({ top: 0, behavior });
        return;
      }

      const target = document.querySelector<HTMLElement>(
        `[data-nav-section="${sectionId}"]`,
      );

      if (!target) {
        return;
      }

      syncHashForSection(sectionId);
      target.scrollIntoView({ behavior, block: "start" });
    },
    [syncHashForSection],
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

  const syncItemCenters = useCallback(() => {
    const navbar = navbarRef.current;

    if (!navbar) {
      return;
    }

    const navbarRect = navbar.getBoundingClientRect();
    const nextCenters = Array.from(
      navbar.querySelectorAll<HTMLElement>("[data-nav-item]")
    ).reduce<Record<string, number>>((centers, item) => {
      const itemId = item.dataset.navItem;

      if (!itemId) {
        return centers;
      }

      const rect = item.getBoundingClientRect();
      centers[itemId] = rect.left - navbarRect.left + rect.width / 2;
      return centers;
    }, {});

    setItemCenters((currentCenters) => {
      const currentEntries = Object.entries(currentCenters);
      const nextEntries = Object.entries(nextCenters);

      if (
        currentEntries.length === nextEntries.length &&
        nextEntries.every(([key, value]) => currentCenters[key] === value)
      ) {
        return currentCenters;
      }

      return nextCenters;
    });
  }, []);

  useEffect(() => {
    const navbar = navbarRef.current;

    if (!navbar) {
      return;
    }

    syncItemCenters();

    const resizeObserver = new ResizeObserver(syncItemCenters);
    resizeObserver.observe(navbar);

    navbar
      .querySelectorAll<HTMLElement>("[data-nav-item]")
      .forEach((item) => resizeObserver.observe(item));

    window.addEventListener("resize", syncItemCenters);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncItemCenters);
    };
  }, [items.length, pathname, syncItemCenters]);

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
      const nextSectionId =
        currentHash && knownSectionIds.has(currentHash) ? currentHash : "home";

      setActiveSectionId((current) =>
        current === nextSectionId ? current : nextSectionId,
      );
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

        setActiveSectionId((current) =>
          current === nextSectionId ? current : nextSectionId,
        );
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

  useEffect(() => {
    const navbar = navbarRef.current;

    if (!navbar) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = navbar.getBoundingClientRect();
      setMouseX(event.clientX - rect.left);
    };

    navbar.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => navbar.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const getIconSize = (id: string) => {
    const baseSize = 20;
    const maxSize = 32;

    if (!hovered || mouseX === null) {
      return baseSize;
    }

    const itemCenter = itemCenters[id];

    if (itemCenter === undefined) {
      return baseSize;
    }

    const distance = Math.abs(mouseX - itemCenter);
    const radius = 104;

    if (distance >= radius) {
      return baseSize;
    }

    const progress = 1 - distance / radius;
    return baseSize + (maxSize - baseSize) * progress * progress;
  };

  return (
    <>
      <motion.nav
        role="navigation"
        aria-label="Main navigation"
        className="fixed left-1/2 z-50 w-[min(calc(100vw-1rem),28rem)] -translate-x-1/2 sm:hidden"
        style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.1 }}
      >
        <div className="relative pt-14">
          {mobilePrimaryCta?.Icon ? (
            <PrimaryButton
              label={mobilePrimaryCta.label}
              href={mobilePrimaryCta.href ?? mobilePrimaryCta.path ?? "/contact"}
              Icon={mobilePrimaryCta.Icon}
              external={!!mobilePrimaryCta.href}
              size="compact"
              iconVisibility="always"
              iconOnly
              className="absolute right-3 top-0 z-[4] -translate-y-[10%]"
            />
          ) : null}

          <div className="relative overflow-visible rounded-full border border-transparent px-2.5 py-2.5 shadow-none">
            <LiquidGlassBackdrop variant="shell" className="nav-shell-backdrop rounded-[inherit]" />

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 -top-px z-[1] h-px rounded-full bg-gradient-to-r from-transparent via-accent/35 to-transparent"
            />

            <div className="relative z-[2] flex items-center justify-between gap-1">
              {items.map((item, index) => {
                const Icon = iconRegistry[item.id];
                const itemIsActive = isActive(item);

                if (!Icon) {
                  return null;
                }

                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    aria-label={item.isNew ? `${item.label}, new` : item.label}
                    aria-current={itemIsActive ? "page" : undefined}
                    onClick={(event) => handleNavClick(event, item)}
                    className={cn(
                      "relative flex flex-1 items-center justify-center rounded-full py-2.5 text-text-secondary transition-colors duration-200",
                      itemIsActive ? "text-text-primary" : "hover:text-text-primary",
                    )}
                  >
                    {itemIsActive ? (
                      <motion.span
                        layoutId="mobile-nav-active-pill"
                        className={cn(
                          "pointer-events-none absolute bottom-full z-[3] mb-3 inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2",
                          index === 0
                            ? "left-0"
                            : index === items.length - 1
                              ? "right-0"
                              : "left-1/2 -translate-x-1/2",
                        )}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      >
                        <span className="absolute inset-0 rounded-full border border-accent/16 bg-white/94 shadow-[0_12px_28px_rgba(88,28,135,0.08)] backdrop-blur-md" />
                        <span
                          aria-hidden
                          className="absolute inset-px rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.82)_100%)]"
                        />
                        <span
                          aria-hidden
                          className={cn(
                            "absolute -bottom-1.5 h-3.5 w-3.5 rotate-45 rounded-[4px] border-r border-b border-accent/16 bg-white/92",
                            index === 0
                              ? "left-7"
                              : index === items.length - 1
                                ? "right-7"
                                : "left-1/2 -translate-x-1/2",
                          )}
                        />
                        <span className="relative z-[1] whitespace-nowrap text-[13px] font-semibold tracking-tight text-text-primary">
                          {item.label}
                        </span>
                      </motion.span>
                    ) : null}

                    <motion.span
                      className={cn(
                        "relative flex size-11 items-center justify-center rounded-full transition-colors duration-200",
                        itemIsActive ? "text-text-primary" : "",
                      )}
                      animate={{
                        y: itemIsActive ? -1.5 : 0,
                        scale: itemIsActive ? 1.04 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 360, damping: 24 }}
                    >
                      {itemIsActive ? (
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-full border border-accent/16 bg-white/70 shadow-[0_8px_20px_rgba(88,28,135,0.08)]"
                        />
                      ) : null}
                      <Icon
                        className={cn(
                          "relative z-[1] size-[21px]",
                          itemIsActive ? "stroke-[1.7px]" : "stroke-[1.5px]",
                        )}
                      />
                    </motion.span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </motion.nav>

      <motion.nav
        ref={navbarRef}
        role="navigation"
        aria-label="Main navigation"
        className="fixed bottom-4 left-[50vw] z-50 hidden w-[min(calc(100vw-1.25rem),31rem)] -translate-x-1/2 items-center justify-between gap-2 rounded-[1.75rem] border border-transparent bg-transparent px-2 py-2 shadow-none sm:bottom-5 sm:flex sm:w-auto sm:justify-start sm:gap-1 sm:rounded-full"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.1 }}
        onHoverStart={() => {
          setHovered(true);
          syncItemCenters();
        }}
        onHoverEnd={() => {
          setHovered(false);
          setMouseX(null);
          syncItemCenters();
        }}
      >
        <LiquidGlassBackdrop
          variant="shell"
          className="nav-shell-backdrop rounded-[inherit]"
        />

        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-px left-1/2 z-[1] h-px -translate-x-1/2 rounded-full
                     bg-gradient-to-r from-transparent via-accent/42 to-transparent"
          animate={{ opacity: hovered ? 0.9 : 0.75, width: hovered ? "55%" : "25%" }}
          transition={{ duration: 0.35 }}
        />

        <div className="relative z-[1] flex min-w-0 flex-1 items-center justify-between gap-0.5 sm:flex-none sm:gap-1">
          {items.map((item) => {
            const Icon = iconRegistry[item.id];

            if (!Icon) {
              return null;
            }

            return (
              <NavItem
                key={item.id}
                id={item.id}
                to={item.path}
                label={item.label}
                Icon={Icon}
                isActive={isActive(item)}
                iconSize={getIconSize(item.id)}
                isNew={item.isNew}
                onClick={(event) => handleNavClick(event, item)}
              />
            );
          })}
        </div>

        <div aria-hidden className="relative z-[1] mx-1 hidden h-6 w-px shrink-0 bg-border sm:block" />

        <div className="relative z-[1] flex shrink-0 items-center gap-1 pl-1 sm:gap-1.5 sm:pr-1">
          {ctas.map((cta) => (
            <CTAButton key={cta.label} config={cta} />
          ))}
        </div>
      </motion.nav>
    </>
  );
};
