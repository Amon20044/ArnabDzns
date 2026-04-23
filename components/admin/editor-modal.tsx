"use client";

import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
} from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODAL_SCROLL_LOCK_EVENT = "app:modal-scroll-lock";

const SIZE_CLASSNAMES = {
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
} as const;

export function EditorModal({
  open,
  onClose,
  title,
  description,
  size = "lg",
  children,
  footer,
  bodyClassName,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: keyof typeof SIZE_CLASSNAMES;
  children: ReactNode;
  footer?: ReactNode;
  bodyClassName?: string;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.dispatchEvent(
      new CustomEvent(MODAL_SCROLL_LOCK_EVENT, {
        detail: { locked: true },
      }),
    );
    document.addEventListener("keydown", handleKeyDown);

    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.dispatchEvent(
        new CustomEvent(MODAL_SCROLL_LOCK_EVENT, {
          detail: { locked: false },
        }),
      );
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 py-5 sm:px-6 sm:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label={`Close ${title}`}
            className="absolute inset-0 bg-[rgba(12,18,28,0.42)] backdrop-blur-[12px]"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={cn(
              "relative z-10 flex max-h-[calc(100vh-2.5rem)] w-full flex-col overflow-hidden rounded-[1.8rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,247,250,0.94)_100%)] shadow-[0_30px_90px_rgba(15,23,42,0.2)] ring-1 ring-black/5 sm:max-h-[calc(100vh-4rem)] sm:rounded-[2rem]",
              SIZE_CLASSNAMES[size],
            )}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-black/6 px-5 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2
                  id={titleId}
                  className="text-[15px] font-semibold tracking-tight text-foreground sm:text-base"
                >
                  {title}
                </h2>
                {description ? (
                  <p
                    id={descriptionId}
                    className="mt-1 text-sm leading-6 text-muted-foreground"
                  >
                    {description}
                  </p>
                ) : null}
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "rounded-full",
                )}
                onClick={onClose}
              >
                <XIcon />
              </button>
            </div>

            <div
              data-lenis-prevent
              data-lenis-prevent-wheel
              data-lenis-prevent-touch
              className={cn(
                "flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6",
                bodyClassName,
              )}
            >
              {children}
            </div>

            {footer ? (
              <div className="border-t border-black/6 bg-white/80 px-5 py-4 sm:px-6">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
