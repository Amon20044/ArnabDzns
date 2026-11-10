"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";
import { Sticker, type StickerKind } from "@/components/illustrations/stickers";
import { Hero } from "@/components/sections/hero";
import { Icon } from "@/components/ui/icon";
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
  /** Kept for content compatibility; the track now runs left to right. */
  startFrom?: RoadmapStartSide;
  className?: string;
}

const NODE_SHAPES: StickerKind[] = ["triangle", "circle", "cross", "square"];

function ProcessStep({
  item,
  index,
  count,
  progress,
  reduce,
}: {
  item: RoadmapStepConfig;
  index: number;
  count: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  // Each node wakes up as the track's fill reaches it.
  const reachedAt = count === 1 ? 0 : index / (count - 1);
  const range = [Math.max(0, reachedAt - 0.12), Math.min(1, reachedAt + 0.02)];
  const nodeScale = useTransform(progress, range, [0.7, 1]);
  const nodeOpacity = useTransform(progress, range, [0.35, 1]);

  return (
    <li className="relative flex flex-col lg:items-center">
      <motion.span
        aria-hidden
        className="relative z-[1] block w-11 max-lg:ml-3"
        style={reduce ? undefined : { scale: nodeScale, opacity: nodeOpacity }}
      >
        <Sticker kind={NODE_SHAPES[index % NODE_SHAPES.length]} className="w-full" />
      </motion.span>

      <article
        className={cn(
          "tray group mt-4 w-full flex-1 text-left transition-transform duration-300 ease-out hover:-translate-y-1",
          index % 2 === 1 && "lg:mt-10",
        )}
      >
        <div className="tray-card flex h-full flex-col p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-[0.55rem] bg-black px-2.5 py-1.5 text-[0.68rem] font-semibold uppercase leading-none tracking-[0.14em] text-white">
              <span className="text-purple-300">Level</span>
              <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            </span>

            {item.icon ? (
              <span className="flex size-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700 shadow-[0_3px_0_var(--color-purple-200)] transition-transform duration-300 ease-out group-hover:rotate-6 group-hover:scale-110">
                <Icon name={item.icon} strokeWidth={1.9} className="size-5" />
              </span>
            ) : null}
          </div>

          <Heading
            variant="h4"
            as="h3"
            className="mt-8 text-balance text-[clamp(1.3rem,1.15rem+0.6vw,1.55rem)] leading-[1.12]"
          >
            {item.title}
          </Heading>
          <Text variant="p2" className="mt-2.5 text-pretty">
            {item.description}
          </Text>
        </div>
      </article>
    </li>
  );
}

export function ProcessRoadmap({
  hero = processRoadmapSection.hero,
  items = processRoadmapSection.items,
  className,
}: ProcessRoadmapProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.88", "start 0.32"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.5 });

  if (!items.length) {
    return null;
  }

  return (
    <section className={cn("page-section-frame relative", "max-md:!p-0", className)}>
      <Hero content={hero} className="min-h-0 py-0 sm:py-0" childrenClassName="mt-12">
        <div ref={trackRef} className="relative mx-auto w-full">
          {/* Track: runs through the nodes and fills as you scroll in. */}
          <div
            aria-hidden
            className="absolute top-[1.3rem] hidden h-[3px] rounded-full bg-[var(--paper-deep)] shadow-[inset_0_1px_0_rgba(var(--shade-rgb),0.12)] lg:block"
            style={{
              left: `${50 / items.length}%`,
              right: `${50 / items.length}%`,
            }}
          >
            <motion.div
              className="h-full origin-left rounded-full bg-purple-600"
              style={reduce ? undefined : { scaleX: progress }}
            />
          </div>

          <ol
            className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:[grid-template-columns:repeat(var(--steps),minmax(0,1fr))]"
            style={{ ["--steps" as string]: items.length }}
          >
            {items.map((item, index) => (
              <ProcessStep
                key={item.id}
                item={item}
                index={index}
                count={items.length}
                progress={progress}
                reduce={reduce}
              />
            ))}
          </ol>
        </div>
      </Hero>
    </section>
  );
}
