"use client";

import { LayoutGroup, motion } from "framer-motion";
import { useState } from "react";
import { renderStatusBadgeLeading } from "@/components/ui/status-badge-leading";
import { StatusBadge } from "@/components/ui/status-badge";
import { Heading, Text } from "@/components/ui/typography";
import { impactSection } from "@/data/impact";
import type { ImpactCardConfig, ImpactSectionConfig } from "@/types";
import { cn } from "@/lib/utils";
import { ImpactCard } from "./impact-card";
import { ImpactExpandedModal } from "./impact-expanded-modal";

interface ImpactSectionProps {
  content?: ImpactSectionConfig;
  className?: string;
}

export function ImpactSection({
  content = impactSection,
  className,
}: ImpactSectionProps) {
  const [selectedCard, setSelectedCard] = useState<ImpactCardConfig | null>(null);

  const cards = [...content.cards]
    .filter((card) => card.active !== false)
    .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0));

  const titleLines = Array.isArray(content.hero.title)
    ? content.hero.title
    : content.hero.title
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

  return (
    <LayoutGroup id="impact-showcase">
      <section
        className={cn(
          "page-reveal relative overflow-hidden rounded-[2.25rem] border border-border-accent/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,247,252,0.96)_100%)] text-text-primary shadow-[0_34px_110px_rgba(88,28,135,0.12)]",
          "max-md:!rounded-none max-md:!border-transparent max-md:!bg-none max-md:!shadow-none",
          className,
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-95 max-md:hidden"
          style={{
            background:
              "radial-gradient(circle at 16% 14%, rgba(168,85,247,0.14) 0%, transparent 26%), radial-gradient(circle at 82% 12%, rgba(14,165,233,0.12) 0%, transparent 22%), radial-gradient(circle at 76% 78%, rgba(244,63,94,0.1) 0%, transparent 24%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent max-md:hidden"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.36)_0%,transparent_18%)] max-md:hidden"
        />

        <div className="relative z-10 px-5 py-6 sm:px-7 sm:py-8 md:px-10 md:py-10 max-md:!px-0 max-md:!py-0">
          <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-3">
                {content.hero.badges?.map((badge, index) => (
                  <StatusBadge
                    key={badge.id ?? `${badge.label}-${index}`}
                    interactive={false}
                    tone={badge.tone}
                    textColor={badge.textColor}
                    iconColor={badge.iconColor}
                    indicatorColor={badge.indicatorColor}
                    pulse={badge.pulse}
                    showIndicator={badge.icon === "indicator"}
                    leading={renderStatusBadgeLeading(badge)}
                  >
                    {badge.label}
                  </StatusBadge>
                ))}
              </div>

              {/* {content.hero.eyebrow ? (
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-dark/58">
                  {content.hero.eyebrow}
                </p>
              ) : null} */}

              <Heading variant="h2" className="mt-4 max-w-4xl text-text-primary">
                {titleLines.map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {index > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </Heading>

              {content.hero.description ? (
                <Text variant="p1" className="mt-5 max-w-2xl text-text-secondary">
                  {content.hero.description}
                </Text>
              ) : null}
            </div>

          </header>

          <motion.div
            animate={
              selectedCard
                ? { scale: 0.985, opacity: 0.42, filter: "blur(6px)" }
                : { scale: 1, opacity: 1, filter: "blur(0px)" }
            }
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
            aria-hidden={selectedCard ? true : undefined}
          >
            <div className="grid auto-flow-dense grid-cols-2 gap-4 sm:grid-cols-6 md:auto-rows-[minmax(12rem,1fr)] md:grid-cols-6 lg:auto-rows-[minmax(12.5rem,1fr)] lg:grid-cols-6">
              {cards.map((card) => (
                <ImpactCard
                  key={card.id}
                  card={card}
                  onSelect={setSelectedCard}
                  hidden={selectedCard?.id === card.id}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <ImpactExpandedModal
        card={selectedCard}
        cta={content.modalCTA}
        onClose={() => setSelectedCard(null)}
      />
    </LayoutGroup>
  );
}
