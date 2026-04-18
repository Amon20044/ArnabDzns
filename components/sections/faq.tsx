"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/sections/hero";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Heading, Text } from "@/components/ui/typography";
import { faqSection } from "@/data/faq";
import { cn } from "@/lib/utils";
import type {
  FAQItem,
  FAQSectionConfig,
  HeroCTAConfig,
  HeroSectionConfig,
} from "@/types";

interface FAQProps {
  /** Override the default static content (e.g. when wired to a CMS later). */
  content?: FAQSectionConfig;
  className?: string;
}

/**
 * Translate the abstract `HeroCTAConfig.icon` id into the actual lucide
 * component. Mirrors `resolveCTAIcon` inside Hero so the FAQ section can
 * pass the same data shape into PrimaryButton without importing Hero
 * internals.
 */
function resolveCTAIcon(cta: HeroCTAConfig | undefined) {
  if (!cta) {
    return undefined;
  }

  switch (cta.icon) {
    case "none":
      return undefined;
    case "arrow-right":
    default:
      return ArrowRight;
  }
}

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `faq-panel-${item.id}`;
  const buttonId = `faq-trigger-${item.id}`;

  return (
    <div
      className={cn(
        "group/faq relative overflow-hidden rounded-[2rem] border border-border-accent/60 bg-white/92 shadow-[0_18px_44px_rgba(24,24,27,0.06)] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.005] hover:shadow-[0_22px_52px_rgba(24,24,27,0.08)] max-md:!shadow-none max-md:hover:!shadow-none",
        isOpen && "border-border-accent/80 shadow-[0_22px_52px_rgba(24,24,27,0.08)]",
      )}
    >
      <button
        type="button"
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200 hover:bg-white/98 sm:px-8 sm:py-6"
      >
        <Heading
          variant="h5"
          as="h3"
          className="text-text-primary text-base font-semibold leading-snug sm:text-[1.05rem]"
        >
          {item.question}
        </Heading>

        <span
          aria-hidden
          className={cn(
            "relative flex size-10 shrink-0 items-center justify-center rounded-full border border-border-accent/60 bg-white text-text-primary shadow-[0_6px_18px_rgba(24,24,27,0.08)] transition-[transform,background-color,border-color,color] duration-200 group-hover/faq:scale-105 max-md:!shadow-none",
            isOpen && "bg-accent-muted/60 text-accent-dark",
          )}
        >
          <span className="relative block size-4">
            <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
            <span
              className={cn(
                "absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current transition-transform duration-200",
                isOpen && "scale-y-0",
              )}
            />
          </span>
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="mx-6 h-px bg-border-accent/65 sm:mx-8" />
          <div className="px-6 pb-6 pt-5 sm:px-8 sm:pb-7 sm:pt-6">
            <Text
              variant="p2"
              className="whitespace-pre-line text-pretty text-text-secondary"
            >
              {item.answer}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQ({ content = faqSection, className }: FAQProps) {
  const initialOpen =
    content.defaultOpenId === null
      ? null
      : content.defaultOpenId ?? content.items[0]?.id ?? null;

  const [openId, setOpenId] = useState<string | null>(initialOpen);

  // Project the FAQ header onto the shared HeroSectionConfig shape so we
  // reuse the exact same eyebrow/title/description treatment as the rest
  // of the site, rendered through the Hero component.
  const heroContent: HeroSectionConfig = {
    badges: [
      {
        id: "faq",
        label: content.eyebrow,
        icon: "none",
        tone: "#18181b",
        iconColor: "#fafafa",
      },
    ],
    title: content.title,
    description: content.description,
    cta: false,
  };

  const ctaIcon = resolveCTAIcon(content.cta);

  return (
    <section
      className={cn(
        "page-surface page-reveal relative overflow-hidden p-8 md:p-10 lg:p-12",
        "max-md:!rounded-none max-md:!border-transparent max-md:!bg-none max-md:!shadow-none max-md:!backdrop-blur-none max-md:!p-0",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.10),transparent_46%)] max-md:hidden"
      />

      <Hero
        content={heroContent}
        className="min-h-0 py-0 sm:py-0"
        childrenClassName="mt-12"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {content.items.map((item) => (
            <FAQAccordionItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() =>
                setOpenId((current) => (current === item.id ? null : item.id))
              }
            />
          ))}
        </div>

        {content.helperText || content.cta ? (
          <div className="mt-12 flex flex-col items-center gap-4">
            {content.helperText ? (
              <Text variant="p3" className="text-text-secondary">
                {content.helperText}
              </Text>
            ) : null}

            {content.cta ? (
              <PrimaryButton
                label={content.cta.label}
                href={content.cta.href}
                external={content.cta.external}
                Icon={ctaIcon}
                iconVisibility={content.cta.iconVisibility}
              />
            ) : null}
          </div>
        ) : null}
      </Hero>
    </section>
  );
}
