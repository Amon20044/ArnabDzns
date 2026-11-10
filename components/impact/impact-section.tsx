"use client";

import { motion } from "framer-motion";
import { renderStatusBadgeLeading } from "@/components/ui/status-badge-leading";
import { Heading, Text } from "@/components/ui/typography";
import { impactSection } from "@/data/impact";
import type { ImpactSectionConfig } from "@/types";
import { cn } from "@/lib/utils";
import { ImpactCard } from "./impact-card";

interface ImpactSectionProps {
  content?: ImpactSectionConfig;
  className?: string;
}

export function ImpactSection({
  content = impactSection,
  className,
}: ImpactSectionProps) {
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
    <section className={cn("page-reveal relative text-text-primary", className)}>
        <div className="relative z-10 px-0 py-2 md:px-10 md:py-10">
          <header className="flex flex-col items-center text-center">
            <div className="flex w-full flex-col items-center">
              <div className="flex flex-wrap justify-center gap-2">
                {content.hero.badges?.map((badge, index) => (
                  <span
                    key={badge.id ?? `${badge.label}-${index}`}
                    className={cn("section-tag", badge.showInMobile === false && "hidden sm:inline-flex")}
                  >
                    {badge.icon === "indicator" ? (
                      <span className="size-2 rounded-full bg-[#22c55e]" />
                    ) : (
                      renderStatusBadgeLeading(badge)
                    )}
                    {badge.label}
                  </span>
                ))}
              </div>

              <Heading variant="h2" className="mt-5 max-w-4xl text-text-primary">
                {titleLines.map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {index > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </Heading>

              {content.hero.description ? (
                <Text variant="p1" className="mt-4 max-w-xl text-pretty text-text-secondary">
                  {content.hero.description}
                </Text>
              ) : null}
            </div>

          </header>

          <motion.div className="mt-8">
            <div className="grid auto-flow-dense grid-cols-2 gap-4 sm:grid-cols-6 md:auto-rows-[minmax(12rem,1fr)] md:grid-cols-6 lg:auto-rows-[minmax(12.5rem,1fr)] lg:grid-cols-6">
              {cards.map((card) => (
                <ImpactCard key={card.id} card={card} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>
  );
}
