"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import {
  Brush,
  Code2,
  Image,
  LayoutPanelTop,
  MessageSquare,
  MonitorPlay,
  PenTool,
  Play,
  RadioTower,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  SiFigma,
  SiFramer,
  SiGsap,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import { Hero } from "@/components/sections/hero";
import { Heading, Text } from "@/components/ui/typography";
import { toolkitSection } from "@/data/toolkit";
import { createMetallicSurface } from "@/lib/metallic-surface";
import { cn } from "@/lib/utils";
import type {
  ToolkitCategory,
  ToolkitCategoryIconId,
  ToolkitCategoryId,
  ToolkitIconId,
  ToolkitItem,
  ToolkitSectionConfig,
} from "@/types";

interface ToolkitIconDefinition {
  Icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  surfaceClassName: string;
}

const ease = [0.22, 1, 0.36, 1] as const;
const rowViewport = { amount: 0.35, once: false } as const;

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
  typescript: {
    Icon: SiTypescript,
    iconClassName: "text-[#3178c6]",
    surfaceClassName: "bg-[#eff6ff] ring-1 ring-blue-200/40",
  },
  nodejs: {
    Icon: SiNodedotjs,
    iconClassName: "text-[#83cd29]",
    surfaceClassName: "bg-[#10170a] ring-1 ring-lime-200/12",
  },
  vercel: {
    Icon: SiVercel,
    iconClassName: "text-white",
    surfaceClassName: "bg-black ring-1 ring-white/8",
  },
  photoshop: {
    Icon: Image,
    iconClassName: "text-[#31a8ff]",
    surfaceClassName: "bg-[#001833] ring-1 ring-sky-300/12",
  },
  illustrator: {
    Icon: PenTool,
    iconClassName: "text-[#ff9a00]",
    surfaceClassName: "bg-[#2d1200] ring-1 ring-orange-300/12",
  },
  obsstudio: {
    Icon: RadioTower,
    iconClassName: "text-white",
    surfaceClassName: "bg-[#111111] ring-1 ring-white/8",
  },
  youtube: {
    Icon: Play,
    iconClassName: "text-[#ff0033]",
    surfaceClassName: "bg-white/92 ring-1 ring-black/[0.06]",
  },
  discord: {
    Icon: MessageSquare,
    iconClassName: "text-[#5865f2]",
    surfaceClassName: "bg-[#eef2ff] ring-1 ring-indigo-200/40",
  },
};

const toolkitCategoryIconRegistry: Record<string, LucideIcon> = {
  code: Code2,
  layout: LayoutPanelTop,
  sparkles: Sparkles,
  palette: Brush,
  broadcast: MonitorPlay,
};

const switcherMetallicTheme = createMetallicSurface({ tone: "#a855f7" });

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, value));
}

function resolveCategoryIcon(id?: ToolkitCategoryIconId): LucideIcon | null {
  if (!id || id === "none") {
    return null;
  }

  return toolkitCategoryIconRegistry[id] ?? null;
}

function AnimatedPercentage({
  value,
  isActive,
}: {
  value: number;
  isActive: boolean;
}) {
  const counter = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useMotionValueEvent(counter, "change", (latest) => {
    setDisplayValue(Math.round(latest));
  });

  useEffect(() => {
    const controls = animate(counter, isActive ? value : 0, {
      duration: 0.85,
      ease: "easeOut",
    });

    return () => {
      controls.stop();
    };
  }, [counter, isActive, value]);

  return <>{displayValue}%</>;
}

function ToolkitCategorySwitcher({
  categories,
  activeId,
  onChange,
}: {
  categories: ToolkitCategory[];
  activeId: ToolkitCategoryId;
  onChange: (id: ToolkitCategoryId) => void;
}) {
  if (categories.length <= 1) {
    return null;
  }

  return (
    <div
      role="tablist"
      aria-label="Skills and services categories"
      className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-border-accent bg-white/80 p-1 shadow-[0_10px_30px_rgba(88,28,135,0.08)] backdrop-blur-md"
    >
      {categories.map((category) => {
        const isActive = category.id === activeId;
        const Icon = resolveCategoryIcon(category.icon);

        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`toolkit-panel-${category.id}`}
            id={`toolkit-tab-${category.id}`}
            onClick={() => onChange(category.id)}
            className={cn(
              "group relative overflow-hidden rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-200 sm:px-5 sm:text-[0.78rem]",
              isActive
                ? "text-white"
                : "text-text-secondary hover:text-text-primary",
            )}
            style={isActive ? { color: switcherMetallicTheme.textColor } : undefined}
          >
            {isActive ? (
              <motion.span
                layoutId="toolkit-tab-pill"
                className="pointer-events-none absolute inset-0 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={switcherMetallicTheme.surfaceStyle}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-px rounded-full opacity-80"
                  style={switcherMetallicTheme.glowStyle}
                />
              </motion.span>
            ) : null}

            <span className="relative z-10 flex items-center gap-2">
              {Icon ? <Icon className="size-3.5" strokeWidth={2.1} aria-hidden /> : null}
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden">{category.shortLabel ?? category.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ToolkitRow({ item }: { item: ToolkitItem }) {
  const rowRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(rowRef, rowViewport);
  const { Icon, iconClassName, surfaceClassName } = toolkitIconRegistry[item.icon];
  const percentage = clampPercentage(item.percentage);
  const progressWidth = `min(100%, clamp(17.5rem, ${percentage}%, calc(100% - 0.75rem)))`;

  return (
    <motion.article
      ref={rowRef}
      initial="hidden"
      whileInView="visible"
      viewport={rowViewport}
      variants={{
        hidden: { opacity: 0, y: 26, filter: "blur(10px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.58, ease },
        },
      }}
      className="rounded-[1.75rem] border border-border bg-white/88 p-2 shadow-[0_18px_48px_rgba(24,24,27,0.08)] backdrop-blur-sm"
      role="listitem"
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <motion.div
            variants={{
              hidden: { opacity: 0.72, y: 18, scaleX: 0.24 },
              visible: {
                opacity: 1,
                y: 0,
                scaleX: 1,
                transition: { duration: 0.72, ease, delay: 0.08 },
              },
            }}
            className="min-w-0 overflow-hidden rounded-[1.3rem] bg-[linear-gradient(135deg,#09090b_0%,#18181b_58%,#2a1242_100%)] px-4 py-4 text-white md:px-5"
            style={{ width: progressWidth, transformOrigin: "left center" }}
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
          </motion.div>
        </div>

        <motion.div
          variants={{
            hidden: { opacity: 0, x: 16 },
            visible: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.42, ease, delay: 0.18 },
            },
          }}
          className="flex items-center justify-end px-1 md:px-3"
        >
          <div
            aria-label={`${percentage}% proficiency in ${item.title}`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={percentage}
            className="inline-flex min-w-[4.5rem] items-center justify-center rounded-full bg-black/[0.08] px-4 py-2 text-sm font-semibold tracking-tight text-text-primary"
            role="progressbar"
          >
            <AnimatedPercentage value={percentage} isActive={isInView} />
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
}

interface ToolkitProps {
  content?: ToolkitSectionConfig;
  className?: string;
}

export function Toolkit({ content = toolkitSection, className }: ToolkitProps) {
  const categories = content.categories;

  const initialCategoryId = useMemo(() => {
    if (
      content.defaultCategoryId &&
      categories.some((category) => category.id === content.defaultCategoryId)
    ) {
      return content.defaultCategoryId;
    }

    return categories[0]?.id ?? "";
  }, [categories, content.defaultCategoryId]);

  const [activeCategoryId, setActiveCategoryId] = useState<ToolkitCategoryId>(initialCategoryId);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? categories[0],
    [activeCategoryId, categories],
  );

  if (!activeCategory) {
    return null;
  }

  const handleCategoryChange = (id: ToolkitCategoryId) => {
    if (id === activeCategoryId) {
      return;
    }

    startTransition(() => {
      setActiveCategoryId(id);
    });
  };

  return (
    <section
      className={cn(
        "page-surface page-reveal relative overflow-hidden p-8 md:p-10 lg:p-12",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.14),transparent_42%)]" />

      <Hero
        content={content.hero}
        className="min-h-0 py-0 sm:py-0"
        childrenClassName="mt-10"
      >
        <div className="flex flex-col items-center gap-8">
          <ToolkitCategorySwitcher
            categories={categories}
            activeId={activeCategory.id}
            onChange={handleCategoryChange}
          />

          {activeCategory.description ? (
            <Text variant="p2" className="max-w-2xl text-center text-text-secondary">
              {activeCategory.description}
            </Text>
          ) : null}

          <div
            id={`toolkit-panel-${activeCategory.id}`}
            role="tabpanel"
            aria-labelledby={`toolkit-tab-${activeCategory.id}`}
            className="w-full"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeCategory.id}
                initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(10px)" }}
                transition={{ duration: 0.35, ease }}
                className="flex flex-col gap-4"
                role="list"
                aria-label={`${activeCategory.label} skills`}
              >
                {activeCategory.items.map((item) => (
                  <ToolkitRow key={item.id} item={item} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Hero>
    </section>
  );
}
