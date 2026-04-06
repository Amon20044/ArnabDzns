"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { navigationConfig } from "@/data/navigation";
import { CTAButton } from "./cta-button";
import { iconRegistry } from "./icon-registry";
import { NavItem } from "./nav-item";

export const Navigation = () => {
  const pathname = usePathname();
  const navbarRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [itemCenters, setItemCenters] = useState<Record<string, number>>({});

  const { items, ctas } = navigationConfig;

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

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
    const baseSize = 18;
    const maxSize = 28;

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
      <svg
        aria-hidden
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter id="lg-distort">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.015 0.02"
              numOctaves="2"
              seed="3"
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <motion.nav
        ref={navbarRef}
        role="navigation"
        aria-label="Main navigation"
        className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1
                   rounded-full border border-border bg-white/90 px-2 py-2
                   shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]
                   backdrop-blur-xl"
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
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-px left-1/2 h-px -translate-x-1/2 rounded-full
                     bg-gradient-to-r from-transparent via-accent to-transparent"
          animate={{ opacity: hovered ? 0.7 : 0.3, width: hovered ? "55%" : "25%" }}
          transition={{ duration: 0.35 }}
        />

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
              isActive={isActive(item.path)}
              iconSize={getIconSize(item.id)}
              isNew={item.isNew}
            />
          );
        })}

        <div aria-hidden className="mx-1 h-6 w-px shrink-0 bg-border" />

        <div className="flex items-center gap-1.5 pr-1">
          {ctas.map((cta) => (
            <CTAButton key={cta.label} config={cta} />
          ))}
        </div>
      </motion.nav>
    </>
  );
};
