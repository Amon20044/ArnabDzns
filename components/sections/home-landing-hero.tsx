"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Fragment, useEffect, useState, type ReactNode } from "react";
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
    "linear-gradient(110deg, var(--accent-dark) 0%, var(--accent) 28%, #efe2ff 50%, var(--accent) 72%, var(--accent-dark) 100%)",
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

// Words in the accent line that receive hand-drawn emphasis.
const ACCENT_EMPHASIS: Record<string, "highlight" | "underline"> = {
  win: "highlight",
  seconds: "underline",
};

// Hand-applied highlighter swash sitting behind the word.
function MarkerHighlight({
  children,
  delay,
}: {
  children: ReactNode;
  delay: number;
}) {
  return (
    <span className="relative isolate inline-block px-[0.16em]">
      <motion.span
        aria-hidden
        className="absolute inset-x-0 inset-y-[0.04em] -z-10 rounded-[0.32em]"
        style={{
          backgroundImage:
            "linear-gradient(102deg, var(--accent-dark) 0%, var(--accent) 50%, #c084fc 100%)",
          transformOrigin: "0% 65%",
          boxShadow: "0 8px 22px -10px rgba(168,85,247,0.6)",
        }}
        initial={{ scaleX: 0, rotate: -1.8, opacity: 0 }}
        animate={{ scaleX: 1, rotate: -1.8, opacity: 1 }}
        transition={{ delay, duration: 0.5, ease }}
      />
      <span className="relative text-white">{children}</span>
    </span>
  );
}

// Hand-drawn underline stroke that draws on beneath the word.
function HandUnderline({
  children,
  delay,
}: {
  children: ReactNode;
  delay: number;
}) {
  return (
    <span className="relative inline-block">
      <motion.span
        className="bg-clip-text text-transparent"
        style={accentGradient}
        animate={accentShimmer}
        transition={accentShimmerTransition}
      >
        {children}
      </motion.span>
      <motion.svg
        aria-hidden
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        fill="none"
        className="pointer-events-none absolute -bottom-[0.16em] left-0 h-[0.34em] w-full overflow-visible"
      >
        <motion.path
          d="M3,9 C 38,3 70,12 104,7 C 140,2 172,11 197,6"
          stroke="var(--accent)"
          strokeWidth={4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay, duration: 0.7, ease }}
        />
      </motion.svg>
    </span>
  );
}

// Splits the accent line into words and wraps emphasized ones with their effect.
function renderAccentLine(
  line: string,
  markerDelay: number,
  underlineDelay: number,
) {
  return line.split(/(\s+)/).map((token, index) => {
    if (token.length === 0 || /^\s+$/.test(token)) {
      return token;
    }

    const match = token.match(
      /^([^\p{L}\p{N}]*)([\p{L}\p{N}][\p{L}\p{N}'-]*)([^\p{L}\p{N}]*)$/u,
    );

    if (!match) {
      return <Fragment key={index}>{token}</Fragment>;
    }

    const [, pre, word, post] = match;
    const effect = ACCENT_EMPHASIS[word.toLowerCase()];

    if (effect === "highlight") {
      return (
        <Fragment key={index}>
          {pre}
          <MarkerHighlight delay={markerDelay}>{word}</MarkerHighlight>
          {post}
        </Fragment>
      );
    }

    if (effect === "underline") {
      return (
        <Fragment key={index}>
          {pre}
          <HandUnderline delay={underlineDelay}>{word}</HandUnderline>
          {post}
        </Fragment>
      );
    }

    return <Fragment key={index}>{token}</Fragment>;
  });
}

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

  // Start the hand-drawn emphasis just as the accent line finishes revealing.
  const accentRevealDelay =
    0.08 + (titleStartStep + titleLines.length - 1) * 0.12;
  const accentMarkerDelay = accentRevealDelay + 0.5;
  const accentUnderlineDelay = accentRevealDelay + 0.78;

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
          "font-sans text-balance font-bold leading-[1.1] tracking-[-0.028em] text-text-primary",
          "text-[clamp(1.875rem,1.1rem+3vw,3.25rem)]",
          badges.length ? "mt-6 sm:mt-7" : "mt-2",
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
                  {renderAccentLine(
                    line,
                    accentMarkerDelay,
                    accentUnderlineDelay,
                  )}
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
