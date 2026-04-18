"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Hero } from "@/components/sections/hero";
import { Heading, Text } from "@/components/ui/typography";
import { testimonialsSection } from "@/data/testimonials";
import { createMetallicSurface } from "@/lib/metallic-surface";
import { cn } from "@/lib/utils";
import type {
  HeroSectionConfig,
  TestimonialAvatar,
  TestimonialItem,
  TestimonialsSectionConfig,
} from "@/types";

interface TestimonialsProps {
  /** Override the default static content (e.g. when wired to a CMS later). */
  content?: TestimonialsSectionConfig;
  className?: string;
}

const cardEase = [0.22, 1, 0.36, 1] as const;

const cardVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 36 : -36,
    filter: "blur(10px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: cardEase },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -36 : 36,
    filter: "blur(10px)",
    transition: { duration: 0.35, ease: cardEase },
  }),
};

function StarRow({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div
      className="flex items-center gap-1 text-text-primary"
      aria-label={`Rated ${filled} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < filled ? "fill-text-primary stroke-text-primary" : "stroke-text-secondary/40",
          )}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function Avatar({
  avatar,
  size = 44,
  className,
}: {
  avatar: TestimonialAvatar;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored || !avatar.src) {
    return (
      <span
        aria-label={avatar.alt}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-accent-muted text-[0.72rem] font-semibold uppercase tracking-wide text-accent-dark ring-2 ring-white",
          className,
        )}
        style={{ width: size, height: size }}
      >
        {avatar.fallback ?? avatar.alt.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative inline-block shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-white",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={avatar.src}
        alt={avatar.alt}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setErrored(true)}
      />
    </span>
  );
}


const metaBadgeTheme = createMetallicSurface({ tone: "#a855f7" });

function MetaBadge({ label }: { label: string }) {
  return (
    <span className="relative inline-flex items-center overflow-hidden rounded-full px-3 py-1">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={metaBadgeTheme.surfaceStyle}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-px rounded-full opacity-70"
        style={metaBadgeTheme.glowStyle}
      />
      <span
        className="relative z-10 whitespace-nowrap text-[11px] font-semibold tracking-tight"
        style={{ color: metaBadgeTheme.textColor }}
      >
        {label}
      </span>
    </span>
  );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  return (
    <article className="relative flex h-full flex-col gap-6 rounded-[1.75rem] border border-border bg-white/95 p-6 text-left max-md:!shadow-none sm:p-8">
      <Quote
        aria-hidden
        className="absolute right-6 top-6 size-10 text-accent/20 sm:right-8 sm:top-8 sm:size-12"
        strokeWidth={1.5}
      />

      <header className="flex items-center gap-4">
        <Avatar avatar={testimonial.avatar} size={56} />
        <div className="min-w-0">
          <Heading variant="h4" as="h3" className="truncate text-text-primary">
            {testimonial.name}
          </Heading>
          <div className="mt-1.5">
            <MetaBadge label={testimonial.metaLabel} />
          </div>
        </div>
      </header>

      <Text variant="p2" className="text-pretty leading-7 text-text-primary/85">
        {testimonial.message}
      </Text>

      <footer className="mt-auto pt-2">
        <StarRow rating={testimonial.rating} />
      </footer>
    </article>
  );
}

export function Testimonials({ content = testimonialsSection, className }: TestimonialsProps) {
  const allTestimonials = useMemo(
    () => content.categories.flatMap((category) => category.testimonials),
    [content.categories],
  );

  const [cardIndex, setCardIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const safeIndex = allTestimonials.length ? cardIndex % allTestimonials.length : 0;
  const activeTestimonial = allTestimonials[safeIndex];

  const handleStep = (step: number) => {
    if (allTestimonials.length <= 1) return;
    setDirection(step);
    setCardIndex((current) => (current + step + allTestimonials.length) % allTestimonials.length);
  };

  const handleJumpTo = (nextIndex: number) => {
    if (allTestimonials.length <= 1 || nextIndex === safeIndex) return;
    const forward = (nextIndex - safeIndex + allTestimonials.length) % allTestimonials.length;
    const backward = (safeIndex - nextIndex + allTestimonials.length) % allTestimonials.length;
    setDirection(forward <= backward ? 1 : -1);
    setCardIndex(nextIndex);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const offsetThreshold = 70;
    const velocityThreshold = 450;
    if (info.offset.x < -offsetThreshold || info.velocity.x < -velocityThreshold) {
      handleStep(1);
    } else if (info.offset.x > offsetThreshold || info.velocity.x > velocityThreshold) {
      handleStep(-1);
    }
  };

  const heroContent: HeroSectionConfig = {
    badges: [
      {
        id: "testimonials",
        label: content.eyebrow,
        icon: "quote",
        tone: "#a855f7",
        iconColor: "#f5e1ff",
      },
    ],
    title: content.title,
    description: content.description,
    cta: false,
  };

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

      <Hero
        content={heroContent}
        className="min-h-0 py-0 sm:py-0"
        childrenClassName="mt-12"
      >
        <div className="flex flex-col items-center gap-10">
          <div className="w-full">
            {activeTestimonial ? (
              <div className="relative mx-auto w-full max-w-3xl">
                <motion.div
                  className="relative overflow-hidden touch-pan-y select-none"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  dragMomentum={false}
                  onDragEnd={handleDragEnd}
                  whileTap={{ cursor: "grabbing" }}
                  style={{ cursor: allTestimonials.length > 1 ? "grab" : "default" }}
                >
                  <AnimatePresence mode="wait" custom={direction} initial={false}>
                    <motion.div
                      key={activeTestimonial.id}
                      custom={direction}
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <TestimonialCard testimonial={activeTestimonial} />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                {allTestimonials.length > 1 ? (
                  <TestimonialDots
                    count={allTestimonials.length}
                    activeIndex={safeIndex}
                    onSelect={handleJumpTo}
                  />
                ) : null}
              </div>
            ) : (
              <Text variant="p2" className="text-center text-text-secondary">
                No testimonials yet.
              </Text>
            )}
          </div>
        </div>
      </Hero>
    </section>
  );
}

function TestimonialDots({
  count,
  activeIndex,
  onSelect,
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const maxSize = 10;
  const minSize = 3;
  const decay = 0.55;

  return (
    <div
      aria-label="Testimonial pagination"
      className="mt-6 flex items-center justify-center gap-2"
    >
      {Array.from({ length: count }, (_, index) => {
        const raw = Math.abs(index - activeIndex);
        const distance = Math.min(raw, count - raw);
        const falloff = Math.exp(-distance * decay);
        const size = minSize + (maxSize - minSize) * falloff;
        const opacity = 0.22 + 0.78 * falloff;
        const isActive = index === activeIndex;

        return (
          <motion.button
            key={index}
            type="button"
            aria-current={isActive ? "true" : undefined}
            aria-label={`Go to testimonial ${index + 1}`}
            onClick={() => onSelect(index)}
            animate={{ width: size, height: size, opacity }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 rounded-full bg-text-primary"
          />
        );
      })}
    </div>
  );
}
