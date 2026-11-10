import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ServiceArt,
  resolveServiceArt,
  serviceArtTone,
  type ServicePanelTone,
} from "@/components/illustrations/service-art";
import { ShapeGlyph } from "@/components/illustrations/stickers";
import { Hero } from "@/components/sections/hero";
import { ServiceStickers } from "@/components/sections/service-stickers";
import { Icon } from "@/components/ui/icon";
import { Heading, Text } from "@/components/ui/typography";
import { servicesSection } from "@/data/services";
import { cn } from "@/lib/utils";
import type { ServiceCardItem, ServicesSectionConfig } from "@/types";

const SHAPES = ["triangle", "circle", "cross", "square"] as const;

const SHAPE_INK: Record<(typeof SHAPES)[number], string> = {
  triangle: "var(--sticker-mint)",
  circle: "var(--sticker-red)",
  cross: "var(--sticker-cobalt)",
  square: "var(--sticker-pink)",
};

const PANEL: Record<
  ServicePanelTone,
  { surface: string; glyph: string; chip: string; numeral: string }
> = {
  violet: {
    surface: "bg-[radial-gradient(120%_120%_at_18%_0%,#b56bff_0%,#9333ea_45%,#7e22ce_100%)]",
    glyph: "text-white/15",
    chip: "bg-white/20 text-white",
    numeral: "[-webkit-text-stroke:2px_rgba(255,255,255,0.4)]",
  },
  deep: {
    surface: "bg-[radial-gradient(120%_120%_at_82%_0%,#7e22ce_0%,#581c87_58%,#3b0f63_100%)]",
    glyph: "text-white/10",
    chip: "bg-white/15 text-white",
    numeral: "[-webkit-text-stroke:2px_rgba(255,255,255,0.3)]",
  },
  ink: {
    surface: "bg-[#15121c]",
    glyph: "text-white/[0.07]",
    chip: "bg-white/12 text-white",
    numeral: "[-webkit-text-stroke:2px_rgba(255,255,255,0.22)]",
  },
  lilac: {
    surface: "bg-purple-200",
    glyph: "text-purple-400/30",
    chip: "bg-white/70 text-purple-900",
    numeral: "[-webkit-text-stroke:2px_rgba(147,51,234,0.45)]",
  },
};

/**
 * Rows alternate wide + narrow, then narrow + wide, so the grid zig-zags.
 * Every panel is the same height, which keeps each row level. Wide panels use
 * their spare width for an oversized index numeral.
 */
const isWide = (index: number) => index % 4 === 0 || index % 4 === 3;

function ServiceCard({ item, index }: { item: ServiceCardItem; index: number }) {
  const wide = isWide(index);
  const shape = SHAPES[index % SHAPES.length];
  const art = resolveServiceArt(item.id, item.title);
  const panel = PANEL[serviceArtTone[art]];
  const number = String(index + 1).padStart(2, "0");

  return (
    <article
      className={cn(
        "tray page-reveal group transition-transform duration-300 ease-out hover:-translate-y-1.5",
        wide ? "lg:col-span-7" : "lg:col-span-5",
      )}
    >
      <div className="tray-card flex h-full flex-col overflow-hidden p-1.5">
        {/* Artwork: an inset "screen" with its own scene. */}
        <div
          className={cn(
            "relative isolate h-52 shrink-0 overflow-hidden rounded-[0.95rem] sm:h-60",
            panel.surface,
          )}
        >
          <ShapeGlyph
            shape={shape}
            className={cn(
              "pointer-events-none absolute -bottom-12 -z-10 size-44 rotate-12 transition-transform duration-700 ease-out group-hover:rotate-45",
              wide ? "left-[26%] max-lg:-right-8 max-lg:left-auto" : "-right-8",
              panel.glyph,
            )}
          />

          {wide ? (
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute bottom-1 left-5 select-none text-[9.5rem] font-semibold leading-[0.8] tracking-[-0.06em] text-transparent transition-transform duration-500 ease-out group-hover:-translate-y-1.5 max-lg:hidden",
                panel.numeral,
              )}
            >
              {number}
            </span>
          ) : null}

          <ServiceArt
            kind={art}
            align={wide ? "right" : "center"}
            className={cn("absolute inset-0 h-full w-full p-2", wide && "lg:pr-6")}
          />

          <span
            className={cn(
              "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-[0.5rem] px-2 py-1.5 text-[0.68rem] font-semibold leading-none tracking-[0.12em] tabular-nums",
              panel.chip,
            )}
          >
            <ShapeGlyph shape={shape} className="size-3" style={{ color: SHAPE_INK[shape] }} />
            {number}
          </span>
        </div>

        {/* Copy */}
        <div className="flex flex-1 flex-col p-5 text-left sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 shadow-[0_3px_0_var(--color-purple-200)] transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110">
              <Icon name={item.icon} strokeWidth={1.9} className="size-5" />
            </span>
            <Heading
              variant="h4"
              as="h3"
              className="text-balance text-left text-[clamp(1.3rem,1.15rem+0.7vw,1.65rem)] leading-[1.1]"
            >
              {item.title}
            </Heading>
          </div>

          <Text variant="p2" className="mt-3.5 max-w-[46ch] text-pretty text-left">
            {item.description}
          </Text>

          <Link
            href="/contact"
            className="mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-[0.9rem] font-semibold text-text-primary underline decoration-purple-300 decoration-2 underline-offset-[5px] transition-colors hover:text-purple-700 hover:decoration-purple-600"
            aria-label={`Ask about ${item.title}`}
          >
            Ask about this
            <ArrowUpRight
              aria-hidden
              className="size-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={2.4}
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Big outline shapes drifting in the page margins either side of the grid. */
const BACKDROP: {
  shape: (typeof SHAPES)[number];
  className: string;
  from: string;
  to: string;
  seconds: number;
}[] = [
  { shape: "triangle", className: "-left-32 top-[4%] size-28", from: "-14deg", to: "4deg", seconds: 11 },
  { shape: "circle", className: "-right-28 top-[24%] size-24", from: "0deg", to: "0deg", seconds: 9 },
  { shape: "cross", className: "-left-28 top-[70%] size-20", from: "8deg", to: "30deg", seconds: 13 },
  { shape: "square", className: "-right-32 top-[66%] size-24", from: "10deg", to: "-12deg", seconds: 12 },
];

interface ToolkitProps {
  content?: ServicesSectionConfig;
  className?: string;
}

export function Toolkit({ content = servicesSection, className }: ToolkitProps) {
  return (
    <section className={cn("page-section-frame relative", "max-md:!p-0", className)}>
      <Hero content={content.hero} className="min-h-0 py-0 sm:py-0" childrenClassName="mt-12">
        <div className="relative">
          <div aria-hidden className="pointer-events-none absolute inset-0 max-xl:hidden">
            {BACKDROP.map((item) => (
              <ShapeGlyph
                key={item.shape}
                shape={item.shape}
                className={cn("art-loop absolute [&_*]:[stroke-width:1.5]", item.className)}
                style={
                  {
                    color: SHAPE_INK[item.shape],
                    "--drift-from": item.from,
                    "--drift-to": item.to,
                    animation: `drift ${item.seconds}s ease-in-out infinite`,
                  } as CSSProperties
                }
              />
            ))}
          </div>

          <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-12">
            {content.services.map((item, index) => (
              <ServiceCard key={item.id} item={item} index={index} />
            ))}
          </div>

          <ServiceStickers />
        </div>
      </Hero>
    </section>
  );
}
