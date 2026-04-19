"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
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
const MOBILE_HERO_LOTTIE_SRC = "/Mobile.lottie";
const MOBILE_HERO_FALLBACK_SRC = "/Mobile.svg";

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
  const ctas = [content.cta, content.secondaryCta].filter(
    (cta): cta is HeroCTAConfig => Boolean(cta),
  );
  const ctaStep = badges.length + 1;
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [hasMobileLottie, setHasMobileLottie] = useState(false);
  const heroTitle =
    typeof content.title === "string"
      ? content.title
      : content.title.join(" ").replace(/\s+/g, " ").trim();
  const ctaSize = isDesktop ? "default" : "compact";

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

  useEffect(() => {
    if (isDesktop !== false) {
      return;
    }

    let cancelled = false;

    const checkMobileLottie = async () => {
      try {
        const response = await fetch(MOBILE_HERO_LOTTIE_SRC, {
          method: "HEAD",
        });

        if (!cancelled) {
          setHasMobileLottie(response.ok);
        }
      } catch {
        if (!cancelled) {
          setHasMobileLottie(false);
        }
      }
    };

    void checkMobileLottie();

    return () => {
      cancelled = true;
    };
  }, [isDesktop]);

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

      <motion.div
        custom={badges.length}
        initial="hidden"
        animate="visible"
        variants={blurUp}
        className="mt-6 w-full sm:mt-8"
      >
        <div className="relative mx-auto w-full max-w-6xl">
          {isDesktop === null ? (
            <>
              <div
                aria-hidden
                className="mx-auto aspect-[384/475] w-full max-w-[24rem] sm:hidden"
              />
              <div
                aria-hidden
                className="hidden aspect-[2432/512] w-full sm:block"
              />
            </>
          ) : isDesktop ? (
            <div className="relative mx-auto h-[clamp(11.5rem,32vw,26rem)] w-full">
              <DotLottieReact
                src="/HeroTitle.lottie"
                autoplay
                loop
                renderConfig={{ autoResize: true }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ) : hasMobileLottie ? (
            <div className="relative mx-auto h-[clamp(18rem,88vw,29.5rem)] w-full max-w-[24rem]">
              <DotLottieReact
                src={MOBILE_HERO_LOTTIE_SRC}
                autoplay
                loop
                renderConfig={{ autoResize: true }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ) : (
            <Image
              src={MOBILE_HERO_FALLBACK_SRC}
              alt={heroTitle}
              width={384}
              height={475}
              preload
              className="mx-auto h-auto w-full max-w-[24rem]"
            />
          )}
        </div>
      </motion.div>

      {ctas.length ? (
        <motion.div
          custom={ctaStep}
          initial="hidden"
          animate="visible"
          variants={blurUp}
          className={cn(
            "mt-4 gap-3 sm:mt-6",
            ctas.length > 1
              ? "mx-auto grid w-full max-w-[21rem] grid-cols-2"
              : "flex items-center justify-center",
          )}
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
              fullWidth={ctas.length > 1}
              className={cn(ctas.length > 1 && "w-full")}
            />
          ))}
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
