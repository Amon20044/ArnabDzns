"use client";

import { Fragment, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Building2, MessageSquareQuote, Star } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Heading, Text } from "@/components/ui/typography";
import type { HeroBadgeConfig, HeroCTAConfig, HeroSectionConfig } from "@/types";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const blurUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(18px)" },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.95,
      delay: 0.08 + i * 0.12,
      ease,
    },
  }),
};

interface HeroProps {
  content: HeroSectionConfig;
  className?: string;
  /**
   * Optional body rendered after the CTA, still inside the centered hero
   * column. Sections like Testimonials use this to reuse the eyebrow/title/
   * description treatment without duplicating its markup.
   */
  children?: ReactNode;
  /** Wrapper class applied to the children slot. */
  childrenClassName?: string;
}

const renderBadgeLeading = (badge: HeroBadgeConfig) => {
  switch (badge.icon) {
    case "stars":
      return (
        <span className="flex items-center gap-0.5">
          {Array.from({ length: badge.starCount ?? 5 }, (_, index) => (
            <Star
              key={`${badge.id ?? badge.label}-star-${index}`}
              className="size-[14px] fill-current stroke-current"
              strokeWidth={1.5}
            />
          ))}
        </span>
      );
    case "building":
      return (
        <span className="inline-flex shrink-0 items-center justify-center">
          <Building2 className="size-[14px]" strokeWidth={2.2} />
        </span>
      );
    case "quote":
      return (
        <span className="inline-flex shrink-0 items-center justify-center">
          <MessageSquareQuote className="size-[14px]" strokeWidth={2.2} />
        </span>
      );
    default:
      return undefined;
  }
};

const resolveCTAIcon = (cta: HeroCTAConfig) => {
  switch (cta.icon) {
    case "none":
      return undefined;
    case "arrow-right":
    default:
      return ArrowRight;
  }
};

const resolveTitleLines = (title: HeroSectionConfig["title"]) => {
  if (Array.isArray(title)) {
    return title;
  }

  return title
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

export const Hero = ({
  content,
  className,
  children,
  childrenClassName,
}: HeroProps) => {
  const badges = content.badges ?? [];
  const titleLines = resolveTitleLines(content.title);
  const eyebrowStep = content.eyebrow ? 1 : 0;
  const titleStep = eyebrowStep + badges.length;
  const descriptionStep = titleStep + 1;
  const ctaStep = descriptionStep + (content.description ? 1 : 0);
  const childrenStep = ctaStep + (content.cta ? 1 : 0);
  const titleSpacingClassName = badges.length || content.eyebrow ? "mt-4" : undefined;

  return (
    <section
      className={cn(
        "relative flex min-h-[10vh] w-full flex-col items-center justify-center py-2 text-center sm:py-14",
        className,
      )}
    >
      {content.eyebrow ? (
        <motion.div custom={0} initial="hidden" animate="visible" variants={blurUp}>
          <Text
            as="span"
            variant="p3"
            className="eyebrow-chip text-accent-dark"
          >
            {content.eyebrow}
          </Text>
        </motion.div>
      ) : null}

      {badges.length ? (
        <div className={cn("flex flex-wrap items-center justify-center gap-3", content.eyebrow && "mt-5")}>
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id ?? `${badge.label}-${index}`}
              custom={eyebrowStep + index}
              initial="hidden"
              animate="visible"
              variants={blurUp}
            >
              <StatusBadge
                tone={badge.tone}
                textColor={badge.textColor}
                iconColor={badge.iconColor}
                indicatorColor={badge.indicatorColor}
                showIndicator={badge.icon === "indicator"}
                pulse={badge.pulse}
                leading={renderBadgeLeading(badge)}
              >
                {badge.label}
              </StatusBadge>
            </motion.div>
          ))}
        </div>
      ) : null}

      <motion.div
        custom={titleStep}
        initial="hidden"
        animate="visible"
        variants={blurUp}
        className={titleSpacingClassName}
      >
        <Heading variant="h2">
          {titleLines.map((line, index) => (
            <Fragment key={`${line}-${index}`}>
              {index > 0 ? <br /> : null}
              {line}
            </Fragment>
          ))}
        </Heading>
      </motion.div>

      {content.description ? (
        <motion.div
          custom={descriptionStep}
          initial="hidden"
          animate="visible"
          variants={blurUp}
          className="mt-5 max-w-md"
        >
          <Text variant="p1">{content.description}</Text>
        </motion.div>
      ) : null}

      {content.cta ? (
        <motion.div
          custom={ctaStep}
          initial="hidden"
          animate="visible"
          variants={blurUp}
          className="mt-10"
        >
          <PrimaryButton
            label={content.cta.label}
            href={content.cta.href}
            external={content.cta.external}
            Icon={resolveCTAIcon(content.cta)}
            iconVisibility={content.cta.iconVisibility}
          />
        </motion.div>
      ) : null}

      {children ? (
        <motion.div
          custom={childrenStep}
          initial="hidden"
          animate="visible"
          variants={blurUp}
          className={cn("mt-10 w-full", childrenClassName)}
        >
          {children}
        </motion.div>
      ) : null}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.10)_0%,transparent_60%)] blur-2xl" />
      </div>
    </section>
  );
};
