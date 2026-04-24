"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, Send, X } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { renderStatusBadgeLeading } from "@/components/ui/status-badge-leading";
import { StatusBadge } from "@/components/ui/status-badge";
import { Heading, Text } from "@/components/ui/typography";
import { buildWhatsAppUrl } from "@/data/site";

const ease = [0.22, 1, 0.36, 1] as const;
const spring = { type: "spring", stiffness: 260, damping: 24 } as const;

interface BookCallButtonProps {
  label: string;
}

export function BookCallButton({ label }: BookCallButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PrimaryButton
        label={label}
        Icon={CalendarClock}
        tone="white"
        onClick={() => setOpen(true)}
      />
      <BookCallModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function BookCallModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !submitting;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);

    const url = buildWhatsAppUrl({
      name: trimmedName,
      brand: company.trim() || undefined,
      inquiryType: "a 15-minute intro call",
      message:
        "I'd like to book a 15-minute intro call. Please share a slot that works for you.",
      source: "book-15-min",
    });

    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    window.setTimeout(() => {
      setSubmitting(false);
      onClose();
      setName("");
      setCompany("");
    }, 350);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <motion.div
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.42)_0%,rgba(76,29,149,0.46)_100%)] backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-[1.9rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,247,252,0.94)_100%)] shadow-[0_32px_72px_rgba(15,23,42,0.22)] max-md:!shadow-none sm:rounded-[1.9rem]"
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={spring}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,180,254,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.5),transparent_38%)]"
            />

            <div className="relative flex items-start justify-between gap-4 px-6 pb-2 pt-6 sm:px-8 sm:pt-7">
              <div className="flex flex-col items-start gap-3">
                <StatusBadge
                  compact
                  interactive={false}
                  tone="#2f1544"
                  textColor="#faf5ff"
                  iconColor="#faf5ff"
                  leading={renderStatusBadgeLeading("clock")}
                >
                  15-min intro call
                </StatusBadge>

                <Heading
                  variant="h4"
                  as="h2"
                  id={titleId}
                  className="tracking-[-0.03em]"
                >
                  Let&apos;s get on a{" "}
                  <span className="font-secondary italic text-accent">call.</span>
                </Heading>

                <Text
                  variant="p3"
                  id={descriptionId}
                  className="max-w-[34ch] text-pretty"
                >
                  Quick intro over WhatsApp. Drop your name and brand so I can
                  prep before we chat.
                </Text>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-text-primary shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-0.5 max-md:!shadow-none"
              >
                <X className="size-4" strokeWidth={2.2} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative px-6 pb-6 pt-5 sm:px-8 sm:pb-8"
            >
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                    Your name
                  </span>
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Eg. Priya Sharma"
                    autoFocus
                    className="h-11 rounded-xl border-black/10 bg-white px-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus-visible:border-accent/60 focus-visible:ring-accent/20 max-md:!shadow-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                    Company / Brand{" "}
                    <span className="font-normal normal-case tracking-normal text-text-secondary/70">
                      (optional)
                    </span>
                  </span>
                  <Input
                    type="text"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Eg. Acme Studio"
                    className="h-11 rounded-xl border-black/10 bg-white px-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus-visible:border-accent/60 focus-visible:ring-accent/20 max-md:!shadow-none"
                  />
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full px-3 py-2 text-[13px] font-semibold text-text-secondary transition-colors hover:text-text-primary"
                >
                  Cancel
                </button>
                <PrimaryButton
                  label={
                    submitting ? "Opening WhatsApp..." : "Confirm on WhatsApp"
                  }
                  type="submit"
                  tone="whatsapp"
                  Icon={Send}
                  disabled={!canSubmit}
                />
              </div>

              <p className="mt-4 text-center text-[11px] uppercase tracking-[0.14em] text-text-secondary/70">
                Message opens in WhatsApp, prefilled
              </p>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
