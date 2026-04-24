"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { CalendarDays, Mail } from "lucide-react";
import { Hero } from "@/components/sections/hero";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ProfileCard } from "@/components/ui/profile-card";
import { BookCallButton } from "@/components/about/book-call-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { renderStatusBadgeLeading } from "@/components/ui/status-badge-leading";
import { Heading, Text } from "@/components/ui/typography";
import {
  aboutPageContent,
  type AboutAvailabilityStat,
  type AboutExperienceItem,
  type AboutPageContent,
  type AboutTeamMember,
} from "@/data/about";
import { caveat } from "@/config/fonts";
import { cn } from "@/lib/utils";
import type { SiteConfig } from "@/types";
import { siteConfig } from "@/data/site";

const softSurfaceGradient: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,247,252,0.88) 100%)",
};

const mobileFlatSectionClassName =
  "max-md:!rounded-none max-md:!border-transparent max-md:!bg-none max-md:!shadow-none max-md:!backdrop-blur-none max-md:!p-0";

function IntroBadgeRow({
  badges,
}: {
  badges: AboutPageContent["intro"]["badges"];
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {badges.map((badge) => (
        <StatusBadge
          key={badge.id ?? badge.label}
          interactive={false}
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
      ))}
    </div>
  );
}

function AvailabilityStatCard({ stat }: { stat: AboutAvailabilityStat }) {
  return (
    <div
      className="relative flex h-full flex-col justify-center overflow-hidden rounded-[1.45rem] border border-white/80 px-5 py-6 text-center"
      style={softSurfaceGradient}
    >
      <Text
        as="span"
        variant="p3"
        className="uppercase tracking-[0.18em] text-text-secondary/70"
      >
        {stat.label}
      </Text>
      <div className="mt-3 flex items-center justify-center gap-2">
        {stat.statusColor ? (
          <span
            aria-hidden
            className="size-2.5 rounded-full shadow-[0_0_0_5px_rgba(34,197,94,0.12)]"
            style={{ backgroundColor: stat.statusColor }}
          />
        ) : null}
        <Heading variant="h5" as="h3" className="text-center">
          {stat.value}
        </Heading>
      </div>
      {stat.meta ? (
        <Text variant="p3" className="mt-1 text-center">
          {stat.meta}
        </Text>
      ) : null}
    </div>
  );
}

const EXPERIENCE_BLOB_PATH =
  "M47.2,-61.9C59.9,-52.5,68.3,-36.8,71.1,-20.6C73.9,-4.4,71.1,12.3,63.6,27.4C56.1,42.5,43.9,56,28.8,62.5C13.7,69,-4.3,68.6,-20.6,62.8C-36.9,57,-51.4,45.8,-60.2,31.3C-69,16.8,-72.1,-1,-67.9,-16.3C-63.7,-31.6,-52.2,-44.4,-39,-53.4C-25.8,-62.4,-12.9,-67.6,2.3,-70.7C17.6,-73.8,35.2,-74.8,47.2,-61.9Z";

function ExperienceCard({ item }: { item: AboutExperienceItem }) {
  const isDarkTone = item.tone === "#2f1544";
  const logoSrc = item.companyImageUrl?.trim() ? item.companyImageUrl : null;

  return (
    <article
      className="relative flex flex-col overflow-hidden rounded-[1.75rem] border border-white/80 p-3 shadow-[0_22px_58px_rgba(88,28,135,0.10)]"
      style={softSurfaceGradient}
    >
      <div className="relative aspect-[1/1.05] overflow-hidden rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.65)_0%,rgba(248,247,252,0.55)_100%)]">
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center text-[clamp(6rem,18vw,10rem)] font-black tracking-[-0.08em] text-black/[0.04]"
        >
          {item.initials}
        </span>

        <svg
          aria-hidden
          viewBox="-100 -100 200 200"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d={EXPERIENCE_BLOB_PATH}
            fill={item.tone}
            opacity="0.55"
            transform="translate(-4 -2) scale(1.06)"
          />
          <path d={EXPERIENCE_BLOB_PATH} fill={item.tone} />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center p-3">
          {logoSrc ? (
            <div className="relative h-full w-full">
              <Image
                src={logoSrc}
                alt={`${item.company} logo`}
                fill
                sizes="(max-width: 640px) 60vw, 220px"
                className="object-contain"
              />
            </div>
          ) : (
            <span
              className="text-[clamp(2.5rem,5vw,3.5rem)] font-black tracking-[-0.04em]"
              style={{ color: isDarkTone ? "#faf5ff" : "#2f1544" }}
            >
              {item.initials}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex-1 px-2 text-center">
        <Heading variant="h4" as="h3">
          {item.company}
        </Heading>
        <p className="mt-1 text-sm font-semibold text-accent">{item.role}</p>
        <Text variant="p3" className="mx-auto mt-3 max-w-[30ch] text-pretty text-center">
          {item.summary}
        </Text>
      </div>

      <div className="mx-2 mt-5 border-t border-dashed border-black/10" />

      <div className="mt-4 flex items-center gap-3 px-2 pb-1">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-black/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
          style={{ backgroundColor: item.tone }}
        >
          <CalendarDays
            className="size-4"
            strokeWidth={2.1}
            style={{ color: isDarkTone ? "#faf5ff" : "#2f1544" }}
          />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-[-0.02em] text-text-primary">
            {item.dates}
          </p>
          <Text variant="p3" className="mt-0.5 text-xs">
            {item.location}
          </Text>
        </div>
      </div>
    </article>
  );
}

function TeamCard({ member }: { member: AboutTeamMember }) {
  return (
    <ProfileCard
      imageSrc={member.imageSrc}
      imageAlt={member.imageAlt ?? `Illustration of ${member.name}`}
      name={member.name}
      designation={member.designation}
      rows={member.rows}
      status="available"
      className="w-full max-w-[22rem] sm:max-w-[24rem]"
    />
  );
}

interface AboutPageProps {
  content?: AboutPageContent;
  site?: SiteConfig;
}

export function AboutPage({
  content = aboutPageContent,
  site = siteConfig,
}: AboutPageProps) {
  return (
    <div className="flex flex-1">
      <main className="page-section-stack mx-auto flex w-full max-w-6xl flex-1 flex-col px-2 pb-32 pt-4 md:px-10 md:pb-40">
        <section className="page-reveal relative">
          <IntroBadgeRow badges={content.intro.badges} />

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.18fr)] xl:items-center">
            <div className="flex justify-center xl:justify-start">
              <ProfileCard
                imageSrc="/Arnab.svg"
                imageAlt={`Illustration of ${content.intro.name}`}
                name={content.intro.name}
                designation={content.intro.role}
                status="available"
                rows={[
                  {
                    label: ["Upcoming", "Projects"],
                    value: "02",
                    labelHighlightColor: "#fef9c3",
                  },
                  {
                    label: ["Ongoing", "Projects"],
                    value: "02",
                    labelHighlightColor: "#fce7f3",
                  },
                  {
                    label: ["Shipped", "Projects"],
                    value: "02",
                    labelHighlightColor: "#dcfce7",
                  },
                ]}
                className="w-full max-w-[22rem] sm:max-w-[24rem]"
              />
            </div>

            <article
              className="relative overflow-hidden rounded-[2rem] border border-white/80 p-6 shadow-[0_24px_60px_rgba(88,28,135,0.08)] sm:p-8 md:p-10"
              style={softSurfaceGradient}
            >
              <div className="pointer-events-none absolute inset-0 max-md:hidden bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.65),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(216,180,254,0.18),transparent_32%)]" />

              <div className="relative z-[1]">
                <h2
                  className={cn(
                    "text-[clamp(2.1rem,5.6vw,4.2rem)] font-bold leading-[0.98] tracking-[-0.035em] text-text-primary",
                  )}
                  aria-label={content.intro.title}
                >
                  <span aria-hidden>A designer who cares more about </span>
                  <span
                    aria-hidden
                    className="relative inline-block whitespace-nowrap align-baseline"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-[-0.08em] bottom-[0.14em] h-[0.38em] -rotate-[1.5deg] rounded-[0.4em] bg-accent/25"
                    />
                    <span
                      className={cn(
                        caveat.className,
                        "relative text-[1.1em] leading-[0.9] text-accent-dark",
                      )}
                    >
                      clarity
                    </span>
                  </span>
                  <span aria-hidden> than </span>
                  <span
                    aria-hidden
                    className={cn(
                      caveat.className,
                      "text-[1.1em] leading-[0.9] text-text-primary/40 line-through decoration-accent/55 decoration-[0.06em] underline-offset-[0.05em]",
                    )}
                  >
                    decoration.
                  </span>
                </h2>

                <div className="mt-8 space-y-5">
                  {content.intro.paragraphs.map((paragraph) => (
                    <Text key={paragraph} variant="p2" className="max-w-2xl text-pretty">
                      {paragraph}
                    </Text>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-dashed border-black/8 pt-6">
                  <p
                    className={cn(
                      caveat.className,
                      "text-[clamp(2rem,5vw,3rem)] leading-none tracking-[-0.05em] text-accent-dark",
                    )}
                  >
                    - {content.intro.signature}
                  </p>
                  <Text
                    as="span"
                    variant="p3"
                    className="uppercase tracking-[0.16em] text-text-secondary/76"
                  >
                    {content.intro.timezone}
                  </Text>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section
          className={cn(
            "page-section-frame page-surface page-reveal relative overflow-hidden",
            mobileFlatSectionClassName,
          )}
        >
          <div className="pointer-events-none absolute inset-0 max-md:hidden bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.12),transparent_42%)]" />

          <Hero
            content={content.experienceHero}
            className="min-h-0 py-0"
            childrenClassName="mt-12"
          >
            <div className="relative">
              <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
                <Heading variant="h4" as="h2">
                  Work history
                </Heading>
                <Text
                  as="span"
                  variant="p3"
                  className="uppercase tracking-[0.18em] text-text-secondary/76"
                >
                  {content.experienceMeta}
                </Text>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {content.experience.map((item) => (
                  <ExperienceCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </Hero>
        </section>

        <section
          className={cn(
            "page-section-frame page-surface page-reveal relative overflow-hidden",
            mobileFlatSectionClassName,
          )}
        >
          <div className="pointer-events-none absolute inset-0 max-md:hidden bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.12),transparent_46%)]" />

          <Hero content={content.teamHero} className="min-h-0 py-0" childrenClassName="mt-12">
            <div className="grid justify-items-center gap-6 sm:grid-cols-2">
              {content.team.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          </Hero>
        </section>

        <section
          className={cn(
            "page-section-frame page-surface page-reveal relative overflow-hidden",
            mobileFlatSectionClassName,
          )}
        >
          <div className="pointer-events-none absolute inset-0 max-md:hidden bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_44%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.4),transparent_34%)]" />

          <div className="relative mx-auto max-w-4xl text-center">
            <StatusBadge
              interactive={false}
              tone={content.contact.badge.tone}
              textColor={content.contact.badge.textColor}
              iconColor={content.contact.badge.iconColor}
              indicatorColor={content.contact.badge.indicatorColor}
              showIndicator={content.contact.badge.icon === "indicator"}
              pulse={content.contact.badge.pulse}
            >
              {content.contact.badge.label}
            </StatusBadge>

            <Heading variant="h2" as="h2" className="mt-6 text-[clamp(2.4rem,7vw,4.6rem)]">
              {content.contact.lead}{" "}
              <span className="font-secondary italic text-accent">
                {content.contact.accent}
              </span>{" "}
              {content.contact.tail}
            </Heading>

            <Text variant="p1" className="mx-auto mt-5 max-w-2xl text-center">
              {content.contact.description}
            </Text>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <PrimaryButton
                label={content.contact.primaryLabel}
                href={site.contact.inquiryPath}
                Icon={Mail}
              />
              <BookCallButton label={content.contact.secondaryLabel} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
