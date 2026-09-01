"use client";

import Lenis, { type ScrollToOptions } from "lenis";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

type ModalScrollLockDetail = {
  locked: boolean;
};

type SmoothScrollTarget = number | string | HTMLElement;

type SmoothScrollContextValue = {
  scrollTo: (target: SmoothScrollTarget, options?: ScrollToOptions) => void;
};

const MODAL_SCROLL_LOCK_EVENT = "app:modal-scroll-lock";
const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

export function SmoothScrollProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const scrollRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      anchors: {
        offset: -92,
        lerp: 0.16,
      },
      autoRaf: true,
      autoResize: true,
      lerp: 0.14,
      overscroll: true,
      respectReducedMotion: true,
      smoothWheel: true,
      stopInertiaOnNavigate: true,
      syncTouch: false,
      wheelMultiplier: 1,
    });

    scrollRef.current = instance;
    instance.resize();

    return () => {
      instance.destroy();
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
      window.requestAnimationFrame(() => scrollRef.current?.resize());
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
    const frame = window.requestAnimationFrame(() => scrollRef.current?.resize());
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  const scrollTo = useCallback(
    (target: SmoothScrollTarget, options?: ScrollToOptions) => {
      const instance = scrollRef.current;

      if (instance) {
        instance.scrollTo(target, options);
        return;
      }

      const immediate = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({
          block: "start",
          behavior: immediate ? "auto" : "smooth",
        });
      }
    },
    [],
  );

  const value = useMemo(() => ({ scrollTo }), [scrollTo]);

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  const context = useContext(SmoothScrollContext);

  if (!context) {
    throw new Error("useSmoothScroll must be used inside SmoothScrollProvider");
  }

  return context;
}
