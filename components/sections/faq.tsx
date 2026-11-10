"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ArnabCharacter } from "@/components/illustrations/arnab-character";
import { ShapeGlyph } from "@/components/illustrations/stickers";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Heading, Text } from "@/components/ui/typography";
import { faqSection } from "@/data/faq";
import { cn } from "@/lib/utils";
import type { FAQItem, FAQSectionConfig, HeroCTAConfig } from "@/types";

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
        "tray-card group/faq overflow-hidden transition-shadow duration-200",
        isOpen && "ring-2 ring-purple-300",
      )}
    >
      <button
        type="button"
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <Heading
          variant="h5"
          as="h3"
          className="text-[1rem] font-medium leading-snug text-text-primary sm:text-[1.08rem]"
        >
          {item.question}
        </Heading>

        <span
          aria-hidden
          className={cn(
            "relative flex size-7 shrink-0 items-center justify-center rounded-full bg-black text-white transition-[transform,background-color] duration-300 ease-out group-hover/faq:scale-110",
            isOpen && "rotate-180 bg-purple-600",
          )}
        >
          <span className="relative block size-3">
            <span className="absolute left-0 top-1/2 h-[2px] w-3 -translate-y-1/2 rounded-full bg-current" />
            <span
              className={cn(
                "absolute left-1/2 top-0 h-3 w-[2px] -translate-x-1/2 rounded-full bg-current transition-transform duration-300",
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
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <Text
              variant="p2"
              className="max-w-[62ch] whitespace-pre-line text-pretty text-text-secondary"
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

  const ctaIcon = resolveCTAIcon(content.cta);
  const titleLines = Array.isArray(content.title) ? content.title : [content.title];

  return (
    <section className={cn("page-section-frame page-reveal relative", "max-md:!p-0", className)}>
      {/* Two columns on desktop: the question sits beside the answers instead
          of stacked above them, with the "still stuck?" card pinned under it. */}
      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="flex flex-col items-center text-center lg:sticky lg:top-28 lg:items-start lg:text-left">
          <span className="section-tag">
            <ShapeGlyph shape="circle" className="text-accent" />
            {content.eyebrow}
          </span>
          <Heading variant="h2" className="mt-5">
            {titleLines.map((line, index) => (
              <span key={`${line}-${index}`} className="block">
                {line}
              </span>
            ))}
          </Heading>
          {content.description ? (
            <Text variant="p1" className="mt-4 max-w-md text-pretty">
              {content.description}
            </Text>
          ) : null}

          {content.helperText || content.cta ? (
            <div className="tray mt-8 w-full max-w-sm">
              <div className="tray-card flex items-center gap-4 p-4 text-left">
                <span
                  aria-hidden
                  className="relative block size-16 shrink-0 -rotate-6 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_30%,#c084fc,#7e22ce)] shadow-[0_4px_0_var(--color-purple-900)]"
                >
                  <span className="absolute left-1/2 top-[6%] block w-[185%] -translate-x-1/2">
                    <ArnabCharacter title="" />
                  </span>
                </span>
                <div className="min-w-0">
                  {content.helperText ? (
                    <p className="text-[0.95rem] font-medium leading-snug text-text-primary">
                      {content.helperText}
                    </p>
                  ) : null}
                  {content.cta ? (
                    <PrimaryButton
                      label={content.cta.label}
                      href={content.cta.href}
                      external={content.cta.external}
                      Icon={ctaIcon}
                      iconVisibility="hover"
                      tone="accent"
                      size="compact"
                      className="mt-3"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="tray flex w-full flex-col gap-2.5 text-left">
          {content.items.map((item) => (
            <FAQAccordionItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
