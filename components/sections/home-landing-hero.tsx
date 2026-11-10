"use client";

import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { HeroOrbitField } from "@/components/sections/hero-orbit-field";
import { HeroScene, type HeroSceneStat, type HeroSceneWork } from "@/components/sections/hero-scene";
import { ShapeGlyph } from "@/components/illustrations/stickers";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Text } from "@/components/ui/typography";
import type { HeroBadgeConfig, HeroCTAConfig, HeroSectionConfig } from "@/types";
import { cn } from "@/lib/utils";

interface HomeLandingHeroProps {
  content: HeroSectionConfig;
  /** Up to two real pieces of work shown as loose thumbnails in the scene. */
  work?: HeroSceneWork[];
  className?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (step: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.04 + step * 0.07, ease },
  }),
};

function resolveCTAIcon(cta: HeroCTAConfig) {
  return cta.icon === "none" ? undefined : ArrowRight;
}

function resolveTitleLines(title: HeroSectionConfig["title"]) {
  const lines = Array.isArray(title) ? title : title.split("\n");

  return lines.map((line) => line.trim()).filter(Boolean);
}

/**
 * Split "20000+ Projects Delivered" into a number and a caption so content
 * badges can be drawn as stamps. Labels without a leading number are skipped.
 */
function badgeToStat(badge: HeroBadgeConfig, index: number): HeroSceneStat | null {
  const match = badge.label.trim().match(/^([\d.,]+\s*[kKmM]?\+?%?)\s+(.+)$/);

  if (!match) {
    return null;
  }

  const digits = Number(match[1].replace(/[^\d.]/g, ""));
  const suffix = match[1].replace(/[\d.,\s]/g, "");
  const compact =
    Number.isFinite(digits) && digits >= 1000 && !/[kKmM]/.test(suffix)
      ? `${Math.round(digits / 1000)}K${suffix}`
      : match[1].replace(/\s+/g, "");

  return {
    id: badge.id ?? `stat-${index}`,
    value: compact,
    caption: match[2],
  };
}

export function HomeLandingHero({ content, work, className }: HomeLandingHeroProps) {
  const badges = content.badges ?? [];
  const stats = badges
    .map(badgeToStat)
    .filter((stat): stat is HeroSceneStat => stat !== null);
  const ctas = [content.cta, content.secondaryCta].flatMap((cta) => (cta ? [cta] : []));
  const titleLines = resolveTitleLines(content.title);
  const lastLine = titleLines.length - 1;

  return (
    <section
      className={cn(
        "hero-stage relative grid w-full items-center gap-x-10 gap-y-12 pb-10 pt-4 sm:pt-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:pb-16 lg:pt-10",
        className,
      )}
    >
      <HeroOrbitField />

      <div className="flex flex-col items-center px-2 text-center lg:items-start lg:px-0 lg:text-left">
        <motion.div custom={0} initial={false} animate="visible" variants={rise}>
          <span className="section-tag">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#22c55e]/60" />
              <span className="relative size-2 rounded-full bg-[#22c55e]" />
            </span>
            {content.eyebrow ?? "Available for new projects"}
          </span>
        </motion.div>

        <h1 className="mt-5 text-balance font-sans text-[clamp(2.3rem,1.3rem+3.3vw,3.9rem)] font-medium leading-[1.12] tracking-[-0.045em] text-text-primary">
          {titleLines.map((line, index) => (
            <motion.span
              key={`${line}-${index}`}
              custom={1 + index}
              initial={false}
              animate="visible"
              variants={rise}
              className="block text-balance"
            >
              {index === lastLine && titleLines.length > 1 ? (
                <span
                  className="marker marker--soft marker-sweep"
                  style={{ ["--marker-delay" as string]: "520ms" }}
                >
                  {line}
                </span>
              ) : (
                line
              )}
            </motion.span>
          ))}
        </h1>

        {content.description ? (
          <motion.div
            custom={1 + titleLines.length}
            initial={false}
            animate="visible"
            variants={rise}
            className="mt-6 max-w-[34rem]"
          >
            <Text variant="p1" className="text-pretty">
              {content.description}
            </Text>
          </motion.div>
        ) : null}

        {ctas.length ? (
          <motion.div
            custom={2 + titleLines.length}
            initial={false}
            animate="visible"
            variants={rise}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            {ctas.map((cta, index) => (
              <PrimaryButton
                key={`${cta.label}-${cta.href}`}
                label={cta.label}
                href={cta.href}
                external={cta.external}
                Icon={resolveCTAIcon(cta)}
                iconVisibility="hover"
                tone={index === 0 && (!cta.tone || cta.tone === "default") ? "accent" : cta.tone ?? "white"}
              />
            ))}
          </motion.div>
        ) : null}

        {stats.length ? (
          <motion.dl
            custom={3 + titleLines.length}
            initial={false}
            animate="visible"
            variants={rise}
            className="mt-10 flex w-full max-w-[34rem] items-stretch justify-center divide-x divide-[rgba(var(--shade-rgb),0.12)] lg:justify-start"
          >
            {stats.slice(0, 3).map((stat, index) => (
              <div
                key={stat.id}
                className={cn(
                  "flex flex-col gap-1.5 px-4 text-left first:pl-0 sm:px-6",
                  index === 2 && "max-[420px]:hidden",
                )}
              >
                <dt className="order-2 text-[0.78rem] leading-tight text-text-secondary">
                  {stat.caption}
                </dt>
                <dd className="order-1 flex items-center gap-1.5 text-[clamp(1.35rem,1rem+1.2vw,1.85rem)] font-medium leading-none tracking-[-0.04em] text-text-primary tabular-nums">
                  {stat.value}
                  <ShapeGlyph
                    shape={(["triangle", "circle", "cross"] as const)[index % 3]}
                    className="size-3.5 text-accent"
                  />
                </dd>
              </div>
            ))}
          </motion.dl>
        ) : null}
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        className="px-8 pb-[4.5rem] pt-6 sm:px-12 lg:px-0 lg:pb-10 lg:pt-0"
      >
        <HeroScene stats={stats} work={work} />
      </motion.div>
    </section>
  );
}
