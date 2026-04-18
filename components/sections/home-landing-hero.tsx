"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { renderStatusBadgeLeading } from "@/components/ui/status-badge-leading";
import { StatusBadge } from "@/components/ui/status-badge";
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

function resolveCTAIcon(cta: HeroCTAConfig) {
  switch (cta.icon) {
    case "none":
      return undefined;
    case "arrow-right":
    default:
      return ArrowRight;
  }
}

export function HomeLandingHero({
  content,
  className,
}: HomeLandingHeroProps) {
  const badges = content.badges ?? [];
  const ctaStep = badges.length + 1;

  return (
    <section
      className={cn(
        "relative flex w-full flex-col items-center justify-center pb-4 pt-3 text-center sm:pb-6 sm:pt-5",
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

      <motion.div
        custom={badges.length}
        initial="hidden"
        animate="visible"
        variants={blurUp}
        className="mt-6 w-full sm:mt-8"
      >
        <div className="relative mx-auto w-full max-w-6xl">
          <div className="relative mx-auto h-[clamp(11.5rem,32vw,26rem)] w-full">
            <DotLottieReact
              src="/HeroTitle.lottie"
              autoplay
              loop
              renderConfig={{ autoResize: true }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </motion.div>

      {content.cta ? (
        <motion.div
          custom={ctaStep}
          initial="hidden"
          animate="visible"
          variants={blurUp}
          className="mt-4 sm:mt-6"
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

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-1/2 size-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.10)_0%,transparent_62%)] blur-2xl" />
      </div>
    </section>
  );
}
