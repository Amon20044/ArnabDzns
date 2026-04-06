"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { NavItem } from "./nav-item";
import { CTAButton } from "./cta-button";
import { iconRegistry } from "./icon-registry";
import { navigationConfig } from "@/data/navigation";

export const Navigation = () => {
  const pathname = usePathname();
  const navbarRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [mouseX, setMouseX] = useState<number | null>(null);

  const { items, ctas } = navigationConfig;
  const totalItems = items.length;

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  // Track mouse X inside navbar for dock effect
  useEffect(() => {
    const el = navbarRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMouseX(e.clientX - rect.left);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  /** Dock magnification: icons near cursor grow, others shrink */
  const getIconSize = (index: number): number => {
    const base = 18;
    const max = 26;
    if (!hovered || mouseX === null || !navbarRef.current) return base;

    const rect = navbarRef.current.getBoundingClientRect();
    const itemWidth = rect.width / totalItems;
    const itemCenter = (index + 0.5) * itemWidth;
    const distance = Math.abs(mouseX - itemCenter);
    const radius = itemWidth * 1.8;

    if (distance > radius) return base;
    const t = 1 - distance / radius;
    return base + (max - base) * Math.pow(t, 2);
  };

  return (
    <>
      {/* Hidden SVG displacement filter — referenced by backdrop-filter: url(#lg-distort)
          in .glass-capsule / .glass-capsule-primary (Chrome/Edge only; degrades gracefully). */}
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
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50
                 flex items-center gap-1
                 bg-white/90 backdrop-blur-xl
                 border border-border
                 rounded-full px-2 py-2
                 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.1 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => {
        setHovered(false);
        setMouseX(null);
      }}
    >
      {/* Top edge purple glow line */}
      <motion.div
        aria-hidden
        className="absolute -top-px left-1/2 -translate-x-1/2 h-px rounded-full
                   bg-gradient-to-r from-transparent via-accent to-transparent pointer-events-none"
        animate={{ width: hovered ? "55%" : "25%", opacity: hovered ? 0.7 : 0.3 }}
        transition={{ duration: 0.35 }}
      />

      {/* Nav items */}
      {items.map((item, index) => {
        const Icon = iconRegistry[item.id];
        if (!Icon) return null;
        return (
          <NavItem
            key={item.id}
            to={item.path}
            label={item.label}
            Icon={Icon}
            isActive={isActive(item.path)}
            iconSize={getIconSize(index)}
          />
        );
      })}

      {/* Divider */}
      <div
        aria-hidden
        className="w-px h-6 bg-border mx-1 shrink-0"
      />

      {/* CTA buttons */}
      <div className="flex items-center gap-1.5 pr-1">
        {ctas.map((cta) => (
          <CTAButton key={cta.label} config={cta} />
        ))}
        
      </div>
    </motion.nav>
    </>
  );
};
