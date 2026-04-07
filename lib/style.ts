/**
 * ============================================================================
 *  DESIGN TOKENS — TYPOGRAPHY
 * ----------------------------------------------------------------------------
 *  Three-layer architecture: PRIMITIVES → COMPOSITES → CONSUMERS
 *
 *    1. PRIMITIVES   atomic scales — sizes, weights, leading, tracking, wrap
 *    2. COMPOSITES   ready-to-use text styles — typography.heading.h1, .text.p1
 *    3. CONSUMERS    <Heading /> and <Text /> in components/ui/typography.tsx
 *
 *  Principles
 *  ----------
 *    • Fluid scaling — every size uses CSS `clamp(min, fluid, max)` so the
 *      type ramp interpolates smoothly between mobile (375 px) and desktop
 *      (1280 px). No breakpoint snaps; the rhythm stays graceful at every
 *      viewport in between.
 *
 *    • Optical balance — bigger text gets tighter leading + tighter tracking
 *      (display sizes look weak with airy spacing); smaller text gets looser
 *      leading + slightly looser tracking (it needs the air to stay legible).
 *
 *    • Single source of truth — tweak any primitive and every composite that
 *      references it updates automatically. Never bake raw size strings into
 *      page components — pull them from `typography.*`.
 *
 *  Pairing guide (rule of thumb)
 *  -----------------------------
 *      h1  +  p1     →  hero / landing
 *      h2  +  p2     →  section headers
 *      h3  +  p2     →  subsections
 *      h4  +  p3     →  cards
 *      h5  +  p3     →  list items, side-by-side meta
 *      h6  / eyebrow →  small labels above headings
 * ============================================================================
 */

/* ──────────────────────────────────────────────────────────────────────────
   1 · PRIMITIVES
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Font weights — semantic names map to Tailwind utilities so the rest of the
 * codebase never references raw `font-bold` etc. directly.
 */
export const fontWeight = {
  regular: "font-normal", //  400
  medium: "font-medium", //  500
  semibold: "font-semibold", //  600
  bold: "font-bold", //  700
} as const;

/**
 * Fluid font-size scale.
 *
 * Each entry is `text-[clamp(min, fluid, max)]` where:
 *   • `min`   — the size at viewport ≤ 375 px (mobile)
 *   • `max`   — the size at viewport ≥ 1280 px (desktop)
 *   • `fluid` — a linear function of `vw` that interpolates between them
 *
 * The whole scale follows a Major-Third (1.25) modular ratio at the desktop
 * end, which is the same ratio used by Apple's HIG and Material 3 display
 * scales. The rest of the design system is built on this rhythm.
 */
export const fontSize = {
  /* — Display — */
  "8xl": "text-[clamp(2.75rem,1.40rem+5.75vw,6rem)]", //   44 → 96 px
  "7xl": "text-[clamp(2.25rem,1.41rem+3.55vw,4.5rem)]", // 36 → 72 px
  "6xl": "text-[clamp(1.875rem,1.21rem+2.86vw,3.75rem)]", // 30 → 60 px
  /* — Headings — */
  "5xl": "text-[clamp(2rem,1.38rem+2.65vw,3.5rem)]", //   32 → 56 px
  "4xl": "text-[clamp(1.75rem,1.34rem+1.77vw,2.75rem)]", //  28 → 44 px
  "3xl": "text-[clamp(1.5rem,1.21rem+1.21vw,2.125rem)]", //  24 → 34 px
  "2xl": "text-[clamp(1.25rem,1.07rem+0.78vw,1.5rem)]", //   20 → 24 px
  /* — Body — */
  xl: "text-[clamp(1.125rem,1.06rem+0.27vw,1.25rem)]", //    18 → 20 px
  lg: "text-[clamp(1rem,0.92rem+0.44vw,1.125rem)]", //       16 → 18 px
  md: "text-[clamp(0.9375rem,0.90rem+0.22vw,1rem)]", //      15 → 16 px
  base: "text-[clamp(0.875rem,0.82rem+0.27vw,1rem)]", //     14 → 16 px
  sm: "text-[clamp(0.8125rem,0.78rem+0.16vw,0.875rem)]", //  13 → 14 px
  xs: "text-[clamp(0.75rem,0.72rem+0.16vw,0.8125rem)]", //   12 → 13 px
  "2xs": "text-[clamp(0.6875rem,0.66rem+0.08vw,0.75rem)]", // 11 → 12 px
} as const;

/**
 * Leading (line-height) — inversely proportional to size.
 * Display copy near 1.0; body copy 1.65–1.75.
 *
 * Why: large text already has its own optical "air" between glyphs, so a
 * tight leading keeps it from feeling hollow. Body text needs the breathing
 * room or it becomes a wall.
 */
export const leading = {
  none: "leading-[0.92]",
  display: "leading-[0.95]", //  h1 / hero
  tight: "leading-[1.05]", //    h2 / large display
  snug: "leading-[1.15]", //     h3
  normal: "leading-[1.30]", //   h4
  relaxed: "leading-[1.45]", //  h5
  loose: "leading-[1.55]", //    h6 / small labels
  body: "leading-[1.65]", //     p2 / default body
  prose: "leading-[1.78]", //    p1 / long-form reading
} as const;

/**
 * Tracking (letter-spacing) — inversely proportional to size.
 *
 * The "optical sizing trick": negative tracking on large display text makes
 * it feel solid and confident; positive tracking on small caps and labels
 * keeps them legible at low x-heights.
 */
export const tracking = {
  display: "tracking-[-0.040em]", //  h1
  tight: "tracking-[-0.028em]", //    h2
  snug: "tracking-[-0.018em]", //     h3 / h4
  normal: "tracking-[-0.005em]", //   h5
  body: "tracking-[0em]", //          p1 / p2 / p3
  wide: "tracking-[0.04em]", //       small caps
  eyebrow: "tracking-[0.16em]", //    h6 / eyebrow / labels
} as const;

/** Text-wrap helpers. `balance` is great for headings, `pretty` for body. */
export const wrap = {
  balance: "text-balance",
  pretty: "text-pretty",
} as const;

/* ──────────────────────────────────────────────────────────────────────────
   2 · COMPOSITES — semantic, ready-to-use text styles
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Compose primitives into a single className string at module load.
 * Doing this once (not via runtime `cn()`) keeps the result a plain string,
 * which is friendly to Tailwind IntelliSense and to consumers that want to
 * append their own classes.
 */
const compose = (...classes: string[]): string => classes.join(" ");

export const typography = {
  heading: {
    /** Display — hero headlines (44 → 96 px fluid) */
    h1: compose(
      fontSize["8xl"],
      leading.display,
      tracking.display,
      fontWeight.bold,
      wrap.balance,
    ),
    /** Page / section headers (30 → 60 px fluid) */
    h2: compose(
      fontSize["6xl"],
      leading.tight,
      tracking.tight,
      fontWeight.bold,
      wrap.balance,
    ),
    /** Subsections (28 → 44 px fluid) */
    h3: compose(
      fontSize["4xl"],
      leading.snug,
      tracking.snug,
      fontWeight.semibold,
      wrap.balance,
    ),
    /** Card titles (24 → 34 px fluid) */
    h4: compose(
      fontSize["3xl"],
      leading.normal,
      tracking.snug,
      fontWeight.semibold,
    ),
    /** Inline / list headings (18 → 20 px fluid) */
    h5: compose(
      fontSize.xl,
      leading.relaxed,
      tracking.normal,
      fontWeight.semibold,
    ),
    /** Eyebrow / micro label — UPPERCASE, wide tracking */
    h6: compose(
      fontSize.xs,
      leading.loose,
      tracking.eyebrow,
      fontWeight.semibold,
      "uppercase",
    ),
  },

  text: {
    /** Lead paragraph — sits beneath an h1 / h2 (16 → 18 px) */
    p1: compose(
      fontSize.lg,
      leading.prose,
      tracking.body,
      fontWeight.regular,
    ),
    /** Default body copy (15 → 16 px) */
    p2: compose(
      fontSize.md,
      leading.body,
      tracking.body,
      fontWeight.regular,
    ),
    /** Caption / meta (13 → 14 px) */
    p3: compose(
      fontSize.sm,
      leading.loose,
      tracking.normal,
      fontWeight.regular,
    ),
  },

  /** Eyebrow label — UPPERCASE chip-style intro for sections */
  eyebrow: compose(
    fontSize.xs,
    leading.none,
    tracking.eyebrow,
    fontWeight.semibold,
    "uppercase",
  ),

  /** Form / button labels — short, single-line, semi-bold */
  label: compose(
    fontSize.sm,
    leading.none,
    tracking.normal,
    fontWeight.semibold,
  ),

  /** Inline monospace — code, keys, file paths */
  mono: compose(
    fontSize.sm,
    leading.normal,
    tracking.normal,
    fontWeight.medium,
    "font-mono",
  ),
} as const;

export type HeadingVariant = keyof typeof typography.heading;
export type TextVariant = keyof typeof typography.text;
