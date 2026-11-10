import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Sticker set.
 *
 * Every sticker is a die-cut tile: white border, hard little shadow, flat
 * artwork inside. The four shape buttons are the generic gamepad set
 * (triangle, circle, cross, square) drawn from scratch; the rest are the
 * tools of the trade. Colours come from the `--sticker-*` inks, which are
 * reserved for illustration and never used for UI.
 */

export type StickerKind =
  | "triangle"
  | "circle"
  | "cross"
  | "square"
  | "pen"
  | "layers"
  | "trophy"
  | "gg"
  | "palette"
  | "bolt"
  | "dpad"
  | "play";

const INK = "#15121c";

const stickerSurface: Record<StickerKind, { background: string; round?: boolean }> = {
  triangle: { background: INK, round: true },
  circle: { background: INK, round: true },
  cross: { background: INK, round: true },
  square: { background: INK, round: true },
  pen: { background: "#ffffff" },
  layers: { background: "var(--sticker-cobalt)" },
  trophy: { background: "var(--sticker-sun)" },
  gg: { background: "var(--sticker-mint)" },
  palette: { background: "var(--sticker-pink)" },
  bolt: { background: "var(--color-purple-500)" },
  dpad: { background: "#ffffff" },
  play: { background: "var(--sticker-red)", round: true },
};

function StickerArt({ kind }: { kind: StickerKind }) {
  const shape = {
    fill: "none",
    strokeWidth: 9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;

  switch (kind) {
    case "triangle":
      return <path d="M50 26 76 70H24Z" stroke="var(--sticker-mint)" {...shape} />;
    case "circle":
      return <circle cx="50" cy="50" r="24" stroke="var(--sticker-red)" {...shape} />;
    case "cross":
      return <path d="M30 30l40 40M70 30 30 70" stroke="var(--sticker-cobalt)" {...shape} />;
    case "square":
      return (
        <rect x="28" y="28" width="44" height="44" rx="6" stroke="var(--sticker-pink)" {...shape} />
      );
    case "pen":
      return (
        <>
          <path
            d="M22 74c10-4 16-14 16-26M78 74c-10-4-16-14-16-26"
            fill="none"
            stroke="#c9b8ea"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 7"
          />
          <path d="M50 16 68 50 56 74H44L32 50Z" fill="var(--color-purple-500)" />
          <path d="M50 16v32" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="52" r="6" fill="#ffffff" />
          <rect x="40" y="76" width="20" height="9" rx="3" fill={INK} />
          <rect x="16" y="68" width="12" height="12" rx="3" fill={INK} />
          <rect x="72" y="68" width="12" height="12" rx="3" fill={INK} />
        </>
      );
    case "layers":
      return (
        <>
          <path d="M50 58 20 72 50 86 80 72Z" fill="#ffffff" opacity="0.45" />
          <path d="M50 40 20 54 50 68 80 54Z" fill="#ffffff" opacity="0.72" />
          <path d="M50 20 20 36 50 52 80 36Z" fill="#ffffff" />
        </>
      );
    case "trophy":
      return (
        <>
          <path
            d="M30 28H18c0 18 6 26 16 28M70 28h12c0 18-6 26-16 28"
            fill="none"
            stroke={INK}
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M30 20h40v20c0 16-8 26-20 26S30 56 30 40Z" fill={INK} />
          <rect x="45" y="64" width="10" height="12" fill={INK} />
          <rect x="33" y="76" width="34" height="9" rx="3" fill={INK} />
          <path d="M40 30v10c0 6 2 10 5 13" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.65" />
        </>
      );
    case "gg":
      return (
        <text
          x="50"
          y="66"
          textAnchor="middle"
          fontSize="44"
          fontWeight="700"
          letterSpacing="-3"
          fill={INK}
          style={{ fontFamily: "var(--font-sans-stack)" }}
        >
          GG
        </text>
      );
    case "palette":
      return (
        <>
          <rect x="40" y="16" width="20" height="62" rx="5" fill="#ffffff" transform="rotate(-28 50 78)" />
          <rect x="40" y="16" width="20" height="62" rx="5" fill="var(--sticker-sun)" />
          <rect x="40" y="16" width="20" height="62" rx="5" fill={INK} transform="rotate(28 50 78)" />
          <circle cx="50" cy="72" r="4.5" fill="#ffffff" />
        </>
      );
    case "bolt":
      return <path d="M56 12 24 56h20l-6 32 34-46H52Z" fill="#ffffff" />;
    case "dpad":
      return (
        <>
          <rect x="16" y="38" width="68" height="24" rx="7" fill={INK} />
          <rect x="38" y="16" width="24" height="68" rx="7" fill={INK} />
          <circle cx="50" cy="50" r="6" fill="#4a4259" />
        </>
      );
    case "play":
      return <path d="M40 30 72 50 40 70Z" fill="#ffffff" stroke="#ffffff" strokeWidth="6" strokeLinejoin="round" />;
  }
}

interface StickerProps {
  kind: StickerKind;
  className?: string;
  style?: CSSProperties;
}

export function Sticker({ kind, className, style }: StickerProps) {
  const surface = stickerSurface[kind];

  return (
    <span
      aria-hidden
      className={cn(
        "sticker block aspect-square overflow-hidden",
        surface.round && "!rounded-full",
        className,
      )}
      style={{ background: surface.background, ...style }}
    >
      <svg viewBox="0 0 100 100" className="block h-full w-full">
        <StickerArt kind={kind} />
      </svg>
    </span>
  );
}

/* --------------------------------------------------------------------------
   Stat stamp: a scalloped seal carrying a number and a caption.
   -------------------------------------------------------------------------- */

const SEAL_PATH = (() => {
  const points = 16;
  const outer = 49;
  const inner = 43;
  let path = "";

  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (Math.PI * index) / points;
    const x = (50 + radius * Math.cos(angle)).toFixed(2);
    const y = (50 + radius * Math.sin(angle)).toFixed(2);
    path += `${index === 0 ? "M" : "L"}${x} ${y}`;
  }

  return `${path}Z`;
})();

interface StatStampProps {
  value: string;
  caption?: string;
  tone?: "sun" | "white" | "purple";
  className?: string;
}

const stampTones = {
  sun: { fill: "var(--sticker-sun)", text: INK },
  white: { fill: "#ffffff", text: INK },
  purple: { fill: "var(--color-purple-600)", text: "#ffffff" },
} as const;

export function StatStamp({ value, caption, tone = "sun", className }: StatStampProps) {
  const palette = stampTones[tone];

  return (
    <span className={cn("relative block aspect-square [container-type:inline-size]", className)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d={SEAL_PATH} fill="rgba(44,30,72,0.28)" transform="translate(0 3.5)" />
        <path d={SEAL_PATH} fill="#ffffff" />
        <path d={SEAL_PATH} fill={palette.fill} transform="translate(50 50) scale(0.9) translate(-50 -50)" />
        <circle
          cx="50"
          cy="50"
          r="33"
          fill="none"
          stroke={palette.text}
          strokeOpacity="0.28"
          strokeWidth="0.9"
          strokeDasharray="1.5 3"
        />
      </svg>
      <span
        className="absolute inset-0 flex flex-col items-center justify-center px-[14%] text-center"
        style={{ color: palette.text }}
      >
        <span className="text-[25cqw] font-bold leading-none tracking-[-0.05em]">{value}</span>
        {caption ? (
          <span className="mt-[4cqw] text-[8.6cqw] font-semibold uppercase leading-[1.1] tracking-[0.06em]">
            {caption}
          </span>
        ) : null}
      </span>
    </span>
  );
}

/* --------------------------------------------------------------------------
   Collaborator cursor with a name tag.
   -------------------------------------------------------------------------- */

export function CursorTag({ label, className }: { label: string; className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-block", className)}>
      <svg viewBox="0 0 24 24" className="block size-[1.5em]">
        <path
          d="M4 3l15 7-6.4 2.2L10 19Z"
          fill="var(--color-purple-600)"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute left-[1.2em] top-[1.25em] whitespace-nowrap rounded-[0.5em] rounded-tl-none bg-purple-600 px-[0.6em] py-[0.32em] text-[0.72em] font-semibold leading-none text-white shadow-[0_0_0_2px_#fff,0_6px_12px_-4px_rgba(var(--shade-rgb),0.5)]">
        {label}
      </span>
    </span>
  );
}

/* --------------------------------------------------------------------------
   Small drawn marks: sparkle, squiggle, hand arrow, burst.
   -------------------------------------------------------------------------- */

export function Sparkle({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} style={style}>
      <path
        d="M12 1c.9 6 3.2 9.2 10 11-6.8 1.8-9.1 5-10 11-.9-6-3.2-9.2-10-11C8.800 10.200 11.1 7 12 1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HandArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 60" aria-hidden className={className} fill="none">
      <path
        d="M6 10c22-8 50 2 60 34"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M52 38l14 8 4-16"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const BURST_PATH = (() => {
  const points = 14;
  let path = "";

  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? 50 : 27;
    const angle = (Math.PI * index) / points - Math.PI / 2;
    const x = (50 + radius * Math.cos(angle)).toFixed(2);
    const y = (50 + radius * Math.sin(angle)).toFixed(2);
    path += `${index === 0 ? "M" : "L"}${x} ${y}`;
  }

  return `${path}Z`;
})();

export function Burst({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className} style={style}>
      <path d={BURST_PATH} fill="currentColor" />
    </svg>
  );
}

/** One of the four gamepad shapes as a bare outline, for scattered accents. */
export function ShapeGlyph({
  shape,
  className,
  style,
}: {
  shape: "triangle" | "circle" | "cross" | "square";
  className?: string;
  style?: CSSProperties;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  let art: ReactNode;

  switch (shape) {
    case "triangle":
      art = <path d="M12 4.5 20.5 19h-17Z" {...common} />;
      break;
    case "circle":
      art = <circle cx="12" cy="12" r="8" {...common} />;
      break;
    case "cross":
      art = <path d="M5 5l14 14M19 5 5 19" {...common} />;
      break;
    case "square":
      art = <rect x="4.5" y="4.5" width="15" height="15" rx="2" {...common} />;
      break;
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} style={style}>
      {art}
    </svg>
  );
}
