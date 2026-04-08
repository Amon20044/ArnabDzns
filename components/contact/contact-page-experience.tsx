"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  Mail,
  MessageCircleMore,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { Hero } from "@/components/sections/hero";
import { StatusBadge } from "@/components/ui/status-badge";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Heading, Text } from "@/components/ui/typography";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";
import type { HeroSectionConfig } from "@/types";

const heroContent: HeroSectionConfig = {
  badges: [
    {
      id: "contact-primary",
      label: "Contact",
      icon: "none",
      tone: "#18181b",
      textColor: "#fafafa",
      iconColor: "#fafafa",
    },
    {
      id: "contact-response",
      label: "Replies within 1 business day",
      icon: "indicator",
      tone: "#059669",
      indicatorColor: "#34d399",
      pulse: true,
    },
  ],
  title: ["Tell me what you are building."],
  description:
    "Share the scope, timeline, and goal. If live chat is faster, use quick connect.",
  cta: false,
};

const modalEase = [0.22, 1, 0.36, 1] as const;

export function ContactPageExperience() {
  const [isQuickConnectOpen, setIsQuickConnectOpen] = useState(false);

  return (
    <div className="flex flex-1">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-32 pt-16 md:px-10 md:pb-40 md:pt-24">
        <section className="page-surface page-reveal relative overflow-hidden p-8 md:p-10 lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_42%),radial-gradient(circle_at_left_center,rgba(255,255,255,0.42),transparent_30%)]" />

          <Hero
            content={heroContent}
            className="min-h-0 py-2 sm:py-4"
            childrenClassName="mt-12"
          >
            <div className="mx-auto max-w-4xl">
              <div className="liquid-glass-shell relative overflow-hidden rounded-[2rem] border border-white/70 p-6 text-left shadow-[0_22px_58px_rgba(88,28,135,0.12)] sm:p-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
                />
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <StatusBadge tone="#a855f7" iconColor="#f5e1ff">
                      Quick connect
                    </StatusBadge>
                    <Heading variant="h5" as="h2" className="mt-4">
                      Need a faster route?
                    </Heading>
                    <Text variant="p2" className="mt-2 max-w-xl">
                      Use quick connect for WhatsApp or call. For full project details, use the
                      form below.
                    </Text>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <PrimaryButton
                      label="Open quick connect"
                      onClick={() => setIsQuickConnectOpen(true)}
                      Icon={MessageCircleMore}
                    />
                    <PrimaryButton
                      label="Email directly"
                      href={`mailto:${siteConfig.contact.emailAddress}`}
                      Icon={Mail}
                      tone="white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Hero>
        </section>

        <section>
          <InquiryForm
            source="contact-page"
            defaultInquiryType="Portfolio website"
            submitLabel="Send message"
          />
        </section>
      </main>

      <QuickConnectDialog
        open={isQuickConnectOpen}
        onClose={() => setIsQuickConnectOpen(false)}
      />
    </div>
  );
}

function QuickConnectDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            aria-label="Close quick connect"
            className="absolute inset-0 bg-[rgba(9,9,11,0.46)] backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.32, ease: modalEase }}
            className="page-surface relative z-[1] w-full max-w-2xl overflow-hidden rounded-[2.1rem] border-white/70 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.24)] sm:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16)_0%,transparent_48%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.45)_0%,transparent_28%)]"
            />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full border border-border-accent/60 bg-white/78 text-text-primary shadow-[0_10px_24px_rgba(88,28,135,0.08)] transition-transform duration-200 hover:-translate-y-0.5 hover:text-accent"
            >
              <X className="size-4.5" />
            </button>

            <div className="relative z-[1] page-stack">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge tone="#18181b" textColor="#fafafa" iconColor="#fafafa">
                  Quick connect
                </StatusBadge>
                <Text as="span" variant="p3" className="sm:hidden">
                  Mobile-first contact actions
                </Text>
                <Text as="span" variant="p3" className="hidden sm:inline text-text-secondary/78">
                  Desktop keeps the focus on WhatsApp and the written brief
                </Text>
              </div>

              <div>
                <Heading variant="h3" as="h2" id={titleId} className="sm:hidden">
                  Pick the fastest lane.
                </Heading>
                <Heading variant="h3" as="h2" id={titleId} className="hidden sm:block">
                  Continue on WhatsApp, then keep the form for the full brief.
                </Heading>
                <Text id={descriptionId} variant="p2" className="mt-3 max-w-xl">
                  Use quick connect when the project is easier to explain live. The landing page
                  form stays the best place for detailed scope, but this sheet is here when speed
                  matters more than polish.
                </Text>
              </div>

              <div className="grid gap-3 sm:hidden">
                <QuickActionCard
                  label={siteConfig.contact.callLabel}
                  value={siteConfig.contact.callDisplay}
                  href={siteConfig.contact.callUrl}
                  Icon={CalendarClock}
                  variant="secondary"
                />
                <QuickActionCard
                  label={siteConfig.contact.whatsappLabel}
                  value={siteConfig.contact.whatsappDisplay}
                  href={siteConfig.contact.whatsappUrl}
                  Icon={MessageCircleMore}
                  variant="primary"
                />
              </div>

              <div className="hidden gap-4 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(240px,0.92fr)]">
                <div className="rounded-[1.8rem] border border-border-accent/65 bg-white/78 p-5 shadow-[0_16px_40px_rgba(88,28,135,0.08)]">
                  <StatusBadge tone="#a855f7" iconColor="#f5e1ff">
                    WhatsApp first
                  </StatusBadge>
                  <Heading variant="h4" as="h3" className="mt-4">
                    Take the short route for early alignment.
                  </Heading>
                  <Text variant="p2" className="mt-3">
                    If the project just needs a fast yes, no, or scope check, WhatsApp is the best
                    path from desktop too.
                  </Text>
                  <div className="mt-6">
                    <PrimaryButton
                      label={siteConfig.contact.whatsappLabel}
                      href={siteConfig.contact.whatsappUrl}
                      external
                      Icon={MessageCircleMore}
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <QuickActionCard
                    label="Email"
                    value={siteConfig.contact.emailAddress}
                    href={`mailto:${siteConfig.contact.emailAddress}`}
                    Icon={Mail}
                    variant="secondary"
                  />
                  <div className="rounded-[1.75rem] border border-border-accent/60 bg-white/78 p-4 shadow-[0_14px_34px_rgba(88,28,135,0.08)]">
                    <Text as="span" variant="p3" className="block text-text-secondary/80">
                      If the scope needs a longer conversation
                    </Text>
                    <Heading variant="h5" as="h3" className="mt-1">
                      Use the form to send the full context first.
                    </Heading>
                    <Text variant="p2" className="mt-2">
                      That makes the WhatsApp follow-up sharper and keeps the next reply useful.
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function QuickActionCard({
  label,
  value,
  href,
  Icon,
  variant,
}: {
  label: string;
  value: string;
  href: string;
  Icon: LucideIcon;
  variant: "primary" | "secondary";
}) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
      className={cn(
        "group rounded-[1.75rem] border p-4 shadow-[0_14px_34px_rgba(88,28,135,0.08)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1",
        variant === "primary"
          ? "border-accent/22 bg-[linear-gradient(135deg,rgba(24,24,27,0.96)_0%,rgba(88,28,135,0.92)_100%)] text-white hover:shadow-[0_22px_44px_rgba(88,28,135,0.16)]"
          : "border-border-accent/65 bg-white/78 text-text-primary hover:border-accent/24 hover:shadow-[0_20px_40px_rgba(88,28,135,0.10)]",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-[1rem]",
            variant === "primary" ? "bg-white/12 text-white" : "bg-accent/10 text-accent",
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <Text
            as="span"
            variant="p3"
            className={cn("block", variant === "primary" ? "text-white/76" : "text-text-secondary/78")}
          >
            {label}
          </Text>
          <Heading
            variant="h5"
            as="h3"
            className={cn("mt-1 text-[1rem]", variant === "primary" ? "text-white" : "")}
          >
            {value}
          </Heading>
        </div>
        <ArrowRight
          className={cn(
            "ml-auto mt-1 size-4.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
            variant === "primary" ? "text-white/82" : "text-text-secondary",
          )}
        />
      </div>
    </a>
  );
}
