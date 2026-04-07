"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type LocomotiveScroll from "locomotive-scroll";

export function LocomotiveScrollProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const scrollRef = useRef<LocomotiveScroll | null>(null);

  useEffect(() => {
    let isMounted = true;

    void import("locomotive-scroll").then(({ default: LocomotiveScrollClass }) => {
      if (!isMounted || scrollRef.current) {
        return;
      }

      const instance = new LocomotiveScrollClass({
        lenisOptions: {
          autoResize: true,
          lerp: 0.09,
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 0.9,
        },
      });

      scrollRef.current = instance;
      instance.resize();
    });

    return () => {
      isMounted = false;
      scrollRef.current?.destroy();
      scrollRef.current = null;
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      scrollRef.current?.resize();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return children;
}
