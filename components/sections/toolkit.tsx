"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Hero } from "@/components/sections/hero";
import { Icon } from "@/components/ui/icon";
import { Heading, Text } from "@/components/ui/typography";
import { servicesSection } from "@/data/services";
import { cn } from "@/lib/utils";
import type { ServiceCardItem, ServicesSectionConfig } from "@/types";

function ServiceCard({
  item,
  index,
}: {
  item: ServiceCardItem;
  index: number;
}) {
  const cardRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end 0.85"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60 + index * 12, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <motion.article
      ref={cardRef}
      style={{ y, opacity, scale }}
      className="liquid-glass group relative flex h-full min-h-[15rem] flex-col overflow-hidden rounded-[1.75rem] border border-white/70 p-6 max-md:[--lg-shadow:none] max-md:!shadow-none sm:p-7"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(168,85,247,0.24)_0%,rgba(168,85,247,0.14)_24%,rgba(168,85,247,0.06)_52%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,180,254,0.46),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.62),transparent_24%)]" />

      <Icon
        name={item.icon}
        strokeWidth={1.6}
        className="pointer-events-none absolute right-[-1.25rem] top-[-1rem] z-0 size-40 text-[rgba(88,28,135)] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-3 sm:size-44"
      />

      <div className="relative z-[1] mt-auto pt-28 text-left sm:pt-32">
        <Heading variant="h4" as="h3" className="text-left text-text-primary">
          {item.title}
        </Heading>
        <Text
          variant="p3"
          className="mt-2 text-pretty text-left leading-relaxed text-text-secondary"
        >
          {item.description}
        </Text>
      </div>
    </motion.article>
  );
}

interface ToolkitProps {
  content?: ServicesSectionConfig;
  className?: string;
}

export function Toolkit({
  content = servicesSection,
  className,
}: ToolkitProps) {
  return (
    <section
      className={cn(
        "page-section-frame page-surface page-reveal relative overflow-hidden",
        "max-md:!rounded-none max-md:!border-transparent max-md:!bg-none max-md:!shadow-none max-md:!backdrop-blur-none max-md:!p-0",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.14),transparent_42%)] max-md:hidden" />

      <Hero
        content={content.hero}
        className="min-h-0 py-0 sm:py-0"
        childrenClassName="mt-10"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.services.map((item, index) => (
            <ServiceCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </Hero>
    </section>
  );
}
