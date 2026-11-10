"use client";

import { useMemo, useState } from "react";
import Image from "@/components/ui/site-image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Hero } from "@/components/sections/hero";
import { Heading, Text } from "@/components/ui/typography";
import { testimonialsSection } from "@/data/testimonials";
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

const deckSpring = { type: "spring", stiffness: 260, damping: 28, mass: 0.8 } as const;

/**
 * Split a quote into its opening sentence and the rest, so the opener can be
 * run over with the highlighter. Quotes with no sentence break stay whole.
 */
function splitLead(message: string) {
  const match = message.trim().match(/^([\s\S]{24,160}?[.!?])\s+([\s\S]+)$/);

  return match ? { lead: match[1], rest: match[2] } : { lead: message.trim(), rest: "" };
}

function StarRow({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rated ${filled} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < filled
              ? "fill-[var(--sticker-sun)] stroke-[var(--sticker-sun)]"
              : "stroke-text-secondary/40",
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
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);
  const errored = Boolean(avatar.src && erroredSrc === avatar.src);

  if (errored || !avatar.src) {
    return (
      <span
        aria-label={avatar.alt}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[0.9rem] bg-purple-600 text-[0.8rem] font-semibold uppercase tracking-wide text-white",
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
        "relative inline-block shrink-0 overflow-hidden rounded-[0.9rem] bg-white",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={avatar.src}
        alt={avatar.alt}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setErroredSrc(avatar.src)}
      />
    </span>
  );
}


function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  const { lead, rest } = splitLead(testimonial.message);

  return (
    <article className="tray text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_1px_rgba(var(--shade-rgb),0.07),0_30px_50px_-30px_rgba(var(--shade-rgb),0.55)]">
      <div className="tray-card flex min-h-[19rem] flex-col p-6 sm:p-9">
        <div className="flex items-start justify-between gap-4">
          <span
            aria-hidden
            className="font-sans text-[4.5rem] font-bold leading-[0.7] text-purple-300"
          >
            &ldquo;
          </span>
          <StarRow rating={testimonial.rating} />
        </div>

        <blockquote className="mt-2 text-pretty text-[clamp(1.1rem,1rem+0.6vw,1.4rem)] font-medium leading-[1.5] tracking-[-0.015em] text-text-primary">
          <span className="marker marker-sweep">{lead}</span>
          {rest ? <span className="text-text-primary/55"> {rest}</span> : null}
        </blockquote>

        <footer className="mt-auto flex items-center gap-3.5 pt-8">
          <Avatar avatar={testimonial.avatar} size={52} />
          <div className="min-w-0">
            <Heading
              variant="h5"
              as="h3"
              className="truncate text-[1.05rem] leading-tight text-text-primary"
            >
              {testimonial.name}
            </Heading>
            <p className="mt-0.5 truncate text-[0.85rem] text-text-secondary">
              {testimonial.metaLabel}
            </p>
          </div>
        </footer>
      </div>
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

  // Up to three cards are mounted: previous, active, next.
  const deck = useMemo(() => {
    const count = allTestimonials.length;

    if (!count) {
      return [];
    }

    const offsets = count >= 3 ? [-1, 0, 1] : count === 2 ? [0, 1] : [0];

    return offsets.map((offset) => ({
      offset,
      testimonial: allTestimonials[(safeIndex + offset + count) % count],
    }));
  }, [allTestimonials, safeIndex]);

  const handleStep = (step: number) => {
    if (allTestimonials.length <= 1) return;
    setDirection(step);
    setCardIndex((current) => (current + step + allTestimonials.length) % allTestimonials.length);
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
      },
    ],
    title: content.title,
    description: content.description,
    cta: false,
  };

  return (
    <section
      className={cn(
        "page-section-frame page-reveal relative",
        "max-md:!p-0",
        className,
      )}
    >

      <Hero
        content={heroContent}
        className="min-h-0 py-0 sm:py-0"
        childrenClassName="mt-12"
      >
        <div className="flex flex-col items-center gap-10">
          <div className="w-full">
            {activeTestimonial ? (
              <div className="relative mx-auto w-full max-w-3xl">
                {/* Deck: the active card sits forward, its neighbours fan out
                    behind it and can be clicked to bring them up. */}
                <div className="relative grid place-items-center">
                  <AnimatePresence initial={false} custom={direction}>
                    {deck.map(({ testimonial, offset }) => {
                      const isFront = offset === 0;

                      return (
                        <motion.div
                          key={testimonial.id}
                          custom={direction}
                          className={cn(
                            "w-full [grid-area:1/1]",
                            isFront
                              ? "touch-pan-y select-none"
                              : "cursor-pointer max-lg:hidden",
                          )}
                          style={{ zIndex: isFront ? 3 : 1 }}
                          aria-hidden={isFront ? undefined : true}
                          initial={{ opacity: 0, x: `${direction * 90}%`, scale: 0.8, rotate: direction * 8 }}
                          animate={{
                            opacity: isFront ? 1 : 0.5,
                            x: `${offset * 58}%`,
                            scale: isFront ? 1 : 0.84,
                            rotate: offset * 4,
                          }}
                          exit={{
                            opacity: 0,
                            x: `${-direction * 90}%`,
                            scale: 0.8,
                            rotate: -direction * 8,
                            transition: { duration: 0.25, ease: cardEase },
                          }}
                          transition={deckSpring}
                          whileHover={isFront ? undefined : { opacity: 0.85, scale: 0.87 }}
                          onClick={isFront ? undefined : () => handleStep(offset)}
                          drag={isFront && allTestimonials.length > 1 ? "x" : false}
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.2}
                          dragMomentum={false}
                          onDragEnd={isFront ? handleDragEnd : undefined}
                        >
                          <TestimonialCard testimonial={testimonial} />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {allTestimonials.length > 1 ? (
                  <div className="mt-6 flex items-center gap-4">
                    <span aria-hidden className="h-px flex-1 bg-[rgba(var(--shade-rgb),0.14)]" />
                    <button
                      type="button"
                      onClick={() => handleStep(-1)}
                      className="press press--white press--compact press--icon"
                      aria-label="Previous testimonial"
                    >
                      <ArrowLeft aria-hidden className="size-4" strokeWidth={2.4} />
                    </button>
                    <span
                      aria-live="polite"
                      className="min-w-[3.5rem] text-center text-[0.8rem] font-semibold tracking-[0.08em] text-text-secondary tabular-nums"
                    >
                      {String(safeIndex + 1).padStart(2, "0")} / {String(allTestimonials.length).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStep(1)}
                      className="press press--compact press--icon"
                      aria-label="Next testimonial"
                    >
                      <ArrowRight aria-hidden className="size-4" strokeWidth={2.4} />
                    </button>
                    <span aria-hidden className="h-px flex-1 bg-[rgba(var(--shade-rgb),0.14)]" />
                  </div>
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
