"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Hero } from "@/components/sections/hero";
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

  const isExternal = item.icon.startsWith("http");

  return (
    <motion.article
      ref={cardRef}
      style={{ y, opacity, scale }}
      className="liquid-glass group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 sm:p-7"
    >
      {/* Icon — top left */}
      <div className="mb-auto">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl transition-transform duration-500 ease-out group-hover:scale-110">
          {isExternal ? (
            <Image
              src={item.icon}
              alt=""
              width={56}
              height={56}
              className="size-14 object-contain"
              unoptimized
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.icon}
              alt=""
              className="size-14 object-contain"
            />
          )}
        </div>
      </div>

      {/* Content — bottom left */}
      <div className="mt-10 flex flex-col gap-1.5 text-left">
        <Heading variant="h4" as="h3" className="text-left text-text-primary">
          {item.title}
        </Heading>
        <Text variant="p3" className="text-pretty text-left leading-relaxed text-text-secondary">
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
        "page-surface page-reveal relative overflow-hidden p-8 md:p-10 lg:p-12",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.14),transparent_42%)]" />

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
