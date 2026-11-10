"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface ArnabCharacterProps {
  className?: string;
  /** Accessible description. Pass an empty string when purely decorative. */
  title?: string;
}

const loop = (duration: number, delay = 0) =>
  ({
    duration,
    delay,
    repeat: Number.POSITIVE_INFINITY,
    ease: "easeInOut",
  }) as const;

const SKIN = "#d59d6c";
const SKIN_SHADE = "#b97b4d";
const HAIR = "#1d1826";
const HAIR_LIGHT = "#3b3050";
const INK = "#15121c";
const SHELL = "#f7f5fc";
const SHELL_SHADE = "#d9d3ea";

/**
 * Arnab, waist-up, headset on, mid-game with a controller.
 *
 * Hand-built vector so it stays sharp at any size, weighs a few KB, and can
 * be animated part by part (blink, thumbs, button presses, light bar) without
 * a Lottie runtime. No SVG filters are used: every moving part is a plain
 * transform or opacity change.
 */
export function ArnabCharacter({
  className,
  title = "Illustration of Arnab wearing a headset and playing on a game controller",
}: ArnabCharacterProps) {
  const reduce = useReducedMotion();
  const still = Boolean(reduce);

  return (
    <svg
      viewBox="0 0 480 520"
      className={cn("h-auto w-full overflow-visible", className)}
      role={title ? "img" : "presentation"}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="arnab-hoodie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3350" />
          <stop offset="0.5" stopColor="#262033" />
          <stop offset="1" stopColor="#15111d" />
        </linearGradient>
        <linearGradient id="arnab-sleeve" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f3757" />
          <stop offset="1" stopColor="#1d1828" />
        </linearGradient>
        <radialGradient id="arnab-face" cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#e3b081" />
          <stop offset="0.7" stopColor={SKIN} />
          <stop offset="1" stopColor="#c58a5b" />
        </radialGradient>
        <linearGradient id="arnab-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={SHELL_SHADE} />
        </linearGradient>
        <radialGradient id="arnab-lightbar" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e9d5ff" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <clipPath id="arnab-face-clip">
          <ellipse cx="240" cy="172" rx="80" ry="86" />
        </clipPath>
      </defs>

      {/* ---------- Body ---------- */}
      <ellipse cx="240" cy="288" rx="86" ry="30" fill="#110e18" />
      <path
        d="M112 520c-4-92 8-190 62-224l26-12h80l26 12c54 34 66 132 62 224Z"
        fill="url(#arnab-hoodie)"
      />
      {/* centre seam + pocket line give the hoodie some structure */}
      <path
        d="M240 306v214M176 520c2-34 12-58 28-72M304 520c-2-34-12-58-28-72"
        fill="none"
        stroke="#0b0910"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* neck + tee */}
      <path d="M212 236h56v48c-16 16-40 16-56 0Z" fill={SKIN_SHADE} />
      <path d="M204 280c18 22 54 22 72 0l8 6c-22 34-66 34-88 0Z" fill="#a855f7" />
      <path
        d="M196 286c-4 18-4 34 2 52M284 286c4 18 4 34-2 52"
        stroke="#d8b4fe"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="198" cy="342" r="5" fill="#d8b4fe" />
      <circle cx="282" cy="342" r="5" fill="#d8b4fe" />

      {/* ---------- Head ---------- */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 92%" }}
        animate={still ? undefined : { rotate: [-2.2, 2.2, -2.2] }}
        transition={loop(5.2)}
      >
        {/* hair, back volume */}
        <path
          d="M150 190c-20-74 14-152 90-156 78-4 112 78 90 156-10 18-170 18-180 0Z"
          fill={HAIR}
        />
        <ellipse cx="240" cy="172" rx="80" ry="86" fill="url(#arnab-face)" />
        {/* shadow cast by the fringe */}
        <g clipPath="url(#arnab-face-clip)">
          <path
            d="M150 150c30-14 60 14 92-2 26 14 62-6 90 6v-70H150Z"
            fill={SKIN_SHADE}
            opacity="0.55"
          />
          <ellipse cx="192" cy="214" rx="17" ry="11" fill="#ff7fb5" opacity="0.34" />
          <ellipse cx="288" cy="214" rx="17" ry="11" fill="#ff7fb5" opacity="0.34" />
        </g>

        {/* hair: fluffy top + fringe tufts */}
        <g fill={HAIR}>
          <circle cx="182" cy="82" r="34" />
          <circle cx="226" cy="58" r="38" />
          <circle cx="276" cy="64" r="36" />
          <circle cx="312" cy="100" r="30" />
          <circle cx="160" cy="124" r="26" />
          <path d="M152 174c-8-58 20-104 88-106 68-2 98 44 88 106-6-20-14-32-26-40-10 14-28 20-48 16 4-8 6-16 4-24-14 22-42 30-68 24 6-8 8-16 8-24-22 8-38 26-46 48Z" />
        </g>
        <g fill={HAIR_LIGHT} opacity="0.55">
          <path d="M196 62c14-14 38-18 56-10-20 0-38 6-52 20Z" />
          <path d="M264 58c18 2 34 12 42 28-12-12-26-18-44-20Z" />
          <path d="M172 104c4-12 12-22 24-28-8 10-12 20-14 34Z" />
        </g>

        {/* headset band over the hair */}
        <path
          d="M140 182C128 20 352 20 340 182"
          fill="none"
          stroke={SHELL}
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M150 150C150 44 330 44 330 150"
          fill="none"
          stroke={SHELL_SHADE}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* ear cups */}
        <rect x="120" y="146" width="44" height="76" rx="20" fill={SHELL} />
        <rect x="128" y="156" width="28" height="56" rx="14" fill="#a855f7" />
        <rect x="134" y="164" width="9" height="26" rx="4.5" fill="#d8b4fe" />
        <rect x="316" y="146" width="44" height="76" rx="20" fill={SHELL} />
        <rect x="324" y="156" width="28" height="56" rx="14" fill="#a855f7" />
        <rect x="330" y="164" width="9" height="26" rx="4.5" fill="#d8b4fe" />
        {/* mic boom */}
        <path
          d="M136 214c2 26 22 40 52 38"
          fill="none"
          stroke={INK}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <rect x="184" y="243" width="22" height="16" rx="8" fill={INK} />

        {/* brows */}
        <path
          d="M192 148q17-9 34-2M254 146q17-7 34 2"
          fill="none"
          stroke={HAIR}
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* eyes (blink) */}
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
          animate={still ? undefined : { scaleY: [1, 1, 0.08, 1, 1] }}
          transition={{
            duration: 4.6,
            times: [0, 0.9, 0.94, 0.98, 1],
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <ellipse cx="210" cy="180" rx="6.5" ry="8" fill={INK} />
          <ellipse cx="270" cy="180" rx="6.5" ry="8" fill={INK} />
          <circle cx="212.5" cy="177" r="2.2" fill="#ffffff" />
          <circle cx="272.5" cy="177" r="2.2" fill="#ffffff" />
        </motion.g>
        {/* glasses */}
        <g fill="none" stroke={INK} strokeWidth="6" strokeLinejoin="round">
          <rect x="182" y="160" width="54" height="40" rx="12" fill="#ffffff" fillOpacity="0.16" />
          <rect x="244" y="160" width="54" height="40" rx="12" fill="#ffffff" fillOpacity="0.16" />
          <path d="M236 174q4-5 8 0" strokeLinecap="round" />
          <path d="M182 172l-18-4M298 172l18-4" strokeLinecap="round" />
        </g>
        <path
          d="M191 170l10-6M253 170l10-6"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.75"
        />
        {/* nose + grin */}
        <path
          d="M238 202q5 10-5 12"
          fill="none"
          stroke={SKIN_SHADE}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M216 226q24 22 48 0q-24 8-48 0Z" fill="#5a2a1f" />
        <path d="M222 229q18 6 36 0q-18 9-36 0Z" fill="#ffffff" />
      </motion.g>

      {/* ---------- Arms + controller ----------
          We see the pad from behind, the way you would facing someone who is
          playing: triggers and bumpers along the top edge, the light bar
          between them, the back shell, and fingers wrapped round the grips.
          Thumbs are out of sight on the far side. */}
      <ellipse cx="240" cy="506" rx="118" ry="13" fill="#0b0910" opacity="0.4" />
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 40%" }}
        animate={still ? undefined : { rotate: [-2.5, 2.5, -2.5], y: [0, -3, 0] }}
        transition={loop(3.4)}
      >
        {/* sleeves: shoulder, elbow out, wrist at the outside of each grip */}
        <path
          d="M152 318c-40 28-66 82-56 126"
          fill="none"
          stroke="url(#arnab-sleeve)"
          strokeWidth="46"
          strokeLinecap="round"
        />
        <path
          d="M328 318c40 28 66 82 56 126"
          fill="none"
          stroke="url(#arnab-sleeve)"
          strokeWidth="46"
          strokeLinecap="round"
        />
        {/* cuffs */}
        <path d="M94 434l3 16M386 434l-3 16" fill="none" stroke="#a855f7" strokeWidth="48" />

        {/* light bar glow, thrown up onto the hoodie */}
        <motion.ellipse
          cx="240"
          cy="368"
          rx="86"
          ry="26"
          fill="url(#arnab-lightbar)"
          animate={still ? undefined : { opacity: [0.35, 1, 0.35] }}
          transition={loop(2.2)}
        />

        {/* triggers sit behind the top edge and dip when pressed */}
        <motion.rect
          x="152"
          y="350"
          width="58"
          height="36"
          rx="13"
          fill="#2f2940"
          animate={still ? undefined : { y: [350, 355, 350, 350] }}
          transition={{ duration: 1.6, times: [0, 0.18, 0.4, 1], repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.rect
          x="270"
          y="350"
          width="58"
          height="36"
          rx="13"
          fill="#2f2940"
          animate={still ? undefined : { y: [350, 350, 355, 350] }}
          transition={{ duration: 1.6, times: [0, 0.5, 0.68, 1], repeat: Number.POSITIVE_INFINITY }}
        />

        {/* back shell */}
        <path
          d="M134 404c0-22 18-32 44-32h124c26 0 44 10 44 32l14 74c6 30-28 44-44 16l-14-26H178l-14 26c-16 28-50 14-44-16Z"
          fill="url(#arnab-shell)"
        />
        {/* underside turning away from the light: this is what gives it depth */}
        <path
          d="M178 468h124l14 26c16 28 50 14 44-16l-5-26c4 26-22 36-35 14l-13-24H173l-13 24c-13 22-39 12-35-14l-5 26c-6 30 28 44 44 16Z"
          fill="#b9add6"
        />
        {/* top edge catching the light */}
        <path
          d="M146 388c6-12 18-16 32-16h124c14 0 26 4 32 16-10-5-20-7-32-7H178c-12 0-22 2-32 7Z"
          fill="#ffffff"
        />
        {/* bumpers */}
        <rect x="148" y="368" width="66" height="15" rx="7.5" fill={INK} />
        <rect x="266" y="368" width="66" height="15" rx="7.5" fill={INK} />
        {/* light bar */}
        <rect x="219" y="370" width="42" height="10" rx="5" fill="#c084fc" />
        <rect x="224" y="372" width="32" height="3" rx="1.5" fill="#f3e8ff" />
        {/* back plate: recess, seam, screws, port */}
        <rect x="204" y="398" width="72" height="34" rx="11" fill="#e4ddf3" />
        <rect x="204" y="398" width="72" height="6" rx="3" fill="#d2c8ea" />
        <path
          d="M180 452c22-8 98-8 120 0"
          fill="none"
          stroke="#cfc5e8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="188" cy="414" r="3.2" fill="#b9add6" />
        <circle cx="292" cy="414" r="3.2" fill="#b9add6" />
        <rect x="232" y="440" width="16" height="6" rx="3" fill="#b9add6" />

        {/* ---------- Left hand (viewer's left) ---------- */}
        {/* back of the hand, tucked against the outside of the grip */}
        <path d="M100 420c-8 20-6 46 8 62 14 8 26 2 30-12l2-52c-12-10-30-10-40 2Z" fill={SKIN} />
        <path d="M104 470c6 10 18 14 28 8" fill="none" stroke={SKIN_SHADE} strokeWidth="3" strokeLinecap="round" />
        {/* three fingers wrap the grip; each has a darker edge so they read apart */}
        <g fill="none" strokeLinecap="round">
          <path d="M122 472l40 2" stroke={SKIN_SHADE} strokeWidth="21" />
          <path d="M122 471l40 2" stroke={SKIN} strokeWidth="17" />
          <path d="M120 451l50-2" stroke={SKIN_SHADE} strokeWidth="22" />
          <path d="M120 450l50-2" stroke={SKIN} strokeWidth="18" />
          <path d="M122 430l52-6" stroke={SKIN_SHADE} strokeWidth="22" />
          <path d="M122 429l52-6" stroke={SKIN} strokeWidth="18" />
        </g>
        {/* knuckle creases */}
        <path
          d="M146 420v10M144 443v10M142 465v9"
          fill="none"
          stroke={SKIN_SHADE}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* index finger reaches over the top onto the trigger */}
        <motion.g
          animate={still ? undefined : { y: [0, 5, 0, 0] }}
          transition={{ duration: 1.6, times: [0, 0.18, 0.4, 1], repeat: Number.POSITIVE_INFINITY }}
        >
          <path d="M116 412c4-28 24-46 58-50" fill="none" stroke={SKIN_SHADE} strokeWidth="22" strokeLinecap="round" />
          <path d="M116 411c4-28 24-46 58-50" fill="none" stroke={SKIN} strokeWidth="18" strokeLinecap="round" />
          <path d="M146 372l4 9" fill="none" stroke={SKIN_SHADE} strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
        </motion.g>

        {/* ---------- Right hand ---------- */}
        <path d="M380 420c8 20 6 46-8 62-14 8-26 2-30-12l-2-52c12-10 30-10 40 2Z" fill={SKIN} />
        <path d="M376 470c-6 10-18 14-28 8" fill="none" stroke={SKIN_SHADE} strokeWidth="3" strokeLinecap="round" />
        <g fill="none" strokeLinecap="round">
          <path d="M358 472l-40 2" stroke={SKIN_SHADE} strokeWidth="21" />
          <path d="M358 471l-40 2" stroke={SKIN} strokeWidth="17" />
          <path d="M360 451l-50-2" stroke={SKIN_SHADE} strokeWidth="22" />
          <path d="M360 450l-50-2" stroke={SKIN} strokeWidth="18" />
          <path d="M358 430l-52-6" stroke={SKIN_SHADE} strokeWidth="22" />
          <path d="M358 429l-52-6" stroke={SKIN} strokeWidth="18" />
        </g>
        <path
          d="M334 420v10M336 443v10M338 465v9"
          fill="none"
          stroke={SKIN_SHADE}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.7"
        />
        <motion.g
          animate={still ? undefined : { y: [0, 0, 5, 0] }}
          transition={{ duration: 1.6, times: [0, 0.5, 0.68, 1], repeat: Number.POSITIVE_INFINITY }}
        >
          <path d="M364 412c-4-28-24-46-58-50" fill="none" stroke={SKIN_SHADE} strokeWidth="22" strokeLinecap="round" />
          <path d="M364 411c-4-28-24-46-58-50" fill="none" stroke={SKIN} strokeWidth="18" strokeLinecap="round" />
          <path d="M334 372l-4 9" fill="none" stroke={SKIN_SHADE} strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
