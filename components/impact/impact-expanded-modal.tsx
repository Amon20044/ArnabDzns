"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useId } from "react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { HeroCTAConfig, ImpactCardConfig, ImpactTrendStatus } from "@/types";
import { impactBodyRegistry } from "@/content/impact/registry";
import { resolveImpactAccent } from "./impact-theme";
import { impactMdxComponents } from "./impact-mdx-components";
import { Bars, BeforeAfterBar, BreakdownBar, CountUp, Sparkline } from "./impact-visuals";

const ease = [0.22, 1, 0.36, 1] as const;
const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

interface ImpactExpandedModalProps {
  card: ImpactCardConfig | null;
  cta?: HeroCTAConfig;
  onClose: () => void;
}

interface SummaryTile {
  label: string;
  value: string;
  note?: string;
}

export function ImpactExpandedModal({ card, cta, onClose }: ImpactExpandedModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!card) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [card, onClose]);

  return (
    <AnimatePresence>
      {card ? (
        <ImpactExpandedModalContent
          card={card}
          cta={cta}
          onClose={onClose}
          titleId={titleId}
          descriptionId={descriptionId}
        />
      ) : null}
    </AnimatePresence>
  );
}

function ImpactExpandedModalContent({
  card,
  cta,
  onClose,
  titleId,
  descriptionId,
}: {
  card: ImpactCardConfig;
  cta?: HeroCTAConfig;
  onClose: () => void;
  titleId: string;
  descriptionId: string;
}) {
  const tokens = resolveImpactAccent(card.accent);
  const BodyComponent = card.bodySlug ? impactBodyRegistry[card.bodySlug] : null;
  const summaryTiles = getSummaryTiles(card);
  const titleMatchesMetric = card.title.trim() === card.metric.display.trim();

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
    >
      <motion.button
        type="button"
        aria-label="Close impact story"
        className="absolute inset-0 bg-[rgba(240,238,245,0.62)] backdrop-blur-xl"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        layoutId={`impact-card-${card.id}`}
        transition={{ layout: { duration: 0.55, ease } }}
        className="relative z-[1] flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden border border-border-accent/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(248,247,252,0.98)_100%)] text-text-primary shadow-[0_40px_120px_rgba(88,28,135,0.16)] sm:h-[min(92dvh,60rem)] sm:max-w-6xl sm:rounded-[2rem]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-95"
          style={{
            background: `${tokens.gradient}, radial-gradient(circle at top left, rgba(255,255,255,0.42) 0%, transparent 32%), linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0) 32%)`,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${tokens.ring} 50%, transparent 100%)`,
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-4 border-b border-border-accent/55 bg-white/68 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge compact interactive={false} tone={tokens.badgeTone} textColor="#fafafa" iconColor="#fafafa">
              {formatLabel(card.category)}
            </StatusBadge>
            {card.featured ? (
              <StatusBadge compact interactive={false} tone="#18181b" textColor="#fafafa">
                Featured snapshot
              </StatusBadge>
            ) : null}
            {card.trend ? (
              <StatusBadge compact interactive={false} tone={resolveTrendTone(card.trend.status)} textColor="#fafafa">
                {card.trend.display}
                {card.trend.timeframe ? ` ${card.trend.timeframe}` : ""}
              </StatusBadge>
            ) : null}
            {card.updatedAt ? (
              <StatusBadge compact interactive={false} tone="#ffffff" textColor="#52525b">
                Updated {formatDate(card.updatedAt)}
              </StatusBadge>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border-accent/60 bg-white/78 text-text-secondary transition-[transform,border-color,color] duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:text-text-primary"
            aria-label="Close impact story"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <div
          className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-6"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="grid min-h-full gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)]">
            <div className="space-y-6">
              <section className="rounded-[1.8rem] border border-border-accent/60 bg-white/76 p-5 shadow-[0_22px_60px_rgba(88,28,135,0.10)] sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary/78">
                  {card.shortLabel ?? formatLabel(card.category)}
                </p>

                {titleMatchesMetric ? (
                  <h2
                    id={titleId}
                    className="mt-3 text-[clamp(2.6rem,6vw,4.9rem)] font-bold leading-[0.92] tracking-[-0.05em] text-text-primary"
                  >
                    <CountUp
                      value={card.metric.value}
                      display={card.metric.display}
                      isActive
                      duration={1.2}
                      format={(current, target) => formatMetricValue(current, target, card.metric)}
                    />
                  </h2>
                ) : (
                  <>
                    <h2
                      id={titleId}
                      className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-text-primary"
                    >
                      {card.title}
                    </h2>
                    <div className="mt-5 inline-flex items-end gap-3 rounded-[1.4rem] border border-border-accent/60 bg-accent-surface/72 px-4 py-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/78">
                        {card.metric.label ?? "Primary metric"}
                      </span>
                      <span className="text-[1.85rem] font-semibold leading-none tracking-[-0.04em] text-text-primary">
                        <CountUp
                          value={card.metric.value}
                          display={card.metric.display}
                          isActive
                          duration={1.15}
                          format={(current, target) => formatMetricValue(current, target, card.metric)}
                        />
                      </span>
                    </div>
                  </>
                )}

                {card.subtitle ? (
                  <p id={descriptionId} className="mt-4 max-w-3xl text-[1rem] leading-8 text-text-secondary">
                    {card.subtitle}
                  </p>
                ) : null}

                {card.tags?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border-accent/70 bg-white/76 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-dark/76"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {summaryTiles.length ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {summaryTiles.map((tile) => (
                      <SummaryMetricTile key={`${tile.label}-${tile.value}`} tile={tile} />
                    ))}
                  </div>
                ) : null}
              </section>

              {BodyComponent ? (
                <section className="rounded-[1.8rem] border border-border-accent/60 bg-white/72 p-5 shadow-[0_20px_54px_rgba(88,28,135,0.08)] sm:p-6">
                  <div className="mx-auto max-w-3xl">
                    <BodyComponent components={impactMdxComponents} />
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-6">
              <section className="rounded-[1.8rem] border border-border-accent/60 bg-white/76 p-5 shadow-[0_20px_54px_rgba(88,28,135,0.08)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary/78">
                      Visual signal
                    </p>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      A compact read of how this impact story moved over time.
                    </p>
                  </div>
                  <ArrowUpRight className="size-4.5 shrink-0 text-text-secondary/64" />
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-border-accent/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(243,232,255,0.76)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                  <ModalVisual card={card} />
                </div>
              </section>

              {card.partners?.length ? (
                <section className="rounded-[1.8rem] border border-border-accent/60 bg-white/72 p-5 shadow-[0_20px_54px_rgba(88,28,135,0.08)] sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary/78">
                    Collaboration roster
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {card.partners.map((partner) => (
                      <li
                        key={partner.id}
                        className="flex items-center justify-between gap-3 rounded-[1.15rem] border border-border-accent/55 bg-white/80 px-4 py-3 text-sm text-text-secondary"
                      >
                        <span className="font-medium text-text-primary">{partner.name}</span>
                        {partner.role ? <span className="text-text-secondary/72">{partner.role}</span> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {cta ? (
                <section className="rounded-[1.8rem] border border-border-accent/65 bg-[linear-gradient(135deg,rgba(243,232,255,0.94)_0%,rgba(255,255,255,0.90)_100%)] p-5 shadow-[0_24px_60px_rgba(76,29,149,0.10)] sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-dark/76">
                    Next step
                  </p>
                  <h3 className="mt-2 text-[1.35rem] font-semibold leading-[1.08] tracking-[-0.03em] text-text-primary">
                    Want this kind of momentum baked into the creative from day one?
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">
                    The same design system thinking can shape your launch, campaign reset, or creator
                    rollout next.
                  </p>
                  <div className="mt-5">
                    <PrimaryButton
                      label={cta.label}
                      href={cta.href}
                      external={cta.external}
                      className="w-full"
                      fullWidth
                    />
                  </div>
                </section>
              ) : null}
            </aside>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SummaryMetricTile({ tile }: { tile: SummaryTile }) {
  return (
    <div className="rounded-[1.4rem] border border-border-accent/55 bg-white/78 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/78">{tile.label}</p>
      <p className="mt-2 text-[1.55rem] font-semibold leading-none tracking-[-0.04em] text-text-primary">
        {tile.value}
      </p>
      {tile.note ? <p className="mt-2 text-sm leading-6 text-text-secondary">{tile.note}</p> : null}
    </div>
  );
}

function ModalVisual({ card }: { card: ImpactCardConfig }) {
  if (card.type === "before-after" && card.beforeAfter) {
    return (
      <BeforeAfterBar
        baseline={card.beforeAfter.baseline}
        current={card.beforeAfter.current}
        multiplier={card.beforeAfter.multiplier}
        isActive
      />
    );
  }

  if (card.type === "comparison" && card.comparison) {
    return (
      <BeforeAfterBar
        baseline={card.comparison.baseline}
        current={card.comparison.current}
        multiplier={card.comparison.multiplier}
        isActive
      />
    );
  }

  if (card.breakdown?.length) {
    return <BreakdownBar segments={card.breakdown} isActive />;
  }

  if (card.chart?.kind === "bars") {
    return (
      <Bars
        points={card.chart.points}
        accent={card.accent}
        isActive
        orientation="horizontal"
        max={card.chart.max}
      />
    );
  }

  if (card.chart?.kind === "sparkline" || card.chart?.kind === "area") {
    return (
      <div className="flex h-40 flex-col justify-end">
        <Sparkline
          points={card.chart.points}
          accent={card.accent}
          isActive
          height={88}
          strokeWidth={2.3}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-32 flex-col justify-center rounded-[1.25rem] border border-dashed border-border-accent/55 px-4 py-5 text-sm leading-7 text-text-secondary">
      Open a different card to see chart-driven movement, before/after shifts, or category mix
      breakdowns here.
    </div>
  );
}

function getSummaryTiles(card: ImpactCardConfig): SummaryTile[] {
  const tiles: SummaryTile[] = [];

  if (card.metric.label) {
    tiles.push({ label: "Primary metric", value: card.metric.display, note: card.metric.label });
  }

  if (card.trend) {
    tiles.push({ label: "Trend", value: card.trend.display, note: card.trend.timeframe });
  }

  const comparison = card.beforeAfter ?? card.comparison;
  if (comparison?.multiplier) {
    tiles.push({
      label: "Lift",
      value: comparison.multiplier,
      note: `${comparison.baseline.label} to ${comparison.current.label}`,
    });
  }

  if (card.campaignStats?.impressions) {
    tiles.push({
      label: "Campaign impressions",
      value: compactNumberFormatter.format(card.campaignStats.impressions),
      note: "tracked across active placements",
    });
  }

  if (card.campaignStats?.likes) {
    tiles.push({
      label: "Likes generated",
      value: compactNumberFormatter.format(card.campaignStats.likes),
      note: "organic + collaborative posts",
    });
  }

  if (typeof card.campaignStats?.clickThroughRate === "number") {
    tiles.push({
      label: "CTR",
      value: `${(card.campaignStats.clickThroughRate * 100).toFixed(1)}%`,
      note: "post-redesign click-through",
    });
  }

  if (typeof card.campaignStats?.engagementRate === "number") {
    tiles.push({
      label: "Engagement rate",
      value: `${(card.campaignStats.engagementRate * 100).toFixed(1)}%`,
      note: "average on tracked drops",
    });
  }

  if (card.partners?.length) {
    tiles.push({
      label: "Named collaborators",
      value: `${card.partners.length}`,
      note: "captured in this snapshot",
    });
  }

  if (card.breakdown?.length) {
    tiles.push({
      label: "Impact segments",
      value: `${card.breakdown.length}`,
      note: "active categories in the mix",
    });
  }

  return tiles.slice(0, 6);
}

function formatMetricValue(current: number, target: number, metric: ImpactCardConfig["metric"]) {
  const hasDecimal = Math.abs(target % 1) > 0;
  const rawValue = hasDecimal ? current.toFixed(1) : Math.round(current).toLocaleString();
  const prefix = metric.display.startsWith("+") ? "+" : metric.display.startsWith("-") ? "-" : "";
  return `${prefix}${rawValue}${metric.unit ?? ""}`;
}

function resolveTrendTone(status: ImpactTrendStatus) {
  if (status === "positive") {
    return "#10b981";
  }

  if (status === "negative") {
    return "#f43f5e";
  }

  return "#111827";
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatLabel(value: string) {
  return value.replace(/[-_]/g, " ");
}
