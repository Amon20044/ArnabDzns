"use client";

import { useMemo, useState, type ComponentType } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Crown,
  type LucideIcon,
  Quote,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { Hero } from "@/components/sections/hero";
import { Heading, Text } from "@/components/ui/typography";
import { testimonialsSection } from "@/data/testimonials";
import { createMetallicSurface } from "@/lib/metallic-surface";
import { cn } from "@/lib/utils";
import type {
  HeroSectionConfig,
  TestimonialAvatar,
  TestimonialCategory,
  TestimonialCategoryIconId,
  TestimonialItem,
  TestimonialsSectionConfig,
} from "@/types";

interface TestimonialsProps {
  /** Override the default static content (e.g. when wired to a CMS later). */
  content?: TestimonialsSectionConfig;
  className?: string;
}

const categoryIconRegistry: Record<TestimonialCategoryIconId, LucideIcon> = {
  users: Users,
  trophy: Trophy,
  building: Building2,
  sparkles: Sparkles,
  crown: Crown,
  none: Users, // sane default; "none" callers should branch instead
};

function resolveCategoryIcon(id?: TestimonialCategoryIconId): LucideIcon | null {
  if (!id || id === "none") {
    return null;
  }

  return (categoryIconRegistry as Record<string, LucideIcon | undefined>)[id] ?? null;
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

function TrustedByGroup({ category }: { category: TestimonialCategory }) {
  const { trustedBy } = category;

  if (!trustedBy.avatars.length) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex -space-x-3">
        {trustedBy.avatars.map((avatar, index) => (
          <Avatar
            key={`${avatar.alt}-${index}`}
            avatar={avatar}
            size={44}
            className="shadow-[0_4px_14px_rgba(24,24,27,0.12)]"
          />
        ))}
      </div>
      <Text variant="p3" as="span" className="text-sm font-semibold text-text-primary">
        {trustedBy.label}
      </Text>
    </div>
  );
}

// Single source of truth for the metallic pill — same tone as the
// "Testimonials" StatusBadge so the active tab visually rhymes with it.
const switcherMetallicTheme = createMetallicSurface({ tone: "#a855f7" });

function CategorySwitcher({
  categories,
  activeId,
  onChange,
}: {
  categories: TestimonialCategory[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  if (categories.length <= 1) {
    return null;
  }

  return (
    <div
      role="tablist"
      aria-label="Testimonial categories"
      className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-border-accent bg-white/80 p-1 shadow-[0_10px_30px_rgba(88,28,135,0.08)] backdrop-blur-md"
    >
      {categories.map((category) => {
        const isActive = category.id === activeId;
        const Icon = resolveCategoryIcon(category.icon);
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`testimonials-panel-${category.id}`}
            id={`testimonials-tab-${category.id}`}
            onClick={() => onChange(category.id)}
            className={cn(
              "group relative overflow-hidden rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-200 sm:px-5 sm:text-[0.78rem]",
              isActive
                ? "text-white"
                : "text-text-secondary hover:text-text-primary",
            )}
            style={isActive ? { color: switcherMetallicTheme.textColor } : undefined}
          >
            {isActive ? (
              <motion.span
                layoutId="testimonials-tab-pill"
                className="pointer-events-none absolute inset-0 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={switcherMetallicTheme.surfaceStyle}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-px rounded-full opacity-80"
                  style={switcherMetallicTheme.glowStyle}
                />
              </motion.span>
            ) : null}
            <span className="relative z-10 flex items-center gap-2">
              {Icon ? <Icon className="size-3.5" strokeWidth={2.2} aria-hidden /> : null}
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden">{category.shortLabel ?? category.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  return (
    <article className="relative flex h-full flex-col gap-6 rounded-[1.75rem] border border-border bg-white/95 p-6 text-left sm:p-8">
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
          <Text variant="p3" className="mt-1 text-text-secondary">
            {testimonial.metaLabel}
          </Text>
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
  const categories = content.categories;

  const initialCategoryId = useMemo(() => {
    if (
      content.defaultCategoryId &&
      categories.some((category) => category.id === content.defaultCategoryId)
    ) {
      return content.defaultCategoryId;
    }

    return categories[0]?.id ?? "";
  }, [categories, content.defaultCategoryId]);

  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);
  const [cardIndex, setCardIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? categories[0],
    [activeCategoryId, categories],
  );

  if (!activeCategory) {
    return null;
  }

  const testimonials = activeCategory.testimonials;
  const safeIndex = testimonials.length ? cardIndex % testimonials.length : 0;
  const activeTestimonial = testimonials[safeIndex];

  const handleCategoryChange = (id: string) => {
    if (id === activeCategoryId) {
      return;
    }

    setActiveCategoryId(id);
    setCardIndex(0);
    setDirection(1);
  };

  const handleStep = (step: number) => {
    if (testimonials.length <= 1) {
      return;
    }

    setDirection(step);
    setCardIndex((current) => {
      const next = (current + step + testimonials.length) % testimonials.length;
      return next;
    });
  };

  // Project the testimonials section header onto the shared HeroSectionConfig
  // shape so we can reuse the Hero component verbatim. The eyebrow string is
  // promoted to a metallic StatusBadge (Hero's `badges` slot) so the chip
  // matches the rest of the site's badge language.
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
        "page-surface page-reveal relative overflow-hidden p-8 md:p-10 lg:p-12",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.10),transparent_46%)]"
      />

      <Hero
        content={heroContent}
        className="min-h-0 py-0 sm:py-0"
        childrenClassName="mt-12"
      >
        <div className="flex flex-col items-center gap-10">
          <CategorySwitcher
            categories={categories}
            activeId={activeCategory.id}
            onChange={handleCategoryChange}
          />

          <TrustedByGroup category={activeCategory} />

          <div
            id={`testimonials-panel-${activeCategory.id}`}
            role="tabpanel"
            aria-labelledby={`testimonials-tab-${activeCategory.id}`}
            className="w-full"
          >
            {activeTestimonial ? (
              <div className="relative mx-auto w-full max-w-3xl">
                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction} initial={false}>
                    <motion.div
                      key={`${activeCategory.id}-${activeTestimonial.id}`}
                      custom={direction}
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <TestimonialCard testimonial={activeTestimonial} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {testimonials.length > 1 ? (
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <CarouselButton
                      label="Previous testimonial"
                      Icon={ChevronLeft}
                      onClick={() => handleStep(-1)}
                    />
                    <div
                      aria-live="polite"
                      className="min-w-[3.5rem] text-center text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary"
                    >
                      {safeIndex + 1} / {testimonials.length}
                    </div>
                    <CarouselButton
                      label="Next testimonial"
                      Icon={ChevronRight}
                      onClick={() => handleStep(1)}
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <Text variant="p2" className="text-center text-text-secondary">
                No testimonials yet for this category.
              </Text>
            )}
          </div>
        </div>
      </Hero>
    </section>
  );
}

function CarouselButton({
  label,
  Icon,
  onClick,
}: {
  label: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full bg-black text-white shadow-[0_12px_28px_rgba(24,24,27,0.22)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-accent-dark"
    >
      <Icon className="size-5" strokeWidth={2.2} />
    </button>
  );
}
