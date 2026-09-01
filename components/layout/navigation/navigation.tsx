"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PhoneCall, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { cn } from "@/lib/utils";
import { navigationConfig } from "@/data/navigation";
import type { CTAConfig, NavigationConfig, NavItemConfig } from "@/types";
import { LiquidGlassBackdrop } from "@/components/ui/liquid-glass-backdrop";
import { ShinyIconLink } from "@/components/ui/shiny-icon-link";
import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";
import { CTAButton } from "./cta-button";
import { iconRegistry } from "./icon-registry";
import { NavItem } from "./nav-item";

interface NavigationProps {
  content?: NavigationConfig;
}

const MOBILE_SECTION_ORDER = ["home", "portfolio", "testimonials", "services", "faq"] as const;

function getMobileSectionOrder(item: NavItemConfig, fallbackIndex: number) {
  const sectionId = item.sectionId ?? item.id;
  const sectionIndex = MOBILE_SECTION_ORDER.indexOf(
    sectionId as (typeof MOBILE_SECTION_ORDER)[number],
  );

  return sectionIndex === -1 ? MOBILE_SECTION_ORDER.length + fallbackIndex : sectionIndex;
}

function resolveCTAIcon(config: CTAConfig) {
  switch (config.icon) {
    case "phone-call":
    default:
      return PhoneCall;
  }
}

export const Navigation = ({ content = navigationConfig }: NavigationProps) => {
  const pathname = usePathname();
  const { scrollTo } = useSmoothScroll();
  const navbarRef = useRef<HTMLElement>(null);
  const mobileTooltipTimeoutRef = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [itemCenters, setItemCenters] = useState<Record<string, number>>({});
  const [activeSectionId, setActiveSectionId] = useState("home");
  const [mobileTooltipId, setMobileTooltipId] = useState<string | null>(null);

  const { items } = content;
  const mobileItems = items
    .map((item, index) => ({ item, index }))
    .sort(
      (left, right) =>
        getMobileSectionOrder(left.item, left.index) -
        getMobileSectionOrder(right.item, right.index),
    )
    .map(({ item }) => item);
  const ctas = content.ctas.map((cta) => ({
    ...cta,
    Icon: resolveCTAIcon(cta),
  }));
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
  const mobileActions = [
    {
      label: mobilePrimaryCta?.label ?? "Contact",
      target: mobilePrimaryCta?.href ?? mobilePrimaryCta?.path ?? "/contact",
      Icon: mobilePrimaryCta?.Icon ?? PhoneCall,
      tone: "primary" as const,
    },
    {
      label: "Shop",
      target: "/shop",
      Icon: ShoppingBag,
      tone: "secondary" as const,
    },
  ];
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

      const target = document.querySelector<HTMLElement>(
        `[data-nav-section="${sectionId}"]`,
      );

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
      if (mobileTooltipTimeoutRef.current !== null) {
        window.clearTimeout(mobileTooltipTimeoutRef.current);
      }

      setMobileTooltipId(item.id);
      mobileTooltipTimeoutRef.current = window.setTimeout(() => {
        setMobileTooltipId((current) => (current === item.id ? null : current));
        mobileTooltipTimeoutRef.current = null;
      }, 2000);

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
    return () => {
      if (mobileTooltipTimeoutRef.current !== null) {
        window.clearTimeout(mobileTooltipTimeoutRef.current);
      }
    };
  }, []);

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
    const baseSize = 24;
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
        className="fixed left-1/2 z-50 w-fit max-w-[calc(100vw-1rem)] -translate-x-1/2 sm:hidden"
        style={{
          bottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        }}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.1 }}
      >
        <div className="relative flex items-end justify-center gap-2">
          <div className="relative w-[11.75rem] shrink-0 overflow-visible rounded-full border border-transparent px-1 py-1 shadow-none">
            <LiquidGlassBackdrop variant="shell" className="nav-shell-backdrop rounded-[inherit]" />

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-7 -top-px z-[1] h-px rounded-full bg-gradient-to-r from-transparent via-accent/35 to-transparent"
            />

            <div className="relative z-[2] grid grid-cols-5 items-center gap-0.5">
              {mobileItems.map((item, index) => {
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
                      "relative flex min-w-0 items-center justify-center rounded-full py-0.5 text-black transition-colors duration-200",
                      itemIsActive ? "text-black" : "text-black/80 hover:text-black",
                    )}
                  >
                    <AnimatePresence>
                      {mobileTooltipId === item.id ? (
                        <motion.span
                          layoutId="mobile-nav-active-pill"
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{
                            opacity: 0,
                            y: -6,
                            scale: 0.97,
                            transition: { duration: 0.22, ease: "easeOut" },
                          }}
                          className={cn(
                            "pointer-events-none absolute bottom-full z-[3] mb-3 inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2",
                            index === 0
                              ? "left-0"
                              : index === mobileItems.length - 1
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
                                : index === mobileItems.length - 1
                                  ? "right-7"
                                  : "left-1/2 -translate-x-1/2",
                            )}
                          />
                          <span className="relative z-[1] whitespace-nowrap text-[13px] font-semibold tracking-tight text-text-primary">
                            {item.label}
                          </span>
                        </motion.span>
                      ) : null}
                    </AnimatePresence>

                    <motion.span
                      className={cn(
                        "relative flex size-8 items-center justify-center rounded-full text-black transition-colors duration-200",
                        itemIsActive ? "text-black" : "",
                      )}
                      animate={{
                        y: itemIsActive ? -1 : 0,
                        scale: itemIsActive ? 1.03 : 1,
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
                          "relative z-[1] size-[16px] text-black",
                          itemIsActive ? "stroke-[1.7px]" : "stroke-[1.5px]",
                        )}
                      />
                    </motion.span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="relative flex h-11 w-[4.85rem] shrink-0 overflow-visible rounded-full border border-transparent px-1 py-1 shadow-none">
            <LiquidGlassBackdrop variant="shell" className="nav-shell-backdrop rounded-[inherit]" />

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-4 -top-px z-[1] h-px rounded-full bg-gradient-to-r from-transparent via-accent/35 to-transparent"
            />

            <div className="relative z-[2] grid w-full grid-cols-2 items-center justify-items-center gap-0.5">
              {mobileActions.map((action) => {
                const Icon = action.Icon;
                const isInternal = action.target.startsWith("/");
                const opensNewTab =
                  !isInternal &&
                  !action.target.startsWith("mailto:") &&
                  !action.target.startsWith("tel:");
                const actionIsActive =
                  isInternal &&
                  (pathname === action.target ||
                    (action.target !== "/" && pathname.startsWith(`${action.target}/`)));

                return (
                  <ShinyIconLink
                    key={action.label}
                    href={action.target}
                    label={action.label}
                    Icon={Icon}
                    size="nav"
                    active={actionIsActive}
                    external={opensNewTab}
                    tone={action.tone === "primary" ? "#a855f7" : "#09090b"}
                  />
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
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-50 hidden max-w-[calc(100vw-1.25rem)] w-auto -translate-x-1/2 items-center justify-start gap-1 rounded-full border border-transparent bg-transparent px-2 py-2 shadow-none sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:flex"
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
