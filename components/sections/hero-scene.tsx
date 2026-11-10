"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Shuffle } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { ArnabCharacter } from "@/components/illustrations/arnab-character";
import {
  Burst,
  CursorTag,
  HandArrow,
  ShapeGlyph,
  Sparkle,
  StatStamp,
  Sticker,
} from "@/components/illustrations/stickers";
import Image from "@/components/ui/site-image";
import { cn } from "@/lib/utils";

export interface HeroSceneStat {
  id: string;
  value: string;
  caption?: string;
}

export interface HeroSceneWork {
  id: string;
  src: string;
  alt: string;
}

interface HeroSceneProps {
  stats?: HeroSceneStat[];
  work?: HeroSceneWork[];
  name?: string;
  className?: string;
}

/** A place a sticker can sit, as a percentage of the scene box. */
interface Slot {
  x: number;
  y: number;
  rotate: number;
}

/**
 * Slots ring the character so nothing lands on the face. There are more slots
 * than stickers, which is what gives Shuffle somewhere new to send them.
 */
const SLOTS: Slot[] = [
  { x: -10, y: 7, rotate: -9 },
  { x: 80, y: 2, rotate: 9 },
  { x: -8, y: 38, rotate: 7 },
  { x: 88, y: 30, rotate: -8 },
  { x: -7, y: 62, rotate: -11 },
  { x: 86, y: 54, rotate: 9 },
  { x: -5, y: 84, rotate: 8 },
  { x: 82, y: 79, rotate: -7 },
  { x: 16, y: -7, rotate: 6 },
  { x: 60, y: -8, rotate: -6 },
];

interface SceneItem {
  id: string;
  /** Width as a percentage of the scene. */
  width: number;
  node: ReactNode;
  /** Hide on small screens to keep the scene readable. */
  desktopOnly?: boolean;
  bobSeconds: number;
}

const spring = { type: "spring", stiffness: 260, damping: 22, mass: 0.7 } as const;

function shuffleOrder(length: number, previous: number[]) {
  const pool = SLOTS.map((_, index) => index);
  let next = previous;

  // Fisher-Yates, retried until the layout really differs from the last one.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const copy = [...pool];

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }

    next = copy.slice(0, length);

    if (next.some((slot, index) => slot !== previous[index])) {
      break;
    }
  }

  return next;
}

function DraggableSticker({
  item,
  slot,
  constraints,
  order,
  onGrab,
  reduce,
}: {
  item: SceneItem;
  slot: Slot;
  constraints: RefObject<HTMLDivElement | null>;
  order: number;
  onGrab: () => void;
  reduce: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // A new slot means "go home": drop any drag offset so the layout animation
  // carries the sticker to its new place instead of stacking both moves.
  useEffect(() => {
    const controls = [animate(x, 0, spring), animate(y, 0, spring)];

    return () => controls.forEach((control) => control.stop());
  }, [slot, x, y]);

  return (
    <motion.div
      layout
      drag
      dragConstraints={constraints}
      dragElastic={0.22}
      dragMomentum={false}
      onDragStart={onGrab}
      onPointerDown={onGrab}
      whileHover={{ scale: 1.08 }}
      whileDrag={{ scale: 1.16, rotate: slot.rotate + 8, cursor: "grabbing" }}
      initial={false}
      animate={{ rotate: slot.rotate }}
      transition={{ layout: spring, rotate: spring, scale: spring }}
      className={cn(
        "absolute cursor-grab touch-none select-none",
        item.desktopOnly && "max-sm:hidden",
      )}
      style={{
        x,
        y,
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        width: `${item.width}%`,
        zIndex: 20 + order,
      }}
    >
      <div
        style={
          reduce
            ? undefined
            : {
                animation: `sticker-bob ${item.bobSeconds}s ease-in-out infinite`,
                animationDelay: `${-item.bobSeconds * 0.37}s`,
              }
        }
      >
        {item.node}
      </div>
    </motion.div>
  );
}

export function HeroScene({ stats = [], work = [], name = "Arnab", className }: HeroSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const reduce = Boolean(useReducedMotion());

  const items: SceneItem[] = [
    ...work.slice(0, 2).map<SceneItem>((piece, index) => ({
      id: `work-${piece.id}`,
      width: index === 0 ? 30 : 27,
      bobSeconds: 6.4 + index,
      desktopOnly: index === 1,
      node: (
        <div className="tray tray-tight">
          <div className="tray-card relative aspect-video overflow-hidden">
            <Image
              src={piece.src}
              alt={piece.alt}
              fill
              sizes="(min-width: 1024px) 190px, 130px"
              draggable={false}
              className="pointer-events-none object-cover"
            />
          </div>
        </div>
      ),
    })),
    { id: "pen", width: 15, bobSeconds: 5.2, node: <Sticker kind="pen" /> },
    { id: "gg", width: 16, bobSeconds: 4.6, node: <Sticker kind="gg" /> },
    { id: "layers", width: 14, bobSeconds: 5.8, desktopOnly: true, node: <Sticker kind="layers" /> },
    { id: "trophy", width: 14, bobSeconds: 6.1, node: <Sticker kind="trophy" /> },
    { id: "bolt", width: 12, bobSeconds: 4.9, desktopOnly: true, node: <Sticker kind="bolt" /> },
    ...stats.slice(0, 2).map<SceneItem>((stat, index) => ({
      id: `stat-${stat.id}`,
      width: 23,
      bobSeconds: 5.5 + index * 0.8,
      desktopOnly: index === 1,
      node: (
        <StatStamp
          value={stat.value}
          caption={stat.caption}
          tone={index === 0 ? "sun" : "white"}
        />
      ),
    })),
  ];

  const [order, setOrder] = useState<number[]>(() => items.map((_, index) => index));
  const [stack, setStack] = useState<string[]>([]);

  const bringToFront = (id: string) =>
    setStack((current) => [...current.filter((entry) => entry !== id), id]);

  return (
    <div
      ref={sceneRef}
      className={cn("relative mx-auto aspect-[10/11] w-full max-w-[34rem]", className)}
    >
      {/* Arch: the one block of saturated colour on the page. */}
      <div className="absolute inset-x-[9%] bottom-0 top-[5%] overflow-hidden rounded-b-[2.25rem] rounded-t-[999px] bg-[radial-gradient(120%_80%_at_50%_18%,#c084fc_0%,#a855f7_30%,#7e22ce_68%,#581c87_100%)] shadow-[inset_0_2px_0_rgba(255,255,255,0.35),0_0_0_1px_rgba(var(--shade-rgb),0.2),0_30px_50px_-28px_rgba(88,28,135,0.75)]">
        <Burst
          className="absolute left-1/2 top-[3%] w-[118%] -translate-x-1/2 text-[#d8b4fe] opacity-40"
          style={reduce ? undefined : { animation: "slow-spin 70s linear infinite" }}
        />
        <div
          className="absolute inset-x-[-5%] bottom-[-1%]"
          style={reduce ? undefined : { animation: "sticker-bob 6s ease-in-out infinite" }}
        >
          <ArnabCharacter />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[url('/textures/grain.png')] opacity-60 mix-blend-soft-light max-md:hidden"
        />
      </div>

      {/* Accents */}
      <Sparkle
        className="pointer-events-none absolute left-[13%] top-[20%] w-[6%] text-white"
        style={reduce ? undefined : { animation: "wiggle 3.2s ease-in-out infinite" }}
      />
      <Sparkle
        className="pointer-events-none absolute right-[16%] top-[44%] w-[4%] text-[#f3e8ff]"
        style={reduce ? undefined : { animation: "wiggle 2.6s ease-in-out infinite reverse" }}
      />
      <ShapeGlyph shape="cross" className="pointer-events-none absolute -left-[4%] top-[24%] w-[5%] text-[rgba(var(--ink-rgb),0.22)]" />
      <ShapeGlyph shape="triangle" className="pointer-events-none absolute -right-[3%] top-[48%] w-[5%] rotate-12 text-[rgba(var(--ink-rgb),0.22)]" />

      {/* Stickers you can throw around */}
      {items.map((item, index) => (
        <DraggableSticker
          key={item.id}
          item={item}
          slot={SLOTS[order[index] ?? index]}
          constraints={sceneRef}
          order={stack.indexOf(item.id) + 1}
          onGrab={() => bringToFront(item.id)}
          reduce={reduce}
        />
      ))}

      {/* Name cursor drifting near the character */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[15%] top-[27%] z-10 text-[clamp(0.8rem,1.6vw,1rem)]"
        animate={reduce ? undefined : { x: [0, 26, 8, -14, 0], y: [0, -18, 14, 4, 0] }}
        transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <CursorTag label={name} />
      </motion.div>

      {/* Hint + shuffle */}
      <div className="pointer-events-none absolute -bottom-[9%] left-[10%] z-30 flex items-start gap-1.5 text-text-primary max-sm:-bottom-[12%] max-sm:left-0">
        <HandArrow className="mt-0.5 w-8 -scale-x-100 -rotate-[100deg] text-accent" />
        <span className="font-hand -rotate-3 text-[1.4rem] leading-none">
          <span className="max-sm:hidden">go on, </span>drag the stickers
        </span>
      </div>
      <button
        type="button"
        onClick={() => setOrder((current) => shuffleOrder(items.length, current))}
        className="press press--white press--compact absolute -bottom-[10%] right-[8%] z-40 max-sm:-bottom-[14%] max-sm:right-0"
        aria-label="Shuffle the stickers"
      >
        <Shuffle aria-hidden className="size-4" strokeWidth={2.4} />
        Shuffle
      </button>
    </div>
  );
}
