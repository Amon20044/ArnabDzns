import type { IconType } from "react-icons";
import {
  SiFigma,
  SiFramer,
  SiGsap,
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
} from "react-icons/si";
import { Heading, Text } from "@/components/ui/typography";
import { toolkitSection } from "@/data/toolkit";
import { cn } from "@/lib/utils";
import type { ToolkitIconId, ToolkitItem } from "@/types";

interface ToolkitIconDefinition {
  Icon: IconType;
  iconClassName: string;
  surfaceClassName: string;
}

const toolkitIconRegistry: Record<ToolkitIconId, ToolkitIconDefinition> = {
  figma: {
    Icon: SiFigma,
    iconClassName: "text-[#f24e1e]",
    surfaceClassName: "bg-white/92 ring-1 ring-black/[0.06]",
  },
  framer: {
    Icon: SiFramer,
    iconClassName: "text-[#4f7cff]",
    surfaceClassName: "bg-white/92 ring-1 ring-black/[0.06]",
  },
  nextjs: {
    Icon: SiNextdotjs,
    iconClassName: "text-white",
    surfaceClassName: "bg-black ring-1 ring-white/8",
  },
  react: {
    Icon: SiReact,
    iconClassName: "text-[#61dafb]",
    surfaceClassName: "bg-[#0f172a] ring-1 ring-cyan-200/12",
  },
  tailwindcss: {
    Icon: SiTailwindcss,
    iconClassName: "text-[#38bdf8]",
    surfaceClassName: "bg-[#082f49] ring-1 ring-sky-200/12",
  },
  gsap: {
    Icon: SiGsap,
    iconClassName: "text-[#88ce02]",
    surfaceClassName: "bg-[#10170a] ring-1 ring-lime-200/12",
  },
};

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, value));
}

function ToolkitRow({ item }: { item: ToolkitItem }) {
  const { Icon, iconClassName, surfaceClassName } = toolkitIconRegistry[item.icon];
  const percentage = clampPercentage(item.percentage);
  const progressWidth = `min(100%, clamp(17.5rem, ${percentage}%, calc(100% - 0.75rem)))`;

  return (
    <article
      className="rounded-[1.75rem] border border-border bg-white/88 p-2 shadow-[0_18px_48px_rgba(24,24,27,0.08)] backdrop-blur-sm"
      role="listitem"
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <div
            className="min-w-0 overflow-hidden rounded-[1.3rem] bg-[linear-gradient(135deg,#09090b_0%,#18181b_58%,#2a1242_100%)] px-4 py-4 text-white md:px-5"
            style={{ width: progressWidth }}
          >
            <div className="flex items-start gap-3 md:items-center">
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-[1rem]",
                  surfaceClassName,
                )}
              >
                <Icon className={cn("size-6", iconClassName)} />
              </div>

              <div className="min-w-0">
                <Heading variant="h4" as="h3" className="text-white">
                  {item.title}
                </Heading>
                <Text
                  variant="p2"
                  className="mt-1 max-w-2xl text-white/[0.68] md:text-[15px]"
                >
                  {item.description}
                </Text>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end px-1 md:px-3">
          <div
            aria-label={`${percentage}% proficiency in ${item.title}`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={percentage}
            className="inline-flex min-w-[4.5rem] items-center justify-center rounded-full bg-black/[0.08] px-4 py-2 text-sm font-semibold tracking-tight text-text-primary"
            role="progressbar"
          >
            {percentage}%
          </div>
        </div>
      </div>
    </article>
  );
}

export function Toolkit() {
  const { eyebrow, title, description, items } = toolkitSection;

  return (
    <section className="page-surface page-reveal overflow-hidden p-8 md:p-10 lg:p-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.14),transparent_42%)]" />

      <div className="page-stack relative z-10">
        <div className="flex flex-col items-center text-center">
          <span className="eyebrow-chip">{eyebrow}</span>
          <Heading variant="h2" className="mt-5 max-w-3xl">
            {title}
          </Heading>
          <Text variant="p1" className="mt-4 max-w-2xl text-balance">
            {description}
          </Text>
        </div>

        <div className="mt-10 flex flex-col gap-4" role="list" aria-label="Toolkit skills">
          {items.map((item) => (
            <ToolkitRow key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
