"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type LocomotiveScroll from "locomotive-scroll";

type ModalScrollLockDetail = {
  locked: boolean;
};

const MODAL_SCROLL_LOCK_EVENT = "app:modal-scroll-lock";

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
    const handleModalScrollLock = (event: Event) => {
      const { locked } = (event as CustomEvent<ModalScrollLockDetail>).detail;

      if (locked) {
        scrollRef.current?.stop();
        return;
      }

      scrollRef.current?.start();
      window.requestAnimationFrame(() => {
        scrollRef.current?.resize();
      });
    };

    window.addEventListener(
      MODAL_SCROLL_LOCK_EVENT,
      handleModalScrollLock as EventListener,
    );

    return () => {
      window.removeEventListener(
        MODAL_SCROLL_LOCK_EVENT,
        handleModalScrollLock as EventListener,
      );
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
