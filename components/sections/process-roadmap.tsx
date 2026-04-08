"use client";

import { motion } from "framer-motion";
import { Hero } from "@/components/sections/hero";
import { Heading, Text } from "@/components/ui/typography";
import { processRoadmapSection } from "@/data/process-roadmap";
import { cn } from "@/lib/utils";
import type {
  HeroSectionConfig,
  RoadmapStartSide,
  RoadmapStepConfig,
} from "@/types";

interface ProcessRoadmapProps {
  hero?: HeroSectionConfig;
  items?: RoadmapStepConfig[];
  startFrom?: RoadmapStartSide;
  className?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;
const stepViewport = { amount: 0.45, once: false } as const;

function resolveStepSide(startFrom: RoadmapStartSide, index: number) {
  const isEven = index % 2 === 0;
  if (startFrom === "left") {
    return isEven ? "left" : "right";
  }

  return isEven ? "right" : "left";
}

function resolveStepLabel(item: RoadmapStepConfig, index: number) {
  return item.label ?? `Step #${index + 1}`;
}

export function ProcessRoadmap({
  hero = processRoadmapSection.hero,
  items = processRoadmapSection.items,
  startFrom = processRoadmapSection.startFrom ?? "right",
  className,
}: ProcessRoadmapProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section
      className={cn(
        "page-surface page-reveal relative overflow-hidden p-8 md:p-10 lg:p-12",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.10),transparent_46%)]"
      />

      <Hero
        content={hero}
        className="min-h-0 py-0 sm:py-0"
        childrenClassName="mt-14"
      >
        <div className="relative mx-auto w-full max-w-5xl">
          <motion.div
            aria-hidden
            initial={{ scaleY: 0, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ amount: 0.2, once: false }}
            transition={{ duration: 0.75, ease }}
            className="absolute bottom-10 left-3.5 top-4 w-px origin-top bg-[linear-gradient(to_bottom,transparent_0%,rgba(17,24,39,0.24)_7%,rgba(17,24,39,0.84)_18%,rgba(17,24,39,0.84)_82%,rgba(17,24,39,0.24)_93%,transparent_100%)] md:left-1/2 md:-translate-x-1/2"
          />

          <div className="flex flex-col gap-10 md:gap-6">
            {items.map((item, index) => {
              const side = resolveStepSide(startFrom, index);
              const startsLeft = side === "left";

              return (
                <motion.div
                  key={item.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={stepViewport}
                  className="grid grid-cols-[28px_minmax(0,1fr)] gap-5 md:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] md:gap-8"
                >
                  <div
                    className={cn(
                      "col-start-2 md:row-start-1",
                      startsLeft
                        ? "md:col-start-1 md:justify-self-end"
                        : "md:col-start-3 md:justify-self-start",
                    )}
                  >
                    <motion.article
                      variants={{
                        hidden: {
                          opacity: 0,
                          x: startsLeft ? -48 : 48,
                          y: 22,
                          filter: "blur(14px)",
                        },
                        visible: {
                          opacity: 1,
                          x: 0,
                          y: 0,
                          filter: "blur(0px)",
                          transition: { duration: 0.72, ease, delay: 0.14 },
                        },
                      }}
                      className="w-full max-w-sm rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.90)_100%)] p-6 shadow-[0_22px_54px_rgba(15,23,42,0.10)] ring-1 ring-black/5 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_28px_68px_rgba(15,23,42,0.14)] sm:p-7"
                    >
                      <Text
                        as="span"
                        variant="p3"
                        className="text-[0.72rem] uppercase tracking-[0.16em] text-text-secondary/80"
                      >
                        {resolveStepLabel(item, index)}
                      </Text>
                      <Heading variant="h5" as="h3" className="mt-4 text-balance">
                        {item.title}
                      </Heading>
                      <Text variant="p2" className="mt-4 text-pretty">
                        {item.description}
                      </Text>
                    </motion.article>
                  </div>

                  <div className="relative col-start-1 row-start-1 min-h-[1px] md:col-start-2">
                    <motion.span
                      aria-hidden
                      variants={{
                        hidden: {
                          scale: 0.86,
                          backgroundColor: "rgb(229 231 235)",
                          boxShadow: "0 0 0 rgba(17,24,39,0)",
                        },
                        visible: {
                          scale: 1,
                          backgroundColor: "rgb(17 24 39)",
                          boxShadow: "0 0 0 6px rgba(255,255,255,0.92)",
                          transition: { duration: 0.34, ease, delay: 0.08 },
                        },
                      }}
                      className="absolute left-1/2 top-8 size-3 -translate-x-1/2 rounded-full"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Hero>
    </section>
  );
}
