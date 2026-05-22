"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 18,
    filter: "blur(14px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.62,
      ease,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(12px)",
    transition: {
      duration: 0.24,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export function PageTransitionShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowLoader(false);
    }, 760);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          className="flex flex-1 flex-col"
          variants={shouldReduceMotion ? undefined : pageVariants}
          initial={shouldReduceMotion ? false : "initial"}
          animate={shouldReduceMotion ? { opacity: 1 } : "animate"}
          exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showLoader ? (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-background/82 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.42, ease } }}
          >
            <div className="site-loader-card" aria-label="Loading site" role="status">
              <span className="site-loader-mark" />
              <span className="site-loader-line site-loader-line-wide" />
              <span className="site-loader-line site-loader-line-short" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
