"use client";

import type { CSSProperties } from "react";
import { ArrowUpRight, CalendarClock, Mail } from "lucide-react";
import { Hero } from "@/components/sections/hero";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Icon } from "@/components/ui/icon";
import { ProfileCard } from "@/components/ui/profile-card";
import { StatusBadge } from "@/components/ui/status-badge";
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
      {badges.map((badge) => {
        const hasIndicator = badge.icon === "indicator";
        const hasIcon = badge.icon && badge.icon !== "none" && !hasIndicator;

        return (
          <span
            key={badge.id ?? badge.label}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold tracking-[-0.01em] shadow-[0_12px_30px_rgba(88,28,135,0.08)]"
            style={{
              backgroundColor: badge.tone ?? "rgba(255,255,255,0.94)",
              color: badge.textColor ?? "#18181b",
              borderColor: "rgba(255,255,255,0.72)",
            }}
          >
            {hasIndicator ? (
              <span
                aria-hidden
                className="size-2.5 rounded-full shadow-[0_0_0_4px_rgba(34,197,94,0.10)]"
                style={{ backgroundColor: badge.indicatorColor ?? "#22c55e" }}
              />
            ) : null}

            {hasIcon ? (
              <Icon
                name={badge.icon}
                className="size-[14px]"
                style={{ color: badge.iconColor ?? badge.textColor ?? "#18181b" }}
                strokeWidth={2.1}
              />
            ) : null}

            <span>{badge.label}</span>
          </span>
        );
      })}
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

function ExperienceRow({ item }: { item: AboutExperienceItem }) {
  const badgeTextColor = item.tone === "#2f1544" ? "#faf5ff" : "#18181b";

  return (
    <article className="grid gap-4 border-t border-black/7 py-5 first:border-t-0 md:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,2fr)_auto] md:items-center md:gap-6">
      <div
        className="flex size-12 items-center justify-center rounded-2xl border border-black/6 text-sm font-semibold tracking-[-0.02em] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
        style={{ backgroundColor: item.tone, color: badgeTextColor }}
      >
        {item.initials}
      </div>

      <div>
        <Heading variant="h5" as="h3">
          {item.company}
        </Heading>
        <Text variant="p3" className="mt-1">
          {item.role}
        </Text>
      </div>

      <Text variant="p2" className="max-w-2xl text-pretty">
        {item.summary}
      </Text>

      <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
        <div className="text-left md:text-right">
          <p className="text-sm font-semibold tracking-[-0.02em] text-text-primary">
            {item.dates}
          </p>
          <Text variant="p3" className="mt-0.5">
            {item.location}
          </Text>
        </div>

        <span className="inline-flex size-10 items-center justify-center rounded-full border border-black/8 bg-white/84 text-text-primary shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
          <ArrowUpRight className="size-4" strokeWidth={2.1} />
        </span>
      </div>
    </article>
  );
}

function PrincipleCard({
  title,
  description,
}: AboutPageContent["manifesto"]["principles"][number]) {
  return (
    <article
      className="relative overflow-hidden rounded-[1.6rem] border border-white/80 p-5 text-left shadow-[0_18px_46px_rgba(88,28,135,0.08)]"
      style={softSurfaceGradient}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
      />
      <Heading variant="h5" as="h3">
        {title}
      </Heading>
      <Text variant="p3" className="mt-3 text-pretty">
        {description}
      </Text>
    </article>
  );
}

function TeamIllustration({ member }: { member: AboutTeamMember }) {
  if (member.open) {
    return (
      <div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden rounded-[1.7rem] border border-dashed border-accent/45 bg-[linear-gradient(180deg,rgba(250,245,255,0.9)_0%,rgba(255,255,255,0.7)_100%)] px-6 py-8 text-center">
        <div className="absolute left-1/2 top-6 h-[72%] w-[46%] -translate-x-1/2 rounded-t-[7rem] rounded-b-[1.4rem] border-2 border-dashed border-accent/70" />
        <div className="relative z-[1] max-w-[14rem]">
          <p className="font-secondary text-[clamp(2rem,5vw,2.75rem)] italic leading-none tracking-[-0.04em] text-accent">
            could be you
          </p>
          <Text variant="p3" className="mt-3 text-pretty">
            Looking to add a motion designer or illustrator for select projects.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[18rem] overflow-hidden rounded-[1.7rem] border border-black/6 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_38%)]">
      <div
        aria-hidden
        className="absolute inset-x-5 bottom-0 top-5 rounded-[2.4rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
        style={{ backgroundColor: member.accent }}
      />
      <span className="absolute inset-x-0 bottom-4 text-center text-[7rem] font-bold tracking-[-0.08em] text-white/6">
        {member.initials}
      </span>
      <div className="absolute inset-x-0 top-10 flex justify-center">
        <div className="rounded-[1.6rem] border border-white/70 bg-white px-6 py-6 text-text-primary shadow-[0_22px_54px_rgba(15,23,42,0.14)]">
          <Icon name={member.icon} className="size-12" strokeWidth={1.9} />
        </div>
      </div>
    </div>
  );
}

function TeamCard({
  member,
  inquiryPath,
}: {
  member: AboutTeamMember;
  inquiryPath: string;
}) {
  const categoryTone = member.open ? "#7c3aed" : "#161122";
  const categoryTextColor = "#faf5ff";

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-white/80 p-4 shadow-[0_22px_58px_rgba(88,28,135,0.10)]",
        member.open
          ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(250,245,255,0.94)_100%)]"
          : "bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,247,252,0.92)_100%)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <StatusBadge
          compact
          interactive={false}
          tone={categoryTone}
          textColor={categoryTextColor}
          iconColor={categoryTextColor}
        >
          {member.category}
        </StatusBadge>

        <span className="inline-flex items-center rounded-full border border-black/8 bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary">
          {member.tag}
        </span>
      </div>

      <div className="mt-4">
        <TeamIllustration member={member} />
      </div>

      <div
        className={cn(
          "mt-4 flex items-center justify-between gap-3 rounded-[1.3rem] px-4 py-4",
          member.open ? "bg-[rgba(47,21,68,0.96)] text-white" : "bg-[#161122] text-white",
        )}
      >
        <div>
          <p className="text-lg font-semibold tracking-[-0.03em]">{member.name}</p>
          <p className="mt-1 text-sm leading-6 text-white/74">{member.title}</p>
        </div>

        <a
          href={inquiryPath}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/10 transition-transform duration-200 hover:-translate-y-0.5"
          aria-label={`Contact about ${member.name}`}
        >
          <ArrowUpRight className="size-4" strokeWidth={2.1} />
        </a>
      </div>

      <Text variant="p3" className="mt-4 px-1 text-pretty">
        {member.summary}
      </Text>
    </article>
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
        <section
          className={cn(
            "page-section-frame page-surface page-reveal relative overflow-hidden",
            mobileFlatSectionClassName,
          )}
        >
          <div className="pointer-events-none absolute inset-0 max-md:hidden bg-[radial-gradient(circle_at_top_left,rgba(216,180,254,0.24),transparent_28%),radial-gradient(circle_at_right_center,rgba(255,255,255,0.48),transparent_30%)]" />

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
                <Heading variant="h3" as="h2" className="mt-6 max-w-[13ch]">
                  {content.intro.title}
                </Heading>

                <div className="mt-6 space-y-5">
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
            <div
              className="relative overflow-hidden rounded-[2rem] border border-white/80 px-5 py-6 shadow-[0_20px_56px_rgba(88,28,135,0.08)] sm:px-8 sm:py-8"
              style={softSurfaceGradient}
            >
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/7 pb-6">
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

              <div className="mt-3">
                {content.experience.map((item) => (
                  <ExperienceRow key={item.id} item={item} />
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
          <div className="pointer-events-none absolute inset-0 max-md:hidden bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_44%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.4),transparent_36%)]" />

          <div className="relative mx-auto max-w-5xl text-center">
            <StatusBadge
              interactive={false}
              tone="#2f1544"
              textColor="#faf5ff"
              iconColor="#faf5ff"
            >
              {content.manifesto.eyebrow}
            </StatusBadge>

            <Heading
              variant="h1"
              as="h2"
              className="mt-6 text-[clamp(2.9rem,9vw,6.4rem)] leading-[0.9] tracking-[-0.055em]"
            >
              {content.manifesto.lead}{" "}
              <span className="font-secondary italic text-accent">
                {content.manifesto.accent}
              </span>
              <br />
              {content.manifesto.middle}{" "}
              <span className="text-text-primary/52">
                {content.manifesto.tail}
              </span>
            </Heading>

            <Text variant="p1" className="mx-auto mt-6 max-w-3xl text-center">
              {content.manifesto.description}
            </Text>
          </div>

          <div className="relative mt-12 grid gap-4 md:grid-cols-3">
            {content.manifesto.principles.map((principle) => (
              <PrincipleCard key={principle.id} {...principle} />
            ))}
          </div>
        </section>

        <section
          className={cn(
            "page-section-frame page-surface page-reveal relative overflow-hidden",
            mobileFlatSectionClassName,
          )}
        >
          <div className="pointer-events-none absolute inset-0 max-md:hidden bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.12),transparent_46%)]" />

          <Hero content={content.teamHero} className="min-h-0 py-0" childrenClassName="mt-12">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {content.team.map((member) => (
                <TeamCard
                  key={member.id}
                  member={member}
                  inquiryPath={site.contact.inquiryPath}
                />
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
              <PrimaryButton
                label={content.contact.secondaryLabel}
                href={site.contact.bookingUrl}
                external
                Icon={CalendarClock}
                tone="white"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
