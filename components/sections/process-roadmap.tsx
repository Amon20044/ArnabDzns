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
  startFrom?: RoadmapStartSide;
  className?: string;
}

const timelineSpeedMultiplier = 2;

function resolveStepSide(startFrom: RoadmapStartSide, index: number) {
  const isEven = index % 2 === 0;
  if (startFrom === "left") {
    return isEven ? "left" : "right";
  }

  return isEven ? "right" : "left";
}

function resolveStepNumber(index: number) {
  return `${index + 1}`.padStart(2, "0");
}

function ProcessStepRow({
  item,
  index,
  startsLeft,
  lineProgress,
  stepCount,
}: {
  item: RoadmapStepConfig;
  index: number;
  startsLeft: boolean;
  lineProgress: MotionValue<number>;
  stepCount: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 26,
    mass: 0.34,
  });

  const cardY = useTransform(progress, [0, 0.22, 0.78, 1], [64, 0, 0, 64]);
  const cardOpacity = useTransform(progress, [0, 0.16, 0.84, 1], [0.14, 1, 1, 0.14]);
  const cardScale = useTransform(progress, [0, 0.22, 0.78, 1], [0.94, 1, 1, 0.94]);
  const numberY = useTransform(progress, [0, 0.22, 0.78, 1], [20, 0, 0, 20]);
  const iconY = useTransform(progress, [0, 0.22, 0.78, 1], [24, 0, 0, 24]);
  const iconRotate = useTransform(progress, [0, 0.22, 0.78, 1], startsLeft ? [-6, 0, 0, -6] : [6, 0, 0, 6]);
  const contentY = useTransform(progress, [0, 0.22, 0.78, 1], [18, 0, 0, 18]);
  const dotScale = useTransform(progress, [0, 0.22, 0.78, 1], [0.88, 1, 1, 0.88]);
  const dotOpacity = useTransform(progress, [0, 0.16, 0.84, 1], [0.88, 1, 1, 0.88]);
  const dotActivationPoint =
    stepCount === 1 ? 0.5 : 0.08 + (index / Math.max(stepCount - 1, 1)) * 0.84;
  const dotBackgroundColor = useTransform(() =>
    lineProgress.get() >= dotActivationPoint ? "rgb(88 28 135)" : "rgb(161 161 170)",
  );
  const dotBoxShadow = useTransform(() =>
    lineProgress.get() >= dotActivationPoint
      ? "0 0 0 8px rgba(255,255,255,0.92), 0 12px 28px rgba(88,28,135,0.18)"
      : "0 0 0 8px rgba(255,255,255,0.92), 0 10px 22px rgba(161,161,170,0.16)",
  );

  const stepNumber = resolveStepNumber(index);

  return (
    <div
      ref={rowRef}
      className="grid grid-cols-[28px_minmax(0,1fr)] gap-5 md:grid-cols-[minmax(0,1fr)_84px_minmax(0,1fr)] md:gap-8"
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
          style={shouldReduceMotion ? undefined : { y: cardY, opacity: cardOpacity, scale: cardScale }}
          className="liquid-glass group relative flex min-h-[18rem] w-full max-w-[31rem] flex-col overflow-hidden rounded-[1.85rem] border border-white/70 p-6 text-left shadow-[0_22px_58px_rgba(88,28,135,0.12)] max-md:[--lg-shadow:none] max-md:!shadow-none sm:p-7"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(168,85,247,0.24)_0%,rgba(168,85,247,0.14)_24%,rgba(168,85,247,0.06)_52%,transparent_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,180,254,0.46),transparent_34%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.62),transparent_24%)]" />

          <motion.span
            aria-hidden
            style={shouldReduceMotion ? undefined : { y: numberY }}
            className="pointer-events-none absolute left-6 top-4 z-0 text-[clamp(3.8rem,8vw,5.6rem)] font-semibold leading-none tracking-[-0.08em] text-[rgba(17,24,39,0.11)]"
          >
            {stepNumber}
          </motion.span>

          {item.icon ? (
            <motion.div
              aria-hidden
              style={shouldReduceMotion ? undefined : { y: iconY, rotate: iconRotate }}
              className="pointer-events-none absolute right-[-1.2rem] top-[-0.9rem] z-0 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-3"
            >
              <Icon
                name={item.icon}
                strokeWidth={1.6}
                className="size-36 text-[#CBADE7] sm:size-40"
              />
            </motion.div>
          ) : null}

          <motion.div
            style={shouldReduceMotion ? undefined : { y: contentY }}
            className="relative z-[1] mt-auto pt-24 sm:pt-28"
          >
            {/* <Text
              as="span"
              variant="p3"
              className="text-[0.72rem] uppercase tracking-[0.16em] text-text-secondary/78"
            >
              {resolveStepLabel(item, index)}
            </Text> */}
            <Heading
              variant="h3"
              as="h3"
              className="mt-3 max-w-[13ch] text-balance text-[clamp(1.9rem,4vw,2.65rem)] leading-[0.96] tracking-[-0.05em]"
            >
              {item.title}
            </Heading>
            <Text variant="p2" className="mt-4 max-w-md text-pretty leading-7">
              {item.description}
            </Text>
          </motion.div>
        </motion.article>
      </div>

      <div className="relative col-start-1 row-start-1 min-h-[1px] md:col-start-2">
        <motion.span
          aria-hidden
          style={
            shouldReduceMotion
              ? undefined
              : {
                  scale: dotScale,
                  opacity: dotOpacity,
                  backgroundColor: dotBackgroundColor,
                  boxShadow: dotBoxShadow,
                }
          }
          className="absolute left-1/2 top-12 size-3.5 -translate-x-1/2 rounded-full"
        />
      </div>
    </div>
  );
}

export function ProcessRoadmap({
  hero = processRoadmapSection.hero,
  items = processRoadmapSection.items,
  startFrom = processRoadmapSection.startFrom ?? "right",
  className,
}: ProcessRoadmapProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress: timelineProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.82", "end 0.2"],
  });
  const timelineScaleY = useSpring(timelineProgress, {
    stiffness: 170 * timelineSpeedMultiplier,
    damping: 28,
    mass: 0.42 / timelineSpeedMultiplier,
  });

  if (!items.length) {
    return null;
  }

  return (
    <section
      className={cn(
        "page-section-frame page-surface page-reveal relative overflow-hidden",
        "max-md:!rounded-none max-md:!border-transparent max-md:!bg-none max-md:!shadow-none max-md:!backdrop-blur-none max-md:!p-0",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.10),transparent_46%)] max-md:hidden"
      />

      <Hero content={hero} className="min-h-0 py-0 sm:py-0" childrenClassName="mt-12">
        <div ref={sectionRef} className="relative mx-auto w-full max-w-5xl">
          <motion.div
            aria-hidden
            style={
              shouldReduceMotion
                ? undefined
                : {
                    scaleY: timelineScaleY,
                    originY: 0,
                  }
            }
            className="absolute bottom-10 left-3.5 top-4 w-px origin-top bg-[linear-gradient(to_bottom,transparent_0%,rgba(17,24,39,0.24)_7%,rgba(17,24,39,0.84)_18%,rgba(17,24,39,0.84)_82%,rgba(17,24,39,0.24)_93%,transparent_100%)] md:left-1/2 md:-translate-x-1/2"
          />

          <div className="flex flex-col gap-10 md:gap-7">
            {items.map((item, index) => {
              const side = resolveStepSide(startFrom, index);

              return (
                <ProcessStepRow
                  key={item.id}
                  item={item}
                  index={index}
                  startsLeft={side === "left"}
                  lineProgress={timelineScaleY}
                  stepCount={items.length}
                />
              );
            })}
          </div>
        </div>
      </Hero>
    </section>
  );
}
