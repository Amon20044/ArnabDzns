import { ShapeGlyph } from "@/components/illustrations/stickers";
import { Hero } from "@/components/sections/hero";
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

/**
 * Rows alternate narrow + wide, then wide + narrow, so the grid zig-zags
 * instead of sitting in three equal columns.
 */
const isWide = (index: number) => index % 4 === 1 || index % 4 === 2;

function ServiceCard({ item, index }: { item: ServiceCardItem; index: number }) {
  const wide = isWide(index);
  const shape = SHAPES[index % SHAPES.length];

  return (
    <article
      className={cn(
        "tray page-reveal group transition-transform duration-300 ease-out hover:-translate-y-1",
        wide ? "lg:col-span-3" : "lg:col-span-2",
      )}
    >
      <div
        className={cn(
          "tray-card relative flex h-full flex-col overflow-hidden p-6 text-left sm:p-7",
          wide && "lg:pr-40",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="flex size-14 -rotate-6 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-[0_3px_0_var(--color-purple-200)] transition-transform duration-300 ease-out group-hover:rotate-6 group-hover:scale-110">
            <Icon name={item.icon} strokeWidth={1.8} className="size-7" />
          </span>
          <span className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-secondary tabular-nums">
            <ShapeGlyph shape={shape} className="size-3.5" style={{ color: SHAPE_INK[shape] }} />
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <Heading
          variant="h4"
          as="h3"
          className="mt-10 text-balance text-left text-[clamp(1.4rem,1.2rem+0.8vw,1.75rem)] leading-[1.12]"
        >
          {item.title}
        </Heading>
        <Text variant="p2" className="mt-2.5 max-w-[42ch] text-pretty text-left">
          {item.description}
        </Text>

        {wide ? (
          <Icon
            name={item.icon}
            strokeWidth={1.2}
            className="pointer-events-none absolute -bottom-6 -right-4 hidden size-44 -rotate-12 text-purple-200/70 transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-105 lg:block"
          />
        ) : null}
      </div>
    </article>
  );
}

interface ToolkitProps {
  content?: ServicesSectionConfig;
  className?: string;
}

export function Toolkit({ content = servicesSection, className }: ToolkitProps) {
  return (
    <section className={cn("page-section-frame relative", "max-md:!p-0", className)}>
      <Hero content={content.hero} className="min-h-0 py-0 sm:py-0" childrenClassName="mt-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {content.services.map((item, index) => (
            <ServiceCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </Hero>
    </section>
  );
}
