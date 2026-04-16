"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { ImpactCardConfig, ImpactCardSize } from "@/types";
import { resolveImpactAccent } from "./impact-theme";
import {
  Bars,
  BeforeAfterBar,
  BreakdownBar,
  CountUp,
  Sparkline,
  TrendChip,
} from "./impact-visuals";

const ease = [0.22, 1, 0.36, 1] as const;
const viewport = { amount: 0.35, once: false } as const;

export const sizeSpanClass: Record<ImpactCardSize, string> = {
  sm: "col-span-2 sm:col-span-3 md:col-span-2 lg:col-span-2",
  md: "col-span-2 sm:col-span-6 md:col-span-3 lg:col-span-3",
  wide: "col-span-2 sm:col-span-6 md:col-span-6 lg:col-span-4",
  tall: "col-span-2 sm:col-span-6 md:col-span-2 lg:col-span-2 md:row-span-2",
  hero: "col-span-2 sm:col-span-6 md:col-span-4 lg:col-span-4 md:row-span-2",
};

interface ImpactCardProps {
  card: ImpactCardConfig;
  onSelect: (card: ImpactCardConfig) => void;
  hidden?: boolean;
}

export function ImpactCard({ card, onSelect, hidden = false }: ImpactCardProps) {
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const inView = useInView(rootRef, viewport);
  const tokens = resolveImpactAccent(card.accent);

  return (
    <motion.button
      ref={rootRef}
      type="button"
      layoutId={`impact-card-${card.id}`}
      onClick={() => onSelect(card)}
      aria-label={`Expand impact card: ${card.shortLabel ?? card.title}`}
      initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={viewport}
      transition={{ duration: 0.55, ease }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      style={{ visibility: hidden ? "hidden" : "visible" }}
      className={cn(
        "group relative flex min-h-[11rem] flex-col overflow-hidden rounded-[1.75rem] text-left",
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(248,247,252,0.98)_100%)]",
        "border border-border-accent/55",
        "shadow-[0_24px_60px_rgba(88,28,135,0.10),0_4px_12px_rgba(15,23,42,0.06)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/22",
        sizeSpanClass[card.size],
      )}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-80 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: tokens.gradient }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${tokens.ring}`,
        }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${tokens.ring} 50%, transparent 100%)`,
          opacity: 0.65,
        }}
      />

      <div className="relative z-10 flex h-full flex-col gap-4 p-5 sm:p-6">
        <CardHeader card={card} inView={inView} />

        <div className="relative flex flex-1 flex-col justify-between gap-4">
          <CardBody card={card} inView={inView} />
        </div>
      </div>
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */

function CardHeader({ card, inView }: { card: ImpactCardConfig; inView: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/78">
          {card.shortLabel ?? card.category}
        </span>
      </div>

      {card.trend ? (
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : 8 }}
          transition={{ duration: 0.4, ease, delay: 0.25 }}
        >
          <TrendChip display={card.trend.display} direction={card.trend.direction} />
        </motion.div>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Type-dispatched body renderer. Each card type picks its own visual —
   all driven by `card.type` from data.
   -------------------------------------------------------------------------- */

function CardBody({ card, inView }: { card: ImpactCardConfig; inView: boolean }) {
  const tokens = resolveImpactAccent(card.accent);

  switch (card.type) {
    case "featured":
      return <FeaturedBody card={card} inView={inView} />;

    case "comparison":
      return card.comparison ? (
        <div className="flex flex-col gap-4">
          <HeadlineBlock card={card} inView={inView} sizeClass="text-[clamp(1.6rem,2vw,2.1rem)]" />
          <BeforeAfterBar
            baseline={card.comparison.baseline}
            current={card.comparison.current}
            multiplier={card.comparison.multiplier}
            isActive={inView}
          />
        </div>
      ) : null;

    case "before-after":
      return card.beforeAfter ? (
        <div className="flex flex-col gap-4">
          <HeadlineBlock card={card} inView={inView} sizeClass="text-[clamp(1.6rem,2vw,2.1rem)]" />
          <BeforeAfterBar
            baseline={card.beforeAfter.baseline}
            current={card.beforeAfter.current}
            multiplier={card.beforeAfter.multiplier}
            isActive={inView}
          />
        </div>
      ) : null;

    case "breakdown":
      return card.breakdown ? (
        <div className="flex flex-col gap-4">
          <HeadlineBlock card={card} inView={inView} sizeClass="text-[clamp(1.4rem,1.6vw,1.75rem)]" />
          <BreakdownBar segments={card.breakdown} isActive={inView} />
        </div>
      ) : null;

    case "partner-mix":
    case "collaboration-count":
      return (
        <div className="flex h-full flex-col justify-between gap-4">
          <HeadlineBlock card={card} inView={inView} />
          {card.chart?.kind === "bars" ? (
            <div className="h-20">
              <Bars
                points={card.chart.points}
                accent={card.accent}
                isActive={inView}
                showLabels
                max={card.chart.max}
              />
            </div>
          ) : card.partners ? (
            <PartnerStack partners={card.partners} tokens={tokens} inView={inView} />
          ) : null}
        </div>
      );

    case "bar-visualization":
      return card.chart ? (
        <div className="flex h-full flex-col justify-between gap-4">
          <HeadlineBlock card={card} inView={inView} />
          <div className="h-24">
            <Bars
              points={card.chart.points}
              accent={card.accent}
              isActive={inView}
              max={card.chart.max}
            />
          </div>
        </div>
      ) : null;

    case "sparkline":
    case "stat-trend":
      return (
        <div className="flex h-full flex-col justify-between gap-4">
          <HeadlineBlock card={card} inView={inView} />
          {card.chart?.kind === "sparkline" ? (
            <div className="h-14">
              <Sparkline points={card.chart.points} accent={card.accent} isActive={inView} />
            </div>
          ) : null}
        </div>
      );

    case "stat":
    default:
      return (
        <div className="flex h-full flex-col justify-between gap-4">
          <HeadlineBlock card={card} inView={inView} />
          {card.chart?.kind === "bars" ? (
            <div className="h-16">
              <Bars
                points={card.chart.points}
                accent={card.accent}
                isActive={inView}
                showLabels={false}
                max={card.chart.max}
              />
            </div>
          ) : card.chart?.kind === "sparkline" ? (
            <div className="h-14">
              <Sparkline points={card.chart.points} accent={card.accent} isActive={inView} />
            </div>
          ) : null}
        </div>
      );
  }
}

/* --------------------------------------------------------------------------
   Featured hero body — large metric, short description, animated area chart
   sitting behind the copy.
   -------------------------------------------------------------------------- */

function FeaturedBody({ card, inView }: { card: ImpactCardConfig; inView: boolean }) {
  return (
    <div className="relative flex h-full flex-col justify-between gap-4">
      {card.chart?.kind === "area" || card.chart?.kind === "sparkline" ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 opacity-70">
          <Sparkline
            points={card.chart.points}
            accent={card.accent}
            isActive={inView}
            strokeWidth={2.25}
            height={56}
          />
        </div>
      ) : null}

      <div className="relative z-10 flex flex-col gap-2">
        <h3 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tracking-[-0.04em] text-text-primary">
          <CountUp
            value={card.metric.value}
            display={card.metric.display}
            isActive={inView}
            duration={1.4}
            format={(current, target) => {
              const hasDecimal = Math.abs(target % 1) > 0;
              const num = hasDecimal ? current.toFixed(1) : Math.round(current).toString();
              return card.metric.unit ? `${num}${card.metric.unit}` : num;
            }}
          />
        </h3>
        <p className="max-w-md text-[15px] leading-relaxed text-text-secondary">{card.subtitle}</p>
      </div>

      {card.tags?.length ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 6 }}
          transition={{ duration: 0.45, ease, delay: 0.35 }}
          className="relative z-10 flex flex-wrap gap-2"
        >
          {card.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border-accent/70 bg-white/74 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-dark/76"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
   HeadlineBlock — the metric display + subtitle shared across most types.
   -------------------------------------------------------------------------- */

function HeadlineBlock({
  card,
  inView,
  sizeClass,
}: {
  card: ImpactCardConfig;
  inView: boolean;
  sizeClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3
        className={cn(
          "font-bold leading-[0.95] tracking-[-0.035em] text-text-primary",
          sizeClass ?? "text-[clamp(1.85rem,2.6vw,2.75rem)]",
        )}
      >
        <CountUp
          value={card.metric.value}
          display={card.metric.display}
          isActive={inView}
          format={(current, target) => {
            const hasDecimal = Math.abs(target % 1) > 0;
            const num = hasDecimal ? current.toFixed(1) : Math.round(current).toString();
            return card.metric.unit ? `${num}${card.metric.unit}` : num;
          }}
        />
      </h3>
      {card.subtitle ? (
        <p className="text-[13px] leading-snug text-text-secondary">{card.subtitle}</p>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
   PartnerStack — small list of partner names, staggered-in.
   -------------------------------------------------------------------------- */

function PartnerStack({
  partners,
  tokens,
  inView,
}: {
  partners: NonNullable<ImpactCardConfig["partners"]>;
  tokens: ReturnType<typeof resolveImpactAccent>;
  inView: boolean;
}) {
  return (
    <ul className="flex flex-col gap-1.5">
      {partners.slice(0, 4).map((partner, index) => (
        <motion.li
          key={partner.id}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -6 }}
          transition={{ duration: 0.35, ease, delay: 0.2 + 0.06 * index }}
          className="flex items-center gap-2 text-[12px] text-text-secondary"
        >
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: tokens.foreground, boxShadow: `0 0 8px ${tokens.soft}` }}
          />
          <span className="flex-1 truncate font-medium text-text-primary">{partner.name}</span>
          {partner.role ? (
            <span className="truncate text-[11px] text-text-secondary/70">{partner.role}</span>
          ) : null}
        </motion.li>
      ))}
    </ul>
  );
}
