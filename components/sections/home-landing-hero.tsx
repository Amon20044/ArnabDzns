"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { renderStatusBadgeLeading } from "@/components/ui/status-badge-leading";
import { StatusBadge } from "@/components/ui/status-badge";
import { Text } from "@/components/ui/typography";
import type { HeroCTAConfig, HeroSectionConfig } from "@/types";
import { cn } from "@/lib/utils";

interface HomeLandingHeroProps {
  content: HeroSectionConfig;
  className?: string;
}

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

const accentGradient = {
  backgroundImage:
    "linear-gradient(110deg, var(--accent-dark) 0%, var(--accent) 50%, var(--accent-dark) 100%)",
  backgroundSize: "220% 100%",
  backgroundPositionX: "0%",
} as const;

const accentShimmer = { backgroundPositionX: ["0%", "100%"] };

const accentShimmerTransition = {
  duration: 5.5,
  ease: "easeInOut",
  repeat: Number.POSITIVE_INFINITY,
  repeatType: "reverse",
} as const;


function resolveCTAIcon(cta: HeroCTAConfig) {
  switch (cta.icon) {
    case "none":
      return undefined;
    case "arrow-right":
    default:
      return ArrowRight;
  }
}

function resolveTitleLines(title: HeroSectionConfig["title"]) {
  const lines = Array.isArray(title) ? title : title.split("\n");

  return lines.map((line) => line.trim()).filter(Boolean);
}

export function HomeLandingHero({
  content,
  className,
}: HomeLandingHeroProps) {
  const badges = content.badges ?? [];
  const ctas = [content.cta, content.secondaryCta].filter(
    (cta): cta is HeroCTAConfig => Boolean(cta),
  );
  const titleLines = resolveTitleLines(content.title);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const ctaSize = isDesktop ? "default" : "compact";

  // Reveal order: badges → each title line → description → CTAs.
  const titleStartStep = badges.length;
  const descriptionStep = titleStartStep + titleLines.length;
  const ctaStep = descriptionStep + (content.description ? 1 : 0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");

    const updateViewport = () => {
      setIsDesktop(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  return (
    <section
      className={cn(
        "relative flex w-full flex-col items-center justify-center pb-8 pt-8 text-center sm:pb-14 sm:pt-12",
        className,
      )}
    >
      {badges.length ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id ?? `${badge.label}-${index}`}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={blurUp}
              className={cn(badge.showInMobile === false && "hidden sm:block")}
            >
              <StatusBadge
                tone={badge.tone}
                textColor={badge.textColor}
                iconColor={badge.iconColor}
                indicatorColor={badge.indicatorColor}
                showIndicator={badge.icon === "indicator"}
                pulse={badge.pulse}
                leading={renderStatusBadgeLeading(badge)}
              >
                {badge.label}
              </StatusBadge>
            </motion.div>
          ))}
        </div>
      ) : null}

      <h1
        className={cn(
          "font-sans text-balance font-bold leading-[1.05] tracking-[-0.032em] text-text-primary",
          "text-[clamp(1.875rem,1.21rem+2.86vw,3.75rem)]",
          badges.length ? "mt-4" : "mt-2",
        )}
      >
        {titleLines.map((line, index) => {
          const isAccent = index === titleLines.length - 1;

          return (
            <motion.span
              key={`${line}-${index}`}
              custom={titleStartStep + index}
              initial="hidden"
              animate="visible"
              variants={blurUp}
              className="block"
            >
              {isAccent ? (
                <motion.span
                  className="inline-block bg-clip-text text-transparent"
                  style={accentGradient}
                  animate={accentShimmer}
                  transition={accentShimmerTransition}
                >
                  {line}
                </motion.span>
              ) : (
                line
              )}
            </motion.span>
          );
        })}
      </h1>

      {content.description ? (
        <motion.div
          custom={descriptionStep}
          initial="hidden"
          animate="visible"
          variants={blurUp}
          className="mt-6 max-w-2xl"
        >
          <Text variant="p1" className="text-pretty">
            {content.description}
          </Text>
        </motion.div>
      ) : null}

      {ctas.length ? (
        <motion.div
          custom={ctaStep}
          initial="hidden"
          animate="visible"
          variants={blurUp}
          className="mt-8 flex flex-nowrap items-center justify-center gap-3 sm:mt-10"
        >
          {ctas.map((cta) => (
            <PrimaryButton
              key={`${cta.label}-${cta.href}`}
              label={cta.label}
              href={cta.href}
              external={cta.external}
              Icon={resolveCTAIcon(cta)}
              iconVisibility={cta.iconVisibility}
              tone={cta.tone}
              size={ctaSize}
              className="shrink-0"
            />
          ))}
        </motion.div>
      ) : null}

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 size-[820px] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.12)_0%,transparent_62%)] blur-2xl" />
        <div className="absolute left-1/2 top-[34%] size-[440px] max-w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(216,180,254,0.16)_0%,transparent_70%)] blur-3xl" />
      </div>
    </section>
  );
}
