"use client";

import { motion, useReducedMotion } from "motion/react";
import { Sticker, type StickerKind } from "@/components/illustrations/stickers";
import { cn } from "@/lib/utils";

interface LooseSticker {
  kind: StickerKind;
  /** Position classes: each sticker straddles a corner or a gutter of the grid. */
  className: string;
  rotate: number;
  seconds: number;
}

const STICKERS: LooseSticker[] = [
  { kind: "pen", className: "-left-8 -top-9 w-16", rotate: -12, seconds: 5.4 },
  { kind: "layers", className: "left-[55%] top-[31%] w-14", rotate: 7, seconds: 6.6 },
  { kind: "palette", className: "-right-9 top-[20%] w-[4.5rem]", rotate: 10, seconds: 6.2 },
  { kind: "play", className: "-left-8 top-[58%] w-14", rotate: 8, seconds: 4.8 },
  { kind: "bolt", className: "-bottom-8 right-[9%] w-14", rotate: -9, seconds: 5.8 },
];

/**
 * Loose stickers around the services grid. Pick one up, throw it, and it
 * springs back to where it lives. Desktop only: on a phone they would sit on
 * top of the copy.
 */
export function ServiceStickers() {
  const reduce = Boolean(useReducedMotion());

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 max-lg:hidden">
      {STICKERS.map((sticker) => (
        <motion.div
          key={sticker.kind}
          drag
          dragSnapToOrigin
          dragElastic={0.5}
          dragTransition={{ bounceStiffness: 260, bounceDamping: 16 }}
          whileHover={{ scale: 1.12 }}
          whileDrag={{ scale: 1.22, rotate: sticker.rotate + 14, cursor: "grabbing" }}
          initial={false}
          animate={{ rotate: sticker.rotate }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className={cn(
            "pointer-events-auto absolute cursor-grab touch-none select-none",
            sticker.className,
          )}
        >
          <div
            style={
              reduce
                ? undefined
                : {
                    animation: `sticker-bob ${sticker.seconds}s ease-in-out infinite`,
                    animationDelay: `${-sticker.seconds * 0.4}s`,
                  }
            }
          >
            <Sticker kind={sticker.kind} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
